# [ Herd AI ] A Livestock Health Management Platform

> An AI-powered livestock health management system that enables farmers to detect diseases early, connect with veterinarians, and track herd health through advanced analytics.


## Demo Video

[Watch Demo](https://drive.google.com/file/d/1IhiLub_UjQdqkYT8ZwwzWAHMCBRRLrZ3/view?usp=sharing)



## Live Deployment

[Visit the Deployed Application](https://your-deployed-app-link-here.com)



## Related Project Files

| File / Folder | Description |
|---|---|
| `app/` | Next.js App Router pages and API routes |
| `components/` | Reusable React UI components |
| `lib/` | Utilities: auth, JWT, ML inference, email, disease advice |
| `prisma/schema.prisma` | PostgreSQL database schema |
| `prisma/migrations/` | Version-controlled database migrations |
| `public/model/` | TensorFlow.js ML model files (`model.json`, `model.weights.bin`) |
| `public/uploads/` | Uploaded livestock images (runtime-generated) |
| `scripts/keras_inference.py` | Optional Python/Keras inference runtime |
| `.env` | Environment variables (not committed — see setup below) |
| `package.json` | Project dependencies and scripts |


## Prerequisites

Before you begin, ensure the following are installed on your machine:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18.0.0 or higher | [nodejs.org](https://nodejs.org) |
| **pnpm** | v8.0.0 or higher | `npm install -g pnpm` |
| **PostgreSQL** | v14.0 or higher | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **Python** *(optional)* | v3.10 or v3.11 | [python.org](https://www.python.org) — only needed for Keras runtime |


## Installation & Setup (Step by Step)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/herd-ai-platform.git
cd herd-ai-platform
```

> **Replace the URL above with your actual GitHub repository link.**


### Step 2 — Install Node.js Dependencies

```bash
pnpm install
```

This installs all frontend and backend packages including Next.js, TensorFlow.js, Prisma, and more.


### Step 3 — Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Then open `.env` and update the following values:

```env
# ─── Database ───────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/herd_ai?schema=public"

# ─── JWT Authentication ──────────────────────────────────────────────────────
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# ─── Google Gemini AI (Chat Assistant) ──────────────────────────────────────
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# ─── Email Notifications (SMTP) ──────────────────────────────────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-specific-password"

# ─── ML Model Runtime (optional) ─────────────────────────────────────────────
MODEL_RUNTIME="auto"        # Options: "tfjs", "keras", "auto"
MODEL_PATH="./cattle_model.keras"  # Only required if using Keras runtime

# ─── Next.js ─────────────────────────────────────────────────────────────────
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

>  **Gmail tip:** Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password. Enable 2FA on your Google account first.

>  **Gemini API Key:** Get a free key at [Google AI Studio](https://makersuite.google.com/app/apikey).


### Step 4 — Set Up the PostgreSQL Database

First, create a new database in PostgreSQL:

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql shell, create the database
CREATE DATABASE herd_ai;
\q
```

Then run Prisma migrations to create all tables:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

> This creates all required tables: `User`, `Analysis`, and `Appointment`.


### Step 5 — Add the ML Model Files

Place your TensorFlow.js model files inside the `public/model/` directory:

```
public/
└── model/
    ├── model.json
    └── model.weights.bin
```

> If you are using the Keras runtime instead, place `cattle_model.keras` in the project root and set `MODEL_RUNTIME="keras"` in your `.env` file.


### Step 6 — Start the Development Server

```bash
pnpm dev
```

The application will be running at:

```
http://localhost:3000
```


### Step 7 — (Optional) Set Up Python / Keras Runtime

If you want to use the Keras inference backend instead of TensorFlow.js:

```bash
# Install Python dependencies
pip install tensorflow pillow numpy

# Confirm the script runs correctly
python scripts/keras_inference.py
```

Set `MODEL_RUNTIME="keras"` in your `.env` file to activate it.


## Build for Production

```bash
# Create optimised production build
pnpm build

# Start production server
pnpm start
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the CLI prompts and add all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.


## Quick API Tests

Once the server is running, you can verify the API with these curl commands:

```bash
# Create a new account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@farm.com","password":"password123","district":"Kampala"}'

# Log in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.com","password":"password123"}'
```


## Key Application Routes

| Route | Description |
|---|---|
| `/` | Landing page with features and analytics |
| `/signup` | Create a new farmer or vet account |
| `/login` | Sign in to your account |
| `/dashboard` | Farmer dashboard — upload image for analysis |
| `/dashboard/results` | View AI analysis results and history |
| `/dashboard/assistant` | Chat with Gemini AI health assistant |
| `/dashboard/booking` | Book a vet appointment |
| `/vet-dashboard` | Veterinarian dashboard with disease hotspot map |
| `/vet-dashboard/appointments` | Manage pending appointments |
| `/vet-dashboard/history` | View history and export PDF reports |


## User Roles

| Role | How to Set | Access |
|---|---|---|
| **USER** (Farmer) | Default on signup | Dashboard, analysis, booking, chat |
| **VET** (Veterinarian) | Set `role: "VET"` in database or signup form | Vet dashboard, appointments, PDF reports |


## Useful Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Run production server
pnpm lint             # Lint and check code quality
pnpm prisma studio    # Open visual database browser (GUI)
pnpm prisma migrate dev --name <migration_name>   # Create a new migration
```


## Troubleshooting

| Problem | Solution |
|---|---|
| `DATABASE_URL` connection error | Verify PostgreSQL is running and credentials are correct |
| `prisma generate` fails | Ensure Node.js v18+ is installed and run `pnpm install` again |
| ML model not loading | Confirm `model.json` and `model.weights.bin` exist in `public/model/` |
| Gemini chat not working | Check `GEMINI_API_KEY` is valid and has not exceeded quota |
| Emails not sending | Use a Gmail App Password, not your regular Gmail password |
| Port 3000 already in use | Run `pnpm dev -- -p 3001` to use a different port |




## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

