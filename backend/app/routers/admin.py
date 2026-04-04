# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.academic import Class, Level, Filiere
from app.models.vote import ClassMembership
from app.models.file import File
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administration"])


# ── STATS GLOBALES ────────────────────────────────────
@router.get("/stats")
def stats_globales(
    db           : Session = Depends(get_db),
    _            : User    = Depends(get_current_admin)
):
    return {
        "total_users"    : db.query(User).count(),
        "total_files"    : db.query(File).count(),
        "total_classes"  : db.query(Class).count(),
        "total_delegates": db.query(User).filter(User.role == UserRole.delegate).count(),
    }


# ── LISTE DES UTILISATEURS ────────────────────────────
@router.get("/users")
def liste_users(
    db: Session = Depends(get_db),
    _ : User    = Depends(get_current_admin)
):
    users = db.query(User).all()
    resultat = []
    for u in users:
        classe  = db.query(Class).filter(Class.id == u.class_id).first()
        niveau  = db.query(Level).filter(Level.id == classe.level_id).first() if classe else None
        filiere = db.query(Filiere).filter(Filiere.id == classe.filiere_id).first() if classe else None
        resultat.append({
            "id"       : str(u.id),
            "matricule": u.matricule,
            "full_name": u.full_name,
            "role"     : u.role,
            "is_active": u.is_active,
            "classe"   : f"{niveau.name} · {filiere.name}" if niveau and filiere else None,
        })
    return resultat


# ── NOMMER DÉLÉGUÉ ────────────────────────────────────
@router.post("/users/{user_id}/nommer-delegue")
def nommer_delegue(
    user_id: str,
    db     : Session = Depends(get_db),
    _      : User    = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    user.role = UserRole.delegate
    db.commit()
    return {"message": f"{user.full_name} est maintenant délégué"}


# ── RÉVOQUER DÉLÉGUÉ ──────────────────────────────────
@router.post("/users/{user_id}/revoquer-delegue")
def revoquer_delegue(
    user_id: str,
    db     : Session = Depends(get_db),
    _      : User    = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    user.role = UserRole.student
    db.commit()
    return {"message": f"{user.full_name} est maintenant étudiant"}


# ── DÉSACTIVER UN COMPTE ──────────────────────────────
@router.post("/users/{user_id}/desactiver")
def desactiver_compte(
    user_id: str,
    db     : Session = Depends(get_db),
    _      : User    = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    user.is_active = False
    db.commit()
    return {"message": f"Compte de {user.full_name} désactivé"}


# ── LISTE DES CLASSES AVEC STATS ──────────────────────
@router.get("/classes")
def liste_classes_admin(
    db: Session = Depends(get_db),
    _ : User    = Depends(get_current_admin)
):
    classes = db.query(Class).all()
    resultat = []
    for c in classes:
        niveau  = db.query(Level).filter(Level.id == c.level_id).first()
        filiere = db.query(Filiere).filter(Filiere.id == c.filiere_id).first()
        membres = db.query(ClassMembership).filter(
            ClassMembership.class_id  == c.id,
            ClassMembership.is_active == True
        ).count()
        fichiers = db.query(File).filter(File.class_id == c.id).count()
        delegue  = db.query(User).filter(
            User.class_id == c.id,
            User.role     == UserRole.delegate
        ).first()
        resultat.append({
            "id"      : str(c.id),
            "niveau"  : niveau.name  if niveau  else None,
            "filiere" : filiere.name if filiere else None,
            "membres" : membres,
            "fichiers": fichiers,
            "delegue" : delegue.full_name if delegue else None,
        })
    return sorted(resultat, key=lambda x: x.get("niveau", ""))