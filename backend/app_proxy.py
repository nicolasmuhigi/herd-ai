"""
Lightweight Livestock AI Platform Backend - Proxy Mode
Forwards inference requests to Hugging Face Space API
No local model loading - much faster deployment!
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Livestock Disease Detection API - Proxy Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hugging Face Space API URL (set via environment variable)
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "").strip()
if not HF_SPACE_URL:
    logger.warning("HF_SPACE_URL not set. Set it to your Hugging Face Space URL.")

DEFAULT_CLASS_LABELS = ["FOOT_AND_MOUTH", "HEALTHY", "LUMPY_SKIN", "MASTITIS"]


def get_hf_base_url(url: str) -> str:
    normalized = url.strip().rstrip("/")
    if normalized.endswith("/predict"):
        return normalized[:-len("/predict")]
    return normalized


def get_hf_predict_url(url: str) -> str:
    base = get_hf_base_url(url)
    return f"{base}/predict"


@app.get("/")
async def root():
    return {
        "message": "Livestock Disease Detection API",
        "status": "online",
        "mode": "proxy",
        "hf_space_url": HF_SPACE_URL if HF_SPACE_URL else "not_configured",
        "classes": DEFAULT_CLASS_LABELS,
    }


@app.get("/health")
async def health_check():
    """Check health of this service and the HF Space"""
    status = {
        "status": "healthy",
        "mode": "proxy",
        "hf_space_configured": bool(HF_SPACE_URL),
        "hf_space_url": HF_SPACE_URL if HF_SPACE_URL else None,
    }
    
    # Try to ping the HF Space if configured
    if HF_SPACE_URL:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(20.0, connect=10.0)) as client:
                hf_health_url = f"{get_hf_base_url(HF_SPACE_URL)}/health"
                response = await client.get(hf_health_url)
                if response.status_code == 200:
                    hf_status = response.json()
                    status["hf_space_status"] = "healthy"
                    status["hf_model_loaded"] = hf_status.get("model_loaded", False)
                else:
                    status["hf_space_status"] = f"unhealthy (HTTP {response.status_code})"
        except Exception as e:
            status["hf_space_status"] = f"error: {str(e)}"
    
    return status


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Proxy prediction request to Hugging Face Space
    """
    if not HF_SPACE_URL:
        raise HTTPException(
            status_code=503,
            detail="HF_SPACE_URL not configured. Set environment variable to your Hugging Face Space predict endpoint."
        )
    
    try:
        if file is None or not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        # Read the uploaded file
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        logger.info(f"Forwarding prediction request to HF Space: {file.filename}")
        
        # Forward to Hugging Face Space
        # First call can be slow because HF Space may need to wake and load model.
        timeout = httpx.Timeout(240.0, connect=20.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            files = {"file": (file.filename, image_bytes, file.content_type or "image/jpeg")}
            
            # Make request to HF Space
            hf_url = get_hf_predict_url(HF_SPACE_URL)
            response = await client.post(hf_url, files=files)
            
            # Check response
            if response.status_code != 200:
                logger.error(f"HF Space returned error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Model API error: {response.text}"
                )
            
            # Parse HF Space response
            hf_result = response.json()
            
            # Transform response to match frontend expectations
            if hf_result.get("success"):
                # HF Space returns: {success, prediction, confidence, probabilities}
                # Frontend expects: {success, predictions: {healthy, footAndMouth, lumpySkin, anthrax}}
                
                class_scores = hf_result.get("probabilities", {})
                detected_disease = hf_result.get("prediction", "UNKNOWN")
                confidence = hf_result.get("confidence", 0.0)
                
                return {
                    "success": True,
                    "predictions": {
                        "healthy": class_scores.get("HEALTHY", 0.0),
                        "footAndMouth": class_scores.get("FOOT_AND_MOUTH", 0.0),
                        "lumpySkin": class_scores.get("LUMPY_SKIN", 0.0),
                        "anthrax": class_scores.get("MASTITIS", 0.0),  # Legacy field name
                        "classLabels": DEFAULT_CLASS_LABELS,
                        "classScores": class_scores,
                        "detectedDisease": detected_disease,
                        "confidence": float(confidence),
                    },
                }
            else:
                # HF Space returned error
                raise HTTPException(
                    status_code=500,
                    detail=hf_result.get("detail", "Prediction failed")
                )
                
    except HTTPException:
        raise
    except httpx.TimeoutException:
        logger.error("HF Space request timed out")
        raise HTTPException(status_code=504, detail="Model API timeout")
    except Exception as e:
        logger.exception("Unexpected error during prediction proxy")
        raise HTTPException(status_code=500, detail=f"Prediction proxy failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
