
# Herd AI: Livestock Health Management Platform
## Demo
- [Video walkthrough](https://drive.google.com/file/d/1IhiLub_UjQdqkYT8ZwwzWAHMCBRRLrZ3/view?usp=sharing)
- [Live app](https://livestock-frontend.onrender.com/)

## Screenshots & Testing Results

Below are screenshots demonstrating core functionalities, testing with different data values, and performance on various environments. 

### Dashboard & Disease Analysis
<img width="1918" height="922" alt="Herd-Ai Dashboard" src="https://github.com/user-attachments/assets/6dbc9a70-6fab-4555-9a31-eaf282ffeaf3" />
<img width="1897" height="925" alt="Herd-Ai Assistant" src="https://github.com/user-attachments/assets/76cf708b-1918-451e-8b4d-de3960cf199c" />

### Vet Booking & History
<img width="1896" height="922" alt="Herd-Ai Booking-1" src="https://github.com/user-attachments/assets/3101aeb0-e2a8-460b-a574-763679e4972b" />
<img width="1893" height="922" alt="Herd-Ai Booking-2" src="https://github.com/user-attachments/assets/f1ae71cf-597b-4056-b32a-c3cc6e261ed8" />
<img width="1895" height="922" alt="Herd-Ai Vet Dashboard" src="https://github.com/user-attachments/assets/fd61756f-3d33-46f7-8701-e4f5590e7ec6" />
<img width="1893" height="925" alt="Herd-Ai Vet Dashboard-2" src="https://github.com/user-attachments/assets/c0970252-b507-454b-9311-4c650b320956" />

### Testing with Different Data Values
<img width="1898" height="925" alt="Herd-Ai Disease-1" src="https://github.com/user-attachments/assets/b2bc25c7-9100-4f06-b98d-a21112229b3a" />
<img width="1897" height="922" alt="Herd-Ai Disease-2" src="https://github.com/user-attachments/assets/f76e83c4-31e3-4153-b405-bff042e51394" />
<img width="1897" height="922" alt="Herd-Ai Disease-3" src="https://github.com/user-attachments/assets/8d24ea6d-a5ea-4efb-bcf4-d2ca6bfdc8d3" />
<img width="1895" height="921" alt="Herd-Ai Healthy" src="https://github.com/user-attachments/assets/1932ed28-966e-43e2-985b-68eb85d22ab1" />

## Overview
Herd AI is a full-stack web platform for livestock disease screening, vet booking, and herd health tracking. It uses AI-powered image analysis, persistent cloud storage, and robust authentication to deliver a seamless experience for farmers and veterinarians.

## Features & Workflow
- User registration and login
- Cattle image upload and disease analysis
- Persistent image storage (Supabase Storage)
- Results and image URLs stored in PostgreSQL for history and vet review
- Vet appointment booking and review
- AI chat assistant (Gemini)
- Analyses history with filtering/search and delete-all button

## Technologies Used
- **Frontend:** Next.js (App Router)
- **Backend:** FastAPI (Python), Next.js API routes (Node.js)
- **Model Inference:** TensorFlow/Keras, Hugging Face Space, FastAPI proxy
- **Storage:** Supabase Storage
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT
- **Deployment:** Render (Blueprint for frontend/backend/db), Hugging Face Space (model API)
- **Other:** Docker, PowerShell/Bash scripts, Prisma migrations

## Repository Structure
- `app/`: Next.js pages and API routes
- `components/`: UI components
- `lib/`: Auth, model inference, email, helpers
- `backend/`: FastAPI services (proxy, model server)
- `huggingface-space/`: Dockerized FastAPI model API
- `prisma/`: Database schema and migrations
- `scripts/`: Helper scripts (Python inference bridge)

## Setup Instructions

### Local Setup
1. Clone the repo:
   ```bash
   git clone <your-repo-url>
   cd livestock-ai-platform
   npm install
   ```
2. Create `.env.local` with required secrets and API URLs (see below for sample).
3. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Start frontend:
   ```bash
   npm run dev
   ```
5. (Optional) Start backend proxy:
   ```bash
   cd backend
   pip install -r requirements_proxy.txt
   uvicorn app_proxy:app --host 0.0.0.0 --port 8010
   ```

### Sample `.env.local`
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/herd_ai?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
MODEL_API_URL="http://127.0.0.1:7860/predict"
GEMINI_API_KEY=""
EMAIL_USER=""
EMAIL_PASSWORD=""
EMAIL_FROM=""
```

## Deployment (Production)

- **Render Blueprint:**
  - Frontend: Next.js app
  - Backend: FastAPI proxy
  - Database: Managed PostgreSQL
  - All services defined in `render.yaml`
- **Hugging Face Space:**
  - Dockerized FastAPI model API
  - Model file (`cattle_model.keras`) uploaded to Space
  - API URL used in frontend/backend env vars

### Step-by-Step Deployment
1. Push repo to GitHub.
2. Deploy Hugging Face Space from `huggingface-space/`.
3. Deploy Render services using `render.yaml`.
4. Set required environment variables.
5. Run Prisma commands during deploy.
6. Verify health endpoints and end-to-end flow.

## API Documentation

- `/api/analyze`: Image analysis (calls model API, stores results)
- `/api/analyses`: Fetch and delete analyses history (GET, DELETE)
- `/api/auth/signup`: User registration
- `/api/auth/login`: User login
- `/api/chat`: Gemini AI chat
- `/api/health`: Health check endpoint
- FastAPI backend: `/predict`, `/health`, `/` (model info)

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

## Contributing
1. Create a branch: `git checkout -b feature/<name>`
2. Commit: `git commit -m "feat: <summary>"`
3. Push and open a PR

