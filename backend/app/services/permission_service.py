
from sqlalchemy.orm import Session
from app.models.academic import Class, Level
from app.models.user import User
from app.models.vote import ClassMembership


def get_class_level(db: Session, class_id) -> int:

    classe = db.query(Class).filter(Class.id == class_id).first()
    if not classe:
        return -1
    niveau = db.query(Level).filter(Level.id == classe.level_id).first()
    return niveau.order_rank if niveau else -1


def peut_voir_fichiers(db: Session, user: User, class_id) -> bool:
    return str(user.class_id) == str(class_id)


def peut_uploader_vers(db: Session, user: User, class_id) -> bool:

    niveau_user   = get_class_level(db, user.class_id)
    niveau_cible  = get_class_level(db, class_id)

    if niveau_user == -1 or niveau_cible == -1:
        return False

    return niveau_cible <= niveau_user


def est_membre_actif(db: Session, user_id, class_id) -> bool:

    membership = db.query(ClassMembership).filter(
        ClassMembership.user_id  == user_id,
        ClassMembership.class_id == class_id,
        ClassMembership.is_active == True
    ).first()
    return membership is not None


def compter_membres_actifs(db: Session, class_id) -> int:

    return db.query(ClassMembership).filter(
        ClassMembership.class_id  == class_id,
        ClassMembership.is_active == True
    ).count()


def compter_votes(db: Session, file_id) -> int:

    from app.models.vote import Vote
    return db.query(Vote).filter(
        Vote.file_id == file_id
    ).count()


def seuil_atteint(db: Session, file_id, class_id) -> bool:

    from math import ceil
    membres = compter_membres_actifs(db, class_id)
    if membres == 0:
        return False
    votes    = compter_votes(db, file_id)
    seuil    = ceil(membres * 0.70)
    return votes >= seuil