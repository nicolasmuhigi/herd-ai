# Herd AI: Livestock Health Management Platform

AI-powered web platform for livestock disease screening, vet booking, and herd health tracking.

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

