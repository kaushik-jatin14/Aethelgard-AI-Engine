# Aethelgard: AI Cinematic Engine

A full-stack AI adventure game engine powered by FastAPI and React, featuring automatic API key rotation and Gemini 3 Flash orchestration.

## Features
- **Cinematic Experience**: High-fidelity UI with Framer Motion animations.
- **Oracle Engine**: FastAPI backend that manages multiple Gemini API keys to prevent quota issues.
- **Stateful Game Master**: Keeps track of inventory, health, and location across sessions.
- **Visual Maps**: Dynamic 25-region map system.

## Local Setup
1. **Backend**:
   - `cd backend`
   - `python -m venv venv`
   - `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
   - `pip install -r requirements.txt`
   - Create a `.env` file with your `GEMINI_API_KEY` and `FALLBACK_KEYS`.

2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Alternatively, use the `start_project.bat` in the root directory.

## Deployment Guide (How to go Live)

### 1. Backend (The Oracle)
Deploy the `backend/` folder to **Render.com** or **Railway.app**.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**: Add your `GEMINI_API_KEY` and `FALLBACK_KEYS` in the hosting dashboard.

### 2. Frontend (The Vision)
Deploy the `frontend/` folder to **Vercel** or **Netlify**.
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration**: Update `frontend/src/services/gemini.js` to point `BACKEND_URL` to your new Render/Railway URL.

## Security
This project is configured with a `.gitignore` that prevents your `.env` files from being uploaded to GitHub. Never share your API keys publicly!
