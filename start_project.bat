@echo off
echo ==========================================
echo    AETHELGARD: CINEMATIC ENGINE LAUNCHER
echo ==========================================
echo.
echo Starting Oracle Backend (FastAPI)...
start "Oracle Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Cinematic Frontend (React)...
start "Aethelgard Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==========================================
echo BOTH SERVICES ARE STARTING...
echo 1. Backend: http://localhost:8000
echo 2. Frontend: http://localhost:5173
echo ==========================================
pause
