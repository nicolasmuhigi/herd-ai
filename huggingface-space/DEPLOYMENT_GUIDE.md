# Hugging Face Deployment Guide

## Step 1: Create Hugging Face Account & Space

1. Go to [https://huggingface.co/join](https://huggingface.co/join) and create an account
2. Click **"New Space"** from your profile
3. **Space name:** `livestock-disease-detection` (or any name you prefer)
4. **License:** MIT
5. **SDK:** Docker
6. **Hardware:** CPU basic (free tier) - you can upgrade to GPU if needed later
7. Click **"Create Space"**

## Step 2: Upload Files to Hugging Face

You have two options:

### Option A: Via Git (Recommended)

```bash
# Navigate to the huggingface-space folder
cd huggingface-space

# Initialize git (if not already)
git init

# Add Hugging Face remote (replace YOUR_USERNAME and SPACE_NAME)
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/SPACE_NAME

# Configure Git LFS for large files (required for .keras file)
git lfs install
git lfs track "*.keras"
git add .gitattributes

# Add all files
git add .

# Commit
git commit -m "Initial commit: Livestock disease detection API"

# Push to Hugging Face
git push hf main
```

### Option B: Via Web Interface

1. Go to your Space page
2. Click **"Files"** tab
3. Click **"Add file"** → **"Upload files"**
4. Upload these files:
   - `app.py`
   - `requirements.txt`
   - `README.md`
   - `Dockerfile`
   - `cattle_model.keras` (this will take a few minutes - it's 404MB)
5. Click **"Commit new files"**

## Step 3: Wait for Build

- Hugging Face will automatically build your Docker container
- This takes 5-15 minutes for the first build
- Watch the logs in the **"Logs"** tab
- When you see "Application startup complete" - it's ready!

## Step 4: Get Your API URL

Once deployed, your API URL will be:
```
https://YOUR_USERNAME-SPACE_NAME.hf.space/predict
```

Example: `https://nickmuhigi-livestock-disease-detection.hf.space/predict`

## Step 5: Update Vercel Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `HF_MODEL_API_URL`
   - **Value:** `https://YOUR_USERNAME-SPACE_NAME.hf.space/predict`
   - **Environment:** Production, Preview, Development
3. Click **"Save"**
4. **Redeploy** your Vercel project

## Step 6: Test Your API

```bash
# Test the HF API directly
curl -X POST "https://YOUR_USERNAME-SPACE_NAME.hf.space/predict" \
  -F "file=@path/to/cattle_image.jpg"

# Expected response:
# {
#   "success": true,
#   "predictions": {
#     "healthy": 0.05,
#     "footAndMouth": 0.85,
#     "lumpySkin": 0.08,
#     "anthrax": 0.02,
#     "detectedDisease": "FOOT_AND_MOUTH",
#     "confidence": 0.85
#   }
# }
```

## Troubleshooting

### Build Fails
- Check the **"Logs"** tab for specific errors
- Most common: Missing dependencies in `requirements.txt`

### Model Not Loading
- Ensure `cattle_model.keras` was uploaded correctly (404MB)
- Check logs for TensorFlow errors

### API Returns 503
- Model is still loading (wait 1-2 minutes)
- Check **"Logs"** tab for startup errors

### CORS Errors from Your App
- The FastAPI app is configured to allow all origins (`allow_origins=["*"]`)
- For production, update `app.py` line 14 to only allow your domain

## Upgrading to GPU (Optional)

If inference is slow (>5 seconds):
1. Go to your Space **Settings**
2. Under **"Hardware"**, select **"T4 small"** (GPU)
3. This costs $0.60/hour but only when the Space is running
4. HF Spaces auto-sleep after 48 hours of inactivity (free on paid tier)

## Cost Estimate

- **CPU (free tier):** $0/month - inference takes 2-5 seconds
- **GPU T4 small:** ~$0.60/hour - inference takes <1 second
  - With auto-sleep: ~$15-30/month for moderate usage

---

## Next Steps After Deployment

1. Test upload from your deployed Vercel app
2. Monitor API response times
3. Consider adding API key authentication to your HF Space
4. Set up monitoring/alerting for API downtime
