import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))


# ── MOTS DE PASSE ─────────────────────────────────────

def hacher_mot_de_passe(mot_de_passe: str) -> str:
    # bcrypt a une limite de 72 caractères
    # on tronque proprement avant de hacher
    mdp_bytes = mot_de_passe.encode("utf-8")[:72]
    salt      = bcrypt.gensalt()
    return bcrypt.hashpw(mdp_bytes, salt).decode("utf-8")


def verifier_mot_de_passe(mot_de_passe: str, hash: str) -> bool:
    mdp_bytes  = mot_de_passe.encode("utf-8")[:72]
    hash_bytes = hash.encode("utf-8")
    return bcrypt.checkpw(mdp_bytes, hash_bytes)


# ── TOKENS JWT ────────────────────────────────────────

def creer_token(data: dict) -> str:
    contenu    = data.copy()
    expiration = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    contenu.update({"exp": expiration})
    return jwt.encode(contenu, SECRET_KEY, algorithm=ALGORITHM)


def verifier_token(token: str):
    try:
        payload   = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        matricule = payload.get("sub")
        if matricule is None:
            return None
        return payload
    except JWTError:
        return None