from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))


def creer_token(data: dict):
    contenu = data.copy()
    expiration = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    contenu.update({"exp": expiration})
    token = jwt.encode(contenu, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verifier_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        matricule = payload.get("sub")
        if matricule is None:
            return None
        return matricule
    except JWTError:
        return None