from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import auth, classes, files
import os

load_dotenv()

ENVIRONMENT  = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="EsaticShare API",
    description="Partage de fichiers scolaires — ESATIC",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────
# DOIT être ajouté avant tout le reste
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://esaticshare-frontend.vercel.app",
        "https://08-esatic-plateforme.vercel.app",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── MIGRATIONS AU DÉMARRAGE ───────────────────────────
from alembic.config import Config
from alembic import command

def run_migrations():
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations OK")
    except Exception as e:
        print(f"⚠️ Migrations : {e}")

def run_seed():
    from app.utils.seed import seed
    try:
        seed()
    except Exception as e:
        print(f"⚠️ Seed : {e}")

run_migrations()
run_seed()

# ── ROUTERS ───────────────────────────────────────────
app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(files.router)

# ── ROUTES DE BASE ────────────────────────────────────
@app.get("/")
def root():
    return {
        "app"        : "EsaticShare",
        "version"    : "0.1.0",
        "environment": ENVIRONMENT,
        "status"     : "running"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
