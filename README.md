# Herd AI: Livestock Health Management Platform

## Overview
Herd AI is a full-stack web platform for livestock disease screening, vet booking, and herd health tracking. It uses AI-powered image analysis, persistent cloud storage, and robust authentication to deliver a seamless experience for farmers and veterinarians.

## How the App Works
- **User Flow:**
  1. Users sign up and log in.
  2. Upload cattle images for disease analysis.
  3. Images are sent to the backend, which uploads them to Supabase Storage.
  4. Backend returns a public URL for each image.
  5. Frontend displays images using these URLs everywhere (dashboard, results, vet review).
  6. Analysis results and image URLs are stored in PostgreSQL for history and vet review.
  7. Users can book appointments with vets, view history, and chat with AI assistant.

- **Image Analysis:**
  - Images are analyzed using a TensorFlow/Keras model, served via Hugging Face Space or FastAPI proxy.
  - Results include disease prediction, confidence, and probability scores.

- **History Management:**
  - Analyses history is fetched from the database and displayed with filtering/search.
  - Users can delete all history via a dedicated button (calls DELETE API).

## Technologies Used
- **Frontend:** Next.js (App Router)
- **Backend:** FastAPI (Python), Next.js API routes (Node.js)
- **Model Inference:** TensorFlow/Keras, Hugging Face Space, FastAPI proxy
- **Storage:** Supabase Storage (persistent, free)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT
- **Deployment:** Render (Blueprint for frontend/backend/db), Hugging Face Space (model API)
- **Other:** Docker (for model API), PowerShell/Bash scripts, Prisma migrations

## APIs
- `/api/analyze`: Image analysis (calls model API, stores results)
- `/api/analyses`: Fetch and delete analyses history (GET, DELETE)
- `/api/auth/signup`: User registration
- `/api/auth/login`: User login
- `/api/chat`: Gemini AI chat
- `/api/health`: Health check endpoint
- FastAPI backend: `/predict`, `/health`, `/` (model info)

## Deployment
- **Render Blueprint:**
  - Frontend: Next.js app
  - Backend: FastAPI proxy
  - Database: Managed PostgreSQL
  - All services defined in `render.yaml`

- **Hugging Face Space:**
  - Dockerized FastAPI model API
  - Model file (`cattle_model.keras`) uploaded to Space
  - API URL used in frontend/backend env vars

- **Setup Steps:**
  1. Clone repo, install dependencies (`npm install`, `pip install -r requirements.txt`)
  2. Create `.env.local` with all required secrets and API URLs
  3. Run Prisma migrations (`npx prisma generate`, `npx prisma migrate dev`)
  4. Start frontend (`npm run dev`) and backend (`uvicorn app:app`)
  5. Deploy to Render using `render.yaml`
  6. Deploy model API to Hugging Face Space

## Repository Structure
- `app/`: Next.js pages and API routes
- `components/`: UI components
- `lib/`: Auth, model inference, email, helpers
- `backend/`: FastAPI services (proxy, model server)
- `huggingface-space/`: Dockerized FastAPI model API
- `prisma/`: Database schema and migrations
- `scripts/`: Helper scripts (Python inference bridge)

## Common Issues & Solutions
- Model API unavailable: Set `MODEL_API_URL` to a reachable endpoint.
- Prisma errors: Check `DATABASE_URL`, run migrations.
- Upload failures: Set `BLOB_READ_WRITE_TOKEN` for Vercel.
- Gemini chat errors: Ensure `GEMINI_API_KEY` is valid.

