from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import auth, classes, files, ecues

import os

load_dotenv()

ENVIRONMENT  = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="EsaticShare API",
    description="Partage de fichiers scolaires — ESATIC",
    version="0.1.0",
)

# ── CORS — en premier, avant tout ─────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://esaticshare-frontend.vercel.app",
        "https://08-esatic-plateforme.vercel.app",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────
from app.routers import auth, classes, files
app.include_router(auth.router)
app.include_router(classes.router)
app.include_router(ecues.router)
app.include_router(files.router)

# ── MIGRATIONS AU DÉMARRAGE ───────────────────────────
# On utilise startup event — ça tourne APRÈS que
# le serveur est prêt, pas pendant le chargement
@app.on_event("startup")
async def startup():
    try:
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations OK")
    except Exception as e:
        print(f"⚠️ Migrations : {e}")

    try:
        from app.utils.seed import seed
        seed()
    except Exception as e:
        print(f"⚠️ Seed : {e}")

# ── ROUTES DE BASE ────────────────────────────────────
@app.get("/")
def root():
    return {"app": "EsaticShare", "status": "running", "environment": ENVIRONMENT}

@app.get("/health")
def health_check():
    return {"status": "ok"}
