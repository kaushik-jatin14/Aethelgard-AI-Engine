from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import game

app = FastAPI(title="Aethelgard Backend")

# Configure CORS so the React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Aethelgard Backend is running"}
