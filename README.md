
# Herd AI: Livestock Health Management Platform

## Demo & Live Deployment
- [Video walkthrough](https://drive.google.com/file/d/1IhiLub_UjQdqkYT8ZwwzWAHMCBRRLrZ3/view?usp=sharing) — See the app in action, including disease analysis, booking, and AI chat.
- [Live app](https://livestock-frontend.onrender.com/) — Try the platform yourself.

## Screenshots & Testing Results
Extensive screenshots below demonstrate core features, data variation, and performance. These are real results from production and test environments.

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

---

## Project Overview
Herd AI is a next-generation livestock health platform designed for farmers, veterinarians, and researchers. It leverages state-of-the-art AI image analysis, robust cloud storage, and seamless user experience to:
- Detect cattle diseases early and accurately
- Book and manage veterinary appointments
- Track herd health history and trends
- Chat with an AI assistant for advice and support

### Why Herd AI?
- **Impact:** Early disease detection saves livestock, reduces outbreaks, and improves food security.
- **Innovation:** Combines deep learning, cloud storage, and real-time analytics in a single platform.
- **Accessibility:** Free tier, no credit card required, works on any device.
- **Reliability:** Persistent storage, secure authentication, and scalable deployment.

---

## Features & Workflow
- **User registration and login** — Secure authentication with JWT
- **Cattle image upload and disease analysis** — AI-powered, fast, and accurate
- **Persistent image storage** — Supabase Storage for reliability
- **Results and image URLs stored in PostgreSQL** — Full history for review and vet access
- **Vet appointment booking and review** — Integrated calendar and vet dashboard
- **AI chat assistant (Gemini)** — Real-time advice and support
- **Analyses history with filtering/search and delete-all button** — Easy management and review

---

## Technical Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), Next.js API routes (Node.js)
- **Model Inference:** TensorFlow/Keras, Hugging Face Space, FastAPI proxy
- **Storage:** Supabase Storage (cloud, persistent)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (secure, stateless)
- **Deployment:** Render, Vercel, Hugging Face Space (Docker)
- **Other:** Docker, PowerShell/Bash scripts, Prisma migrations

### Architecture Diagram
```
User ──▶ Next.js Frontend ──▶ FastAPI Backend ──▶ Model API (Hugging Face Space)
           │                        │
           ▼                        ▼
     Supabase Storage         PostgreSQL DB
```

---

## Repository Structure
- `app/`: Next.js pages and API routes
- `components/`: UI components
- `lib/`: Auth, model inference, email, helpers
- `backend/`: FastAPI services (proxy, model server)
- `huggingface-space/`: Dockerized FastAPI model API
- `prisma/`: Database schema and migrations
- `scripts/`: Helper scripts (Python inference bridge)

---

## Setup Instructions

### Local Development
1. Clone the repo:
   ```bash
   git clone <your-repo-url>
   cd livestock-ai-platform
   npm install
   ```
2. Create `.env.local` with required secrets and API URLs (see below).
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

#### Sample `.env.local`
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/herd_ai?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
MODEL_API_URL="http://127.0.0.1:7860/predict"
GEMINI_API_KEY=""
EMAIL_USER=""
EMAIL_PASSWORD=""
EMAIL_FROM=""
```

---

## Deployment Guide

### Render Blueprint (Production)
- Frontend: Next.js app
- Backend: FastAPI proxy
- Database: Managed PostgreSQL
- All services defined in `render.yaml`

### Hugging Face Space (Model API)
- Dockerized FastAPI model API
- Model file (`cattle_model.keras`) uploaded to Space
- API URL used in frontend/backend env vars

### Vercel (Alternative Production)
- Add all environment variables in Vercel dashboard
- Use Supabase Storage for uploads (do not write to /public)
- Deploy frontend (Next.js) and backend (if needed)

---

### Step-by-Step Deployment
1. Push repo to GitHub
2. Deploy Hugging Face Space from `huggingface-space/`
3. Deploy Render or Vercel services using `render.yaml` or Vercel dashboard
4. Set required environment variables
5. Run Prisma commands during deploy
6. Verify health endpoints and end-to-end flow

---

## API Documentation

- `/api/analyze`: Image analysis (calls model API, stores results)
- `/api/analyses`: Fetch and delete analyses history (GET, DELETE)
- `/api/auth/signup`: User registration
- `/api/auth/login`: User login
- `/api/chat`: Gemini AI chat
- `/api/health`: Health check endpoint
- FastAPI backend: `/predict`, `/health`, `/` (model info)

---

## Testing, Troubleshooting & Performance

### Testing Strategies
- Screenshots and demo video show real-world usage, edge cases, and performance
- Tested with different data values (healthy, multiple diseases, invalid images)
- Performance tested on Vercel, Render, and local hardware

### Common Issues & Solutions
- Model API unavailable: Set `MODEL_API_URL` to a reachable endpoint
- Prisma errors: Check `DATABASE_URL`, run migrations
- Upload failures: Set `BLOB_READ_WRITE_TOKEN` for Vercel
- Gemini chat errors: Ensure `GEMINI_API_KEY` is valid
- Vercel: Do not write to `/public` — use Supabase Storage or Vercel Blob

### Useful Commands
- `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- `npx prisma generate`, `npx prisma migrate dev`
- `pip install -r requirements.txt`
- `uvicorn app:app --host 0.0.0.0 --port 7860`

---

## Contribution Guidelines
1. Create a branch: `git checkout -b feature/<name>`
2. Commit: `git commit -m "feat: <summary>"`
3. Push and open a PR
4. Follow code style and add tests for new features

---

## License & Credits
This project is MIT licensed. AI model, UI, and backend code are original or properly credited. See `huggingface-space/README.md` for model details.

---

## Contact & Support
- For questions, issues, or feature requests, open an issue or contact [nickmuhigi@gmail.com](mailto:nickmuhigi@gmail.com)

---

## Acknowledgements
- Supabase, Hugging Face, Render, Vercel, Prisma, Next.js, FastAPI, Google Gemini

---

## Future Work & Recommendations
- Expand disease detection to more livestock species
- Integrate real-time IoT sensor data for herd health
- Add offline support and mobile app
- Collaborate with veterinary organizations for wider adoption

---

