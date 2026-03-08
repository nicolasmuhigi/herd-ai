from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import logging
import os
from threading import Lock

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Livestock Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_INPUT_SIZE = 192
CLASS_LABELS = ["FOOT_AND_MOUTH", "HEALTHY", "LUMPY_SKIN", "MASTITIS"]
MODEL_PATH = os.getenv("MODEL_PATH", "/app/cattle_model.keras")
MODEL_PATH_CANDIDATES = [
    MODEL_PATH,
    "./cattle_model.keras",
    "../cattle_model.keras",
    "/opt/render/project/src/cattle_model.keras",
    "/opt/render/project/src/huggingface-space/cattle_model.keras",
]

model = None
model_load_error = None
model_lock = Lock()
inference_lock = Lock()


def summarize_error(error: Exception, max_len: int = 800) -> str:
    text = str(error).replace("\n", " ").strip()
    if len(text) <= max_len:
        return text
    return f"{text[:max_len]}... [truncated]"


def resolve_model_path() -> str:
    for candidate in MODEL_PATH_CANDIDATES:
        if os.path.exists(candidate):
            if os.path.getsize(candidate) == 0:
                raise RuntimeError(f"Model file at {candidate} is empty")
            logger.info("Using model path: %s", candidate)
            return candidate

    raise RuntimeError(
        "Model file not found. Checked: " + ", ".join(MODEL_PATH_CANDIDATES)
    )


def get_model():
    global model, model_load_error

    if model is not None:
        return model

    with model_lock:
        if model is not None:
            return model

        if model_load_error is not None:
            raise RuntimeError(model_load_error)

        try:
            logger.info("Loading cattle disease model...")
            model_path = resolve_model_path()

            import tensorflow as tf

            class CompatibleRandomFlip(tf.keras.layers.RandomFlip):
                def __init__(self, *args, data_format=None, **kwargs):
                    super().__init__(*args, **kwargs)

            class CompatibleRandomRotation(tf.keras.layers.RandomRotation):
                def __init__(self, *args, data_format=None, **kwargs):
                    super().__init__(*args, **kwargs)

            class CompatibleRandomZoom(tf.keras.layers.RandomZoom):
                def __init__(self, *args, data_format=None, **kwargs):
                    super().__init__(*args, **kwargs)

            custom_objects = {
                "RandomFlip": CompatibleRandomFlip,
                "RandomRotation": CompatibleRandomRotation,
                "RandomZoom": CompatibleRandomZoom,
            }

            # Inference-only load avoids training-state deserialization issues.
            model = tf.keras.models.load_model(
                model_path,
                compile=False,
                custom_objects=custom_objects,
            )
            logger.info("Model loaded successfully")
            return model
        except Exception as e:
            model_load_error = summarize_error(e)
            logger.exception("Failed to load model")
            raise


@app.get("/")
async def root():
    return {
        "message": "Livestock Disease Detection API",
        "status": "online",
        "model_loaded": model is not None,
        "classes": CLASS_LABELS,
        "input_size": MODEL_INPUT_SIZE,
        "model_source": "local_file",
        "model_path": MODEL_PATH,
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_error": model_load_error,
        "classes": CLASS_LABELS,
        "input_size": MODEL_INPUT_SIZE,
        "model_source": "local_file",
        "model_path": MODEL_PATH,
    }


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE))
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        logger.error("Image preprocessing error: %s", e)
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        model_instance = get_model()

        if file is None or not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")

        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        processed_image = preprocess_image(image_bytes)

        with inference_lock:
            predictions = model_instance.predict(processed_image, verbose=0)

        scores = np.asarray(predictions).astype(np.float32).reshape(-1).tolist()
        if len(scores) < len(CLASS_LABELS):
            raise RuntimeError(
                f"Model returned {len(scores)} scores but expected at least {len(CLASS_LABELS)}"
            )
        scores = scores[: len(CLASS_LABELS)]

        class_scores = {label: float(score) for label, score in zip(CLASS_LABELS, scores)}
        max_score = max(scores)
        max_index = scores.index(max_score)
        detected_disease = CLASS_LABELS[max_index]

        return {
            "success": True,
            "predictions": {
                "healthy": class_scores.get("HEALTHY", 0.0),
                "footAndMouth": class_scores.get("FOOT_AND_MOUTH", 0.0),
                "lumpySkin": class_scores.get("LUMPY_SKIN", 0.0),
                "anthrax": class_scores.get("MASTITIS", 0.0),
                "classLabels": CLASS_LABELS,
                "classScores": class_scores,
                "detectedDisease": detected_disease,
                "confidence": float(max_score),
            },
        }
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Model unavailable: {str(e)}")
    except Exception as e:
        logger.exception("Unexpected prediction error")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)
