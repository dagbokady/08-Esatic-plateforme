from app.services.storage_service import upload_fichier
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile,  Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.file import File, FileStatus, FileType, ECUE
from app.models.vote import Vote
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.services.permission_service import (
    peut_voir_fichiers,
    peut_uploader_vers,
    seuil_atteint,
    compter_membres_actifs,
    compter_votes
)
import uuid


router = APIRouter(prefix="/files", tags=["Fichiers"])


# ── FICHIERS D'UNE CLASSE ─────────────────────────────
@router.get("/classe/{class_id}")
def fichiers_classe(
    class_id    : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):

    if not peut_voir_fichiers(db, current_user, class_id):
        raise HTTPException(
            status_code = 403,
            detail      = "Tu n'as pas accès aux fichiers de cette classe"
        )

    fichiers = db.query(File).filter(File.class_id == class_id).all()

    resultat = []
    for f in fichiers:
        nb_votes  = compter_votes(db, f.id)
        nb_membres = compter_membres_actifs(db, f.class_id)

        resultat.append({
            "id"         : str(f.id),
            "title"      : f.title,
            "file_type"  : f.file_type,
            "status"     : f.status,
            "created_at" : f.created_at,
            "uploader_id": str(f.uploader_id),
            "ecue_id"    : str(f.ecue_id) if f.ecue_id else None,
            "votes"      : {
                "count"   : nb_votes,
                "required": int(nb_membres * 0.70),
                "total"   : nb_membres
            }
        })

    return resultat


# ── UPLOADER UN FICHIER ───────────────────────────────

TYPES_AUTORISES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "image/png",
    "image/jpeg",
}

TAILLE_MAX = 50 * 1024 * 1024  # 50 Mo


# ── UPLOADER UN FICHIER ───────────────────────────────
@router.post("/upload")
def uploader_fichier(
    class_id    : str           = Form(...),
    title       : str           = Form(...),
    file_type   : FileType      = Form(...),
    ecue_id     : str           = Form(None),
    fichier     : UploadFile     = FastAPIFile(...),
    current_user: User          = Depends(get_current_user),
    db          : Session       = Depends(get_db)
):
    # ── Vérification permissions ──
    if not peut_uploader_vers(db, current_user, class_id):
        raise HTTPException(
            status_code = 403,
            detail      = "Tu ne peux pas uploader vers une classe de niveau supérieur"
        )

    # ── Vérification type de fichier ──
    if fichier.content_type not in TYPES_AUTORISES:
        raise HTTPException(
            status_code = 400,
            detail      = "Type de fichier non autorisé. PDF, Word, ZIP, images uniquement."
        )

    # ── Vérification taille ──
    contenu = fichier.file.read()
    if len(contenu) > TAILLE_MAX:
        raise HTTPException(
            status_code = 400,
            detail      = "Fichier trop lourd. Maximum 50 Mo."
        )

    # ── Upload vers Supabase ──
    try:
        storage_url = upload_fichier(
            contenu       = contenu,
            nom_original  = fichier.filename,
            content_type  = fichier.content_type
        )
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail      = f"Erreur lors de l'upload : {str(e)}"
        )

    # ── Créer en base ──
    nouveau_fichier = File(
        id          = uuid.uuid4(),
        title       = title,
        file_type   = file_type,
        status      = FileStatus.pending,
        uploader_id = current_user.id,
        class_id    = class_id,
        ecue_id     = ecue_id if ecue_id else None,
        storage_url = storage_url
    )

    db.add(nouveau_fichier)
    db.commit()
    db.refresh(nouveau_fichier)

    return {
        "id"         : str(nouveau_fichier.id),
        "title"      : nouveau_fichier.title,
        "status"     : nouveau_fichier.status,
        "storage_url": storage_url,
        "message"    : "Fichier uploadé — en attente de validation par 70% des membres"
    }
# ── VOTER POUR UN FICHIER ─────────────────────────────
@router.post("/{file_id}/vote")
def voter(
    file_id     : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    fichier = db.query(File).filter(File.id == file_id).first()

    if not fichier:
        raise HTTPException(404, "Fichier introuvable")

    if fichier.status == FileStatus.approved:
        raise HTTPException(400, "Ce fichier est déjà validé")


    if str(fichier.uploader_id) == str(current_user.id):
        raise HTTPException(
            status_code = 403,
            detail      = "Tu ne peux pas voter pour ton propre fichier"
        )


    deja_vote = db.query(Vote).filter(
        Vote.file_id  == file_id,
        Vote.voter_id == current_user.id
    ).first()

    if deja_vote:
        raise HTTPException(409, "Tu as déjà voté pour ce fichier")


    vote = Vote(
        id       = uuid.uuid4(),
        file_id  = file_id,
        voter_id = current_user.id
    )
    db.add(vote)
    db.commit()


    if seuil_atteint(db, file_id, fichier.class_id):
        fichier.status = FileStatus.approved
        db.commit()
        return {"message": "Vote enregistré — fichier validé à 70% ✅"}

    nb_votes   = compter_votes(db, file_id)
    nb_membres = compter_membres_actifs(db, fichier.class_id)

    return {
        "message" : "Vote enregistré",
        "votes"   : nb_votes,
        "required": int(nb_membres * 0.70),
        "total"   : nb_membres
    }


# ── SUPPRIMER UN FICHIER ──────────────────────────────
@router.delete("/{file_id}")
def supprimer_fichier(
    file_id     : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    fichier = db.query(File).filter(File.id == file_id).first()

    if not fichier:
        raise HTTPException(404, "Fichier introuvable")


    if str(fichier.uploader_id) != str(current_user.id):
        raise HTTPException(
            status_code = 403,
            detail      = "Tu ne peux supprimer que tes propres fichiers"
        )


    db.query(Vote).filter(Vote.file_id == file_id).delete()
    db.delete(fichier)
    db.commit()

    return {"message": "Fichier supprimé"}