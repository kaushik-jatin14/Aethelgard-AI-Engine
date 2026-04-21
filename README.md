# Aethelgard: Hosted AI Cinematic Engine

Aethelgard is a single hosted web app powered by FastAPI and React. In production, users should open one public URL and get the frontend plus `/api/*` routes from the same host. End users do not paste Gemini keys or run local startup scripts.

## Production model
- One public URL serves the React app and the FastAPI backend together.
- Gemini access is server-owned through `GEMINI_API_KEY` and optional `FALLBACK_KEYS`.
- `/api/health` reports runtime status.
- `/api/ready` is the readiness endpoint for deployments and returns `503` when AI keys are missing.
- When Gemini is unavailable, the app shows explicit hosted-service errors instead of pretending success.

## Required environment variables
- `GEMINI_API_KEY`: primary Gemini server key.
- `FALLBACK_KEYS`: optional comma-separated fallback Gemini keys.
- `AETHELGARD_ENV=production`: enabled automatically in the provided Docker image and used for strict startup validation.

## Local development
1. Backend:
   - `cd backend`
   - `python -m venv venv`
   - `.\venv\Scripts\activate`
   - `pip install -r requirements.txt`
   - create `backend/.env` with `GEMINI_API_KEY` and optional `FALLBACK_KEYS`
   - `.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm.cmd run dev -- --host 0.0.0.0 --port 5173`

Local development can still use separate servers, but production should not.

## One-host deployment
This repo now includes:
- [Dockerfile](/C:/Users/admin/OneDrive/Desktop/AI-Project/Dockerfile:1) for a single container that builds the frontend and serves everything from FastAPI.
- [render.yaml](/C:/Users/admin/OneDrive/Desktop/AI-Project/render.yaml:1) for Render using the Docker deployment path.

### Deploy to Render
1. Connect the repository to Render.
2. Use the included `render.yaml` or create a Docker web service from the repo root.
3. Set:
   - `GEMINI_API_KEY`
   - `FALLBACK_KEYS` if you have backups
4. Render health check path: `/api/ready`
5. After deploy, users open the public Render URL directly.

## Backend contract
- `POST /api/game-action`
  - Success: `{ "ok": true, "narrative": "...", "new_state": {...} }`
  - Failure: `{ "ok": false, "code": "AI_TIMEOUT", "message": "...", "retryable": true }`
- `POST /api/help-chat`
  - Success: `{ "ok": true, "action": "CHAT|LOGIN_GUEST|LOGIN_PIN|CREATE_PROFILE", "message": "...", ... }`
  - Failure: `{ "ok": false, "code": "...", "message": "...", "retryable": true|false }`

## Verification
- Backend health: `http://localhost:8000/api/health`
- Backend readiness: `http://localhost:8000/api/ready`
- Frontend dev server: `http://localhost:5173`
- Real backend contract tests: `.\venv\Scripts\python.exe -m unittest test_backend_contracts.py`

## Notes
- The legacy `backend/test_api.py`, `backend/test_api_v2.py`, and `backend/test_game_action.py` files are now safe manual request scripts and no longer execute on import during automated test runs.
- `frontend/vercel.json` and `frontend/api/index.py` remain available for split-host experiments, but the primary production path is the single hosted backend.
