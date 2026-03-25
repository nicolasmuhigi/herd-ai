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
DEFAULT_CLASS_LABELS = ["FOOT_AND_MOUTH", "HEALTHY", "LUMPY_SKIN", "MASTITIS"]


def resolve_class_labels() -> list[str]:
    raw = os.getenv("MODEL_CLASS_LABELS", "")
    if raw.strip():
        labels = [part.strip().upper() for part in raw.split(",") if part.strip()]
        if labels:
            return labels
    return DEFAULT_CLASS_LABELS


CLASS_LABELS = resolve_class_labels()
MODEL_PATH_CANDIDATES = [
    "../cattle_model.keras",
    "cattle_model.keras",
    "./cattle_model.keras",
    "../cattle_model.keras",
    "cattle_model.keras",

# --- Model auto-download logic ---
import os
import requests

MODEL_PATH = "cattle_model.keras"
MODEL_URL = os.environ.get("MODEL_URL")

if MODEL_URL and not os.path.exists(MODEL_PATH):
    print(f"Downloading model from {MODEL_URL}...")
    r = requests.get(MODEL_URL)
    with open(MODEL_PATH, "wb") as f:
        f.write(r.content)
    print("Model downloaded.")
]

model = None
model_load_error = None
loaded_model_path = None
loaded_model_size_bytes = None
model_has_rescaling = None
model_lock = Lock()
inference_lock = Lock()


def summarize_error(error: Exception, max_len: int = 800) -> str:
    text = str(error).replace("\n", " ").strip()
    if len(text) <= max_len:
        return text
    return f"{text[:max_len]}... [truncated]"


def download_model_from_url(url: str, dest_path: str) -> None:
    """Download model from URL if not already present."""
    import requests
    logger.info(f"Downloading model from {url}...")
    response = requests.get(url, stream=True, timeout=300)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    downloaded = 0
    
    with open(dest_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0 and downloaded % (10 * 1024 * 1024) == 0:  # Log every 10MB
                    logger.info(f"Downloaded {downloaded / 1e6:.1f} MB / {total_size / 1e6:.1f} MB")
    
    logger.info(f"Model download complete: {downloaded / 1e6:.1f} MB")


def resolve_model_path() -> str:
    """Find the model file from candidate paths, download if needed."""
    # Check if MODEL_URL is set and model doesn't exist
    model_url = os.getenv("MODEL_URL", "").strip()
    if model_url:
        primary_dest = MODEL_PATH_CANDIDATES[0]
        if not os.path.exists(primary_dest):
            try:
                logger.info(f"Model not found locally, downloading from MODEL_URL...")
                download_model_from_url(model_url, primary_dest)
            except Exception as e:
                logger.error(f"Failed to download model from URL: {e}")
                raise RuntimeError(f"Model download failed: {summarize_error(e)}")
    
    for candidate in MODEL_PATH_CANDIDATES:
        if os.path.exists(candidate):
            size = os.path.getsize(candidate)
            if size == 0:
                raise RuntimeError(f"Model file at {candidate} is empty")
            logger.info(f"Using model path: {candidate} ({size / 1e6:.1f} MB)")
            return candidate
    raise RuntimeError(f"Model not found. Checked: {', '.join(MODEL_PATH_CANDIDATES)}")


def infer_model_input_size(loaded_model) -> int:
    """Infer square input size from model.input_shape; fallback to existing default."""
    shape = getattr(loaded_model, "input_shape", None)
    if not shape:
        return MODEL_INPUT_SIZE

    if isinstance(shape, (list, tuple)) and len(shape) > 0 and isinstance(shape[0], (list, tuple)):
        shape = shape[0]

    if not isinstance(shape, (list, tuple)) or len(shape) < 3:
        return MODEL_INPUT_SIZE

    height = shape[1]
    width = shape[2]
    if isinstance(height, int) and isinstance(width, int) and height > 0 and width > 0 and height == width:
        return height

    return MODEL_INPUT_SIZE


def get_model():
    global model, model_load_error, loaded_model_path, loaded_model_size_bytes, model_has_rescaling, MODEL_INPUT_SIZE

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
            loaded_model_path = os.path.abspath(model_path)
            loaded_model_size_bytes = os.path.getsize(model_path)

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

            model = tf.keras.models.load_model(
                model_path,
                compile=False,
                custom_objects=custom_objects,
            )

            MODEL_INPUT_SIZE = infer_model_input_size(model)

            def has_rescaling_layer(layer, visited: set[int] | None = None) -> bool:
                if visited is None:
                    visited = set()
                if id(layer) in visited:
                    return False
                visited.add(id(layer))

                if layer.__class__.__name__ == "Rescaling":
                    return True

                nested_layers = getattr(layer, "layers", None)
                if not nested_layers:
                    return False

                for nested in nested_layers:
                    if has_rescaling_layer(nested, visited):
                        return True
                return False

            model_has_rescaling = has_rescaling_layer(model)
            logger.info("Model loaded successfully")
            logger.info("Using model input size: %s", MODEL_INPUT_SIZE)
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
        "model_path": loaded_model_path,
        "model_size_bytes": loaded_model_size_bytes,
        "classes": CLASS_LABELS,
        "input_size": MODEL_INPUT_SIZE,
        "model_source": "local_file",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_error": model_load_error,
        "model_path": loaded_model_path,
        "model_size_bytes": loaded_model_size_bytes,
        "classes": CLASS_LABELS,
        "input_size": MODEL_INPUT_SIZE,
        "model_source": "local_file",
    }


def preprocess_image(image_bytes: bytes, normalize: bool) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE))
        img_array = np.array(image, dtype=np.float32)
        if normalize:
            img_array = img_array / 255.0
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

        # Upload image to Supabase Storage using REST API
        import time
        import requests
        ext = os.path.splitext(file.filename)[1] or '.jpg'
        unique_filename = f"{int(time.time() * 1000)}_{file.filename}"

        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise HTTPException(status_code=500, detail="Supabase credentials not set in environment variables")
        bucket = "uploads"
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{unique_filename}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": file.content_type or "application/octet-stream",
            "x-upsert": "true"
        }
        upload_response = requests.post(upload_url, headers=headers, data=image_bytes)
        if upload_response.status_code in (200, 201):
            image_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{unique_filename}"
        else:
            raise HTTPException(status_code=500, detail=f"Supabase upload failed: {upload_response.text}")

        normalize_input = not bool(model_has_rescaling)
        processed_image = preprocess_image(image_bytes, normalize=normalize_input)

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
            "imageUrl": image_url,
            "predictions": {
                "healthy": class_scores.get("HEALTHY", 0.0),
                "footAndMouth": class_scores.get("FOOT_AND_MOUTH", 0.0),
                "lumpySkin": class_scores.get("LUMPY_SKIN", 0.0),
                # Legacy client field name: keep 'anthrax' populated from either class.
                "anthrax": class_scores.get("ANTHRAX", class_scores.get("MASTITIS", 0.0)),
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
    try:
        port = int(os.environ.get("PORT", 8000))
        logger.info(f"Starting server on 0.0.0.0:{port} (Render expects PORT env)")
        uvicorn.run(app, host="0.0.0.0", port=port)
    except Exception as e:
        logger.exception("Fatal error during startup: %s", e)
