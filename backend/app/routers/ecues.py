# backend/app/routers/ecues.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.file import ECUE
from app.models.user import User
from app.utils.dependencies import get_current_user, get_current_delegate
import uuid

router = APIRouter(prefix="/ecues", tags=["ECUE"])


# ── LISTE DES ECUE D'UNE CLASSE ───────────────────────
@router.get("/classe/{class_id}")
def liste_ecues(
    class_id    : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    ecues = db.query(ECUE).filter(ECUE.class_id == class_id).all()
    return [
        {
            "id"        : str(e.id),
            "name"      : e.name,
            "class_id"  : str(e.class_id),
            "created_by": str(e.created_by),
        }
        for e in ecues
    ]


# ── CRÉER UN ECUE (délégué seulement) ─────────────────
@router.post("/")
def creer_ecue(
    name        : str,
    class_id    : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):
    # Vérifier que le délégué gère bien cette classe
    if str(current_user.class_id) != class_id:
        raise HTTPException(
            status_code = 403,
            detail      = "Tu ne peux créer des ECUE que pour ta propre classe"
        )

    # Vérifier que l'ECUE n'existe pas déjà
    existe = db.query(ECUE).filter(
        ECUE.class_id == class_id,
        ECUE.name     == name
    ).first()

    if existe:
        raise HTTPException(409, "Un ECUE avec ce nom existe déjà")

    ecue = ECUE(
        id         = uuid.uuid4(),
        name       = name,
        class_id   = class_id,
        created_by = current_user.id
    )
    db.add(ecue)
    db.commit()
    db.refresh(ecue)

    return {
        "id"      : str(ecue.id),
        "name"    : ecue.name,
        "class_id": str(ecue.class_id),
        "message" : "ECUE créé avec succès"
    }


# ── SUPPRIMER UN ECUE (délégué seulement) ─────────────
@router.delete("/{ecue_id}")
def supprimer_ecue(
    ecue_id     : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):
    ecue = db.query(ECUE).filter(ECUE.id == ecue_id).first()

    if not ecue:
        raise HTTPException(404, "ECUE introuvable")

    if str(ecue.class_id) != str(current_user.class_id):
        raise HTTPException(403, "Tu ne peux supprimer que les ECUE de ta classe")

    db.delete(ecue)
    db.commit()

    return {"message": "ECUE supprimé"}