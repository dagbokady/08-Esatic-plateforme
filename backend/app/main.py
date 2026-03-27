
from app.routers import auth, classes, files
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from alembic.config import Config
from alembic import command
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
    origins = ["*"]


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