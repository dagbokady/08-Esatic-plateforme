from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.academic import Class, Level, Filiere
from app.models.vote import ClassMembership
from app.models.invitation import Invitation
from app.models.user import User
from app.utils.dependencies import get_current_user, get_current_delegate
import uuid, secrets

router = APIRouter(prefix="/classes", tags=["Classes"])


# ── LISTE DES CLASSES ─────────────────────────────────
@router.get("/")
def liste_classes(db: Session = Depends(get_db)):
    classes = db.query(Class).all()
    resultat = []
    for c in classes:
        niveau  = db.query(Level).filter(Level.id == c.level_id).first()
        filiere = db.query(Filiere).filter(Filiere.id == c.filiere_id).first()
        resultat.append({
            "id"      : str(c.id),
            "niveau"  : niveau.name  if niveau  else None,
            "filiere" : filiere.name if filiere else None,
            "rank"    : niveau.order_rank if niveau else 0
        })
    return sorted(resultat, key=lambda x: x["rank"])


# ── MA CLASSE ─────────────────────────────────────────
@router.get("/ma-classe")
def ma_classe(
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    if not current_user.class_id:
        raise HTTPException(404, "Tu n'as pas de classe assignée")

    classe  = db.query(Class).filter(Class.id == current_user.class_id).first()
    niveau  = db.query(Level).filter(Level.id == classe.level_id).first()
    filiere = db.query(Filiere).filter(Filiere.id == classe.filiere_id).first()

    nb_membres = db.query(ClassMembership).filter(
        ClassMembership.class_id  == current_user.class_id,
        ClassMembership.is_active == True
    ).count()

    return {
        "id"        : str(classe.id),
        "niveau"    : niveau.name,
        "filiere"   : filiere.name,
        "nb_membres": nb_membres
    }


# ── CRÉER UN LIEN D'INVITATION (délégué seulement) ────
@router.post("/{class_id}/invitations")
def creer_invitation(
    class_id    : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):

    if str(current_user.class_id) != class_id:
        raise HTTPException(
            status_code = 403,
            detail      = "Tu ne peux créer des invitations que pour ta propre classe"
        )


    db.query(Invitation).filter(
        Invitation.class_id  == class_id,
        Invitation.is_active == True
    ).update({"is_active": False})


    nouvelle_invitation = Invitation(
        id         = uuid.uuid4(),
        class_id   = class_id,
        token      = secrets.token_urlsafe(32),
        created_by = current_user.id,
        is_active  = True
    )
    db.add(nouvelle_invitation)
    db.commit()

    return {
        "lien"      : f"/invitations/{nouvelle_invitation.token}",
        "token"     : nouvelle_invitation.token,
        "class_id"  : class_id
    }


# ── REJOINDRE VIA INVITATION ──────────────────────────
@router.post("/rejoindre/{token}")
def rejoindre_via_invitation(
    token       : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):

    invitation = db.query(Invitation).filter(
        Invitation.token     == token,
        Invitation.is_active == True
    ).first()

    if not invitation:
        raise HTTPException(404, "Lien d'invitation invalide ou expiré")


    deja_membre = db.query(ClassMembership).filter(
        ClassMembership.user_id  == current_user.id,
        ClassMembership.class_id == invitation.class_id
    ).first()

    if deja_membre:
        if deja_membre.is_active:
            raise HTTPException(409, "Tu es déjà membre de cette classe")
        else:
            # Réactiver si il était parti
            deja_membre.is_active = True
            db.commit()
            return {"message": "Bienvenue à nouveau dans la classe"}

    # Créer le membership
    membership = ClassMembership(
        id       = uuid.uuid4(),
        user_id  = current_user.id,
        class_id = invitation.class_id,
        is_active= True
    )
    db.add(membership)
    db.commit()

    return {"message": "Tu as rejoint la classe avec succès"}


# ── QUITTER UNE CLASSE ────────────────────────────────
@router.delete("/{class_id}/quitter")
def quitter_classe(
    class_id    : str,
    current_user: User    = Depends(get_current_user),
    db          : Session = Depends(get_db)
):
    membership = db.query(ClassMembership).filter(
        ClassMembership.user_id  == current_user.id,
        ClassMembership.class_id == class_id,
        ClassMembership.is_active == True
    ).first()

    if not membership:
        raise HTTPException(404, "Tu n'es pas membre de cette classe")


    membership.is_active = False


    from app.models.vote import Vote
    from app.models.file import File, FileStatus
    from math import ceil

    votes_a_retirer = db.query(Vote).join(File).filter(
        File.class_id    == class_id,
        File.status      == FileStatus.pending,
        Vote.voter_id    == current_user.id
    ).all()

    for vote in votes_a_retirer:
        db.delete(vote)

    db.commit()

    return {"message": "Tu as quitté la classe"}

# ── DEMANDES EN ATTENTE (délégué) ─────────────────────
@router.get("/{class_id}/demandes")
def demandes_en_attente(
    class_id    : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):
    if str(current_user.class_id) != class_id:
        raise HTTPException(403, "Tu ne gères que ta propre classe")

    from app.models.user import ApprovalStatus
    demandes = db.query(User).filter(
        User.class_id        == class_id,
        User.approval_status == ApprovalStatus.pending
    ).all()

    return [
        {
            "id"       : str(u.id),
            "matricule": u.matricule,
            "full_name": u.full_name,
        }
        for u in demandes
    ]


# ── APPROUVER UN ÉTUDIANT (délégué) ───────────────────
@router.post("/{class_id}/approuver/{user_id}")
def approuver_etudiant(
    class_id    : str,
    user_id     : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):
    if str(current_user.class_id) != class_id:
        raise HTTPException(403, "Tu ne gères que ta propre classe")

    from app.models.user import ApprovalStatus
    etudiant = db.query(User).filter(User.id == user_id).first()
    if not etudiant:
        raise HTTPException(404, "Étudiant introuvable")

    etudiant.approval_status = ApprovalStatus.approved

    # Créer le membership automatiquement
    from app.models.vote import ClassMembership
    deja = db.query(ClassMembership).filter(
        ClassMembership.user_id  == user_id,
        ClassMembership.class_id == class_id
    ).first()
    if not deja:
        db.add(ClassMembership(
            id       = uuid.uuid4(),
            user_id  = user_id,
            class_id = class_id,
            is_active= True
        ))

    db.commit()
    return {"message": f"{etudiant.full_name} a été approuvé"}


# ── REFUSER UN ÉTUDIANT (délégué) ─────────────────────
@router.post("/{class_id}/refuser/{user_id}")
def refuser_etudiant(
    class_id    : str,
    user_id     : str,
    current_user: User    = Depends(get_current_delegate),
    db          : Session = Depends(get_db)
):
    if str(current_user.class_id) != class_id:
        raise HTTPException(403, "Tu ne gères que ta propre classe")

    from app.models.user import ApprovalStatus
    etudiant = db.query(User).filter(User.id == user_id).first()
    if not etudiant:
        raise HTTPException(404, "Étudiant introuvable")

    etudiant.approval_status = ApprovalStatus.rejected
    db.commit()
    return {"message": f"Inscription de {etudiant.full_name} refusée"}