## Useful Commands
- `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- `npx prisma generate`, `npx prisma migrate dev`
- `pip install -r requirements.txt`
- `uvicorn app:app --host 0.0.0.0 --port 7860`

---
The rest of the README contains detailed setup, deployment, and API instructions. See below for full guides and examples.
# Herd AI: Livestock Health Management Platform

AI-powered web platform for livestock disease screening, vet booking, and herd health tracking.

## Persistent Image Uploads & Storage

**Uploads are now stored in Supabase Storage (bucket: `uploads`) for production reliability.**
- Images uploaded via the app are sent to the backend, which uploads them to Supabase Storage.
- The backend returns a public Supabase URL for each image.
- The frontend displays images using these Supabase URLs, ensuring images are visible everywhere (vet dashboard, results page, etc.), even after deployment/restart.
- Local development uses `public/uploads/` for quick testing, but production always uses Supabase.

### Technologies Used
- **Frontend:** Next.js (App Router)
- **Backend:** FastAPI (Python)
- **Model Inference:** Keras/TensorFlow, Hugging Face Space, or FastAPI proxy
- **Storage:** Supabase Storage (persistent, free, no credit card required)
- **Database:** PostgreSQL + Prisma
- **Authentication:** JWT
- **Deployment:** Render (Blueprint for frontend/backend/db), Hugging Face Space (model API)

### Deployment Workflow
1. User uploads image via dashboard.
2. Backend uploads image to Supabase Storage and returns public URL.
3. Frontend displays image using Supabase URL.
4. Analysis results and image URLs are stored in database for history and vet review.

See below for full deployment and setup instructions.

## Demo
- Video: https://drive.google.com/file/d/1IhiLub_UjQdqkYT8ZwwzWAHMCBRRLrZ3/view?usp=sharing
- Live app: https://livestock-frontend.onrender.com/

## Tech Stack
- Frontend/API: Next.js App Router (`app/`)
- Database: PostgreSQL + Prisma (`prisma/`)
- Auth: JWT (`lib/jwt.ts`)
- AI chat: Gemini (`app/api/chat/route.ts`)
- Image analysis: calls model API endpoints from `MODEL_API_URL` / `MODEL_API_URLS`
- Optional Python model runtime: `scripts/keras_inference.py` + `cattle_model.keras`

## Repository Layout
- `app/`: pages and route handlers
- `components/`: UI components
- `lib/`: auth, model inference, email, helpers
- `backend/`: optional FastAPI services (proxy and local model server)
- `huggingface-space/`: Dockerized FastAPI model service for HF Spaces
- `prisma/`: schema and migrations
- `scripts/`: helper scripts including Python inference bridge

## Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 14+
- Python 3.10 or 3.11 (optional, only for local Keras inference)

## Local Setup

### 1. Clone and install
```bash
git clone <your-repo-url>
cd livestock-ai-platform
npm install
```

### 2. Create `.env.local`
Create `./.env.local` with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/herd_ai?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"

# Model API endpoint(s) used by app/api/analyze/route.ts
# Single endpoint:
MODEL_API_URL="http://127.0.0.1:7860/predict"
# Or comma-separated endpoints:
# MODEL_API_URLS="http://127.0.0.1:7860/predict,http://127.0.0.1:8010/predict"

# Optional features
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
EMAIL_USER=""
EMAIL_PASSWORD=""
EMAIL_FROM=""
```

Notes:
- The app reads `GEMINI_API_KEY` from `.env.local` in the chat route.
- If `BLOB_READ_WRITE_TOKEN` is unset, uploads are stored in `public/uploads/` for local development.

### 3. Set up database
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the app
```bash
npm run dev
```

Open `http://localhost:3000`.

## Model Inference Options

The analysis route (`app/api/analyze/route.ts`) tries external model API endpoints first.

### Option A: Use Hugging Face Space (recommended)
Set:
```env
MODEL_API_URL="https://<your-space>.hf.space/predict"
```

### Option B: Use local proxy backend (`backend/app_proxy.py`)
1. Start proxy:
```bash
cd backend
pip install -r requirements_proxy.txt
# PowerShell:
$env:HF_SPACE_URL="https://<your-space>.hf.space/predict"
# Bash:
# export HF_SPACE_URL="https://<your-space>.hf.space/predict"
uvicorn app_proxy:app --host 0.0.0.0 --port 8010
```
2. Point Next.js to proxy:
```env
MODEL_API_URL="http://127.0.0.1:8010/predict"
```

### Option C: Local Keras fallback (development only)
If model API endpoints are unavailable and app is not in production mode, the app can fall back to local inference (`lib/model-inference.ts`) using:
- `cattle_model.keras` in repo root, or
- `KERAS_MODEL_PATH` env var.

Python deps for fallback:
```bash
pip install tensorflow pillow numpy
```

Optional env vars for local fallback:
```env
MODEL_RUNTIME="auto"          # auto | keras | tfjs
KERAS_MODEL_PATH="./cattle_model.keras"
KERAS_PYTHON_BIN="python"
TFJS_MODEL_PATH=""            # if using tfjs model.json instead
```

## Production Deployment (Render)

This repo includes `render.yaml` for blueprint deployment:
- `livestock-frontend` (Next.js)
- `livestock-backend` (FastAPI proxy)
- managed PostgreSQL database

Quick flow:
1. Push repo (with model handling strategy in place).
2. Create Blueprint on Render from `render.yaml`.
3. Set required env vars:
   - Frontend: `DATABASE_URL`, `NEXTAUTH_URL`, `JWT_SECRET`, `MODEL_API_URL` or `MODEL_API_URLS`, optional `GEMINI_API_KEY`
   - Backend proxy: `HF_SPACE_URL`
4. Deploy and verify:
   - Frontend health: `/api/health`
   - Backend health: `/health`

Detailed instructions: `RENDER_DEPLOYMENT.md`

## Deployment Plan (Rubric-Aligned)

This section documents a clear deployment plan with environments, tools, step-by-step execution, and verification checks.

### Target Environments

| Environment | Purpose | URL / Host |
|---|---|---|
| Local Development | Feature development and debugging | `http://localhost:3000` |
| Model Serving (Hosted) | Production image inference API | Hugging Face Space (`https://<space>.hf.space`) |
| Production App | User-facing deployed application | Render frontend (`https://livestock-frontend.onrender.com`) |
| Production API Proxy | Server-side model proxy | Render backend (`https://livestock-backend.onrender.com`) |

### Deployment Tools

- Git + GitHub (source control and CI trigger)
- Render Blueprint (`render.yaml`) for frontend, backend, and PostgreSQL
- Hugging Face Spaces (Docker) for model-serving API
- Prisma (`npx prisma migrate deploy`) for production schema migrations
- `curl` for post-deploy smoke tests

### Step-by-Step Deployment Procedure

1. Prepare release branch and push code to GitHub.
2. Deploy or update Hugging Face Space from `huggingface-space/`.
3. Confirm HF Space runtime status is `RUNNING`.
4. Deploy Render services using `render.yaml` Blueprint.
5. Set Render environment variables:
  - Frontend: `DATABASE_URL`, `NEXTAUTH_URL`, `JWT_SECRET`, `MODEL_API_URL` or `MODEL_API_URLS`, optional `GEMINI_API_KEY`
  - Backend proxy: `HF_SPACE_URL`
6. Allow frontend build to run Prisma commands during deploy (`npx prisma generate`, `npx prisma migrate deploy`).
7. Run deployment verification tests (below).

### Deployment Verification (Functionality Tests)

Run these checks in order to verify successful deployment in the target environment.

1. Frontend health endpoint:
```bash
curl https://livestock-frontend.onrender.com/api/health
```
Expected: JSON with `"status":"healthy"`.

2. Backend proxy health endpoint:
```bash
curl https://livestock-backend.onrender.com/health
```
Expected: `hf_space_configured: true` and healthy or reachable HF status.

3. HF Space health endpoint:
```bash
curl https://<your-space>.hf.space/health
```
Expected: runtime reachable; after first prediction, `model_loaded: true`.

4. End-to-end inference test from production flow:
- Log into deployed app.
- Upload a cattle image in Dashboard analysis flow.
- Confirm prediction result, confidence, and saved analysis history are returned.

5. Optional chat verification:
- Open assistant page.
- Send a prompt and confirm Gemini response is returned.

Deployment is considered successful when all health checks pass and end-to-end image analysis works in the deployed app.

## API Quick Checks

### Health
```bash
curl http://localhost:3000/api/health
```

### Auth signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@farm.com","password":"password123","district":"Kampala"}'
```

## Common Issues
- `Failed to analyze image: model API unavailable`:
  - Set `MODEL_API_URL` or `MODEL_API_URLS` to a reachable `/predict` endpoint.
- Prisma connection errors:
  - Verify `DATABASE_URL`, then run `npx prisma generate` and `npx prisma migrate dev`.
- Gemini chat errors:
  - Ensure `GEMINI_API_KEY` is valid in `.env.local`.
- Upload failures on Vercel:
  - Set `BLOB_READ_WRITE_TOKEN`.

## Useful Commands
```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma generate
npx prisma migrate dev
```

## Contributing
1. Create a branch: `git checkout -b feature/<name>`
2. Commit: `git commit -m "feat: <summary>"`
3. Push and open a PR

