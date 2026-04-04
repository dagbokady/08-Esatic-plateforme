from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.auth import hacher_mot_de_passe, verifier_mot_de_passe, creer_token
from app.utils.dependencies import get_current_user
import uuid
import re
router = APIRouter(prefix="/auth", tags=["Authentification"])


# ── INSCRIPTION ───────────────────────────────────────
def valider_matricule(matricule: str) -> bool:
    """
    Format attendu : 22-ESATIC0069AK
    - 2 chiffres (année)
    - tiret
    - ESATIC (obligatoire)
    - chiffres (numéro)
    - 2 lettres majuscules (fin)
    """
    pattern = r'^\d{2}-ESATIC\d+[A-Z]{2}$'
    return bool(re.match(pattern, matricule))


# ── INSCRIPTION ───────────────────────────────────────
@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    import re

    def valider_matricule(m):
        return bool(re.match(r'^\d{2}-ESATIC\d+[A-Z]{2}$', m))

    if not valider_matricule(body.matricule):
        raise HTTPException(400, "Format invalide. Exemple : 22-ESATIC0069AK")

    if db.query(User).filter(User.matricule == body.matricule).first():
        raise HTTPException(409, "Ce matricule est déjà utilisé")

    nouveau_user = User(
        id              = uuid.uuid4(),
        matricule       = body.matricule,
        full_name       = body.full_name,
        password_hash   = hacher_mot_de_passe(body.password),
        class_id        = body.class_id,
        approval_status = "pending",   # ← en attente par défaut
        is_active       = True
    )
    db.add(nouveau_user)
    db.commit()
    db.refresh(nouveau_user)

    return {
        "id"             : str(nouveau_user.id),
        "matricule"      : nouveau_user.matricule,
        "full_name"      : nouveau_user.full_name,
        "role"           : nouveau_user.role,
        "approval_status": nouveau_user.approval_status,
        "message"        : "Compte créé — en attente d'approbation du délégué"
    }


# ── CONNEXION ─────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.matricule == body.matricule).first()

    if not user or not verifier_mot_de_passe(body.password, user.password_hash):
        raise HTTPException(401, "Matricule ou mot de passe incorrect")

    if not user.is_active:
        raise HTTPException(403, "Compte désactivé")

    # Bloquer si en attente
    if user.approval_status == "pending":
        raise HTTPException(
            403,
            "Ton compte est en attente d'approbation. Le délégué de ta classe doit valider ton inscription."
        )

    if user.approval_status == "rejected":
        raise HTTPException(
            403,
            "Ton inscription a été refusée. Contacte le délégué de ta classe."
        )

    token = creer_token({
        "sub"     : user.matricule,
        "role"    : user.role,
        "class_id": str(user.class_id)
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