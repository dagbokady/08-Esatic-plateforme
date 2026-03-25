
from app.routers import auth, classes, files
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="EsaticShare API",
    description="Partage de fichiers scolaires — ESATIC",
    version="0.1.0",
    debug=(ENVIRONMENT == "development")
)

# ── CORS ──────────────────────────────────────────────
if ENVIRONMENT == "development":
    origins = ["http://localhost:5173"]
else:
    origins = [os.getenv("FRONTEND_URL", "https://esaticshare.vercel.app")]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(files.router)
# ── ROUTES DE BASE ────────────────────────────────────
@app.get("/")
def root():
    return {
        "app": "EsaticShare",
        "version": "0.1.0",
        "environment": ENVIRONMENT,
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}