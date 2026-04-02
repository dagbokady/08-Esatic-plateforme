from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.auth import hacher_mot_de_passe, verifier_mot_de_passe, creer_token
from app.utils.dependencies import get_current_user
import uuid

router = APIRouter(prefix="/auth", tags=["Authentification"])


# ── INSCRIPTION ───────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):

    existe = db.query(User).filter(
                 User.matricule == body.matricule
             ).first()

    if existe:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail      = "Ce matricule est déjà utilisé"
        )

    nouveau_user = User(
        id            = uuid.uuid4(),
        matricule     = body.matricule,
        full_name     = body.full_name,
        password_hash = hacher_mot_de_passe(body.password),
        class_id      = body.class_id
    )

    try:
        db.add(nouveau_user)
        db.commit()
        db.refresh(nouveau_user)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(500, detail=str(e))
    return {
        "id": str(nouveau_user.id),
        "matricule": nouveau_user.matricule,
        "full_name": nouveau_user.full_name,
        "class_id": str(nouveau_user.class_id)
    }


# ── CONNEXION ─────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
               User.matricule == body.matricule
           ).first()


    if not user or not verifier_mot_de_passe(body.password, user.password_hash):
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Matricule ou mot de passe incorrect"
        )

    if not user.is_active:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "Compte désactivé"
        )


    token = creer_token({
        "sub"      : user.matricule,
        "role"     : user.role,
        "class_id" : str(user.class_id)
    })

    return {"access_token": token, "token_type": "bearer"}


# ── MON PROFIL ────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id"       : str(current_user.id),
        "matricule": current_user.matricule,
        "full_name": current_user.full_name,
        "role"     : current_user.role
    }

# Route temporaire pour se nommer délégué
# (en prod ce serait réservé à un admin)
@router.post("/devenir-delegue")
def devenir_delegue(
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    current_user.role = "delegate"
    db.commit()
    return {"message": f"{current_user.full_name} est maintenant délégué"}