from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from app.routers import auth, classes, files
import os

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="EsaticShare API",
    description="Partage de fichiers scolaires — ESATIC",
    version="0.1.0",
    debug=(ENVIRONMENT == "development")
)

# ── CORS MANUEL ───────────────────────────────────────
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    # Gérer les erreurs sans perdre les headers CORS
    try:
        response = await call_next(request)
    except Exception as e:
        response = JSONResponse(
            content={"detail": "Erreur interne"},
            status_code=500
        )

    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"]      = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"]     = "*"
    return response
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