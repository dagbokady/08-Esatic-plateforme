from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
bearer_scheme = HTTPBearer()
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.auth import verifier_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail      = "Token invalide ou expiré",
        headers     = {"WWW-Authenticate": "Bearer"},
    )

    # Extrait le token depuis les credentials
    payload = verifier_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    matricule = payload.get("sub")
    user      = db.query(User).filter(
                    User.matricule == matricule
                ).first()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


def get_current_delegate(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "delegate":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "Action réservée au délégué"
        )
    return current_user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code = 403,
            detail      = "Accès réservé aux administrateurs"
        )
    return current_user