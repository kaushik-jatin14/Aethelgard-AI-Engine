import os
from pathlib import Path

from fastapi import FastAPI
from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from routes import game

app = FastAPI(title="Aethelgard Backend")
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = BASE_DIR.parent / "frontend" / "dist"

# Configure CORS so the React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game.router, prefix="/api")


def production_mode_enabled() -> bool:
    env = os.getenv("AETHELGARD_ENV", "").lower()
    return env == "production" or bool(os.getenv("RENDER")) or bool(os.getenv("RAILWAY_ENVIRONMENT"))


@app.on_event("startup")
def validate_production_runtime() -> None:
    runtime_status = game.get_runtime_status()
    if production_mode_enabled() and not runtime_status["ai_configured"]:
        raise RuntimeError(
            "Aethelgard requires GEMINI_API_KEY or FALLBACK_KEYS in production."
        )


@app.get("/api/health")
def healthcheck():
    runtime_status = game.get_runtime_status()
    health_state = "ok" if runtime_status["ai_configured"] else "degraded"
    return {
        "status": health_state,
        "message": "Aethelgard Backend is running",
        **runtime_status,
    }


@app.get("/api/ready")
def readiness_check():
    runtime_status = game.get_runtime_status()
    if not runtime_status["ai_configured"]:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unready",
                "message": "Server is missing Gemini configuration.",
                **runtime_status,
            },
        )

    return {
        "status": "ready",
        "message": "Aethelgard is ready to serve gameplay and chat requests.",
        **runtime_status,
    }


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if not FRONTEND_DIST_DIR.exists():
        return {
            "status": "ok",
            "message": "Backend is running. Build the frontend or run the Vite dev server to view the app.",
        }

    requested_path = FRONTEND_DIST_DIR / full_path
    if full_path and requested_path.is_file():
        return FileResponse(requested_path)

    return FileResponse(FRONTEND_DIST_DIR / "index.html")
