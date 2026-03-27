
from app.database import SessionLocal
from app.models.academic import Level, Filiere, Class
import uuid

def seed():
    db = SessionLocal()

    # ── NIVEAUX ───────────────────────────────────────
    niveaux_data = [
        {"name": "Licence 1", "order_rank": 1},
        {"name": "Licence 2", "order_rank": 2},
        {"name": "Licence 3", "order_rank": 3},
        {"name": "Master 1",  "order_rank": 4},
        {"name": "Master 2",  "order_rank": 5},
    ]
    for n in niveaux_data:
        if not db.query(Level).filter_by(name=n["name"]).first():
            db.add(Level(id=uuid.uuid4(), **n))
    db.commit()
    print("✅ Niveaux insérés")

    # ── FILIÈRES ──────────────────────────────────────
    filieres_data = [
        "MP2i", "SRIT", "ENTD", "MPI", "SIGL",
        "RTEL", "CSIA", "DASI", "BIHAR", "MBDS", "ERIS"
    ]
    for f in filieres_data:
        if not db.query(Filiere).filter_by(name=f).first():
            db.add(Filiere(id=uuid.uuid4(), name=f))
    db.commit()
    print("✅ Filières insérées")

    # ── CLASSES ───────────────────────────────────────
    # Combinaisons valides selon le cahier des charges
    classes_data = [
        ("Licence 1", "MP2i"),
        ("Licence 1", "SRIT"),
        ("Licence 1", "ENTD"),
        ("Licence 2", "MPI"),
        ("Licence 2", "SRIT"),
        ("Licence 2", "SIGL"),
        ("Licence 2", "RTEL"),
        ("Licence 2", "CSIA"),
        ("Licence 2", "ENTD"),
        ("Licence 3", "MPI"),
        ("Licence 3", "SRIT"),
        ("Licence 3", "SIGL"),
        ("Licence 3", "RTEL"),
        ("Licence 3", "CSIA"),
        ("Licence 3", "ENTD"),
        ("Licence 3", "DASI"),
        ("Master 1",  "SIGL"),
        ("Master 1",  "RTEL"),
        ("Master 1",  "CSIA"),
        ("Master 1",  "BIHAR"),
        ("Master 1",  "MBDS"),
        ("Master 1",  "ERIS"),
        ("Master 2",  "SIGL"),
        ("Master 2",  "RTEL"),
        ("Master 2",  "CSIA"),
        ("Master 2",  "BIHAR"),
        ("Master 2",  "MBDS"),
        ("Master 2",  "ERIS"),
    ]

    for niveau_name, filiere_name in classes_data:
        niveau  = db.query(Level).filter_by(name=niveau_name).first()
        filiere = db.query(Filiere).filter_by(name=filiere_name).first()

        if not niveau or not filiere:
            print(f"⚠️  Niveau ou filière introuvable : {niveau_name} / {filiere_name}")
            continue

        existe = db.query(Class).filter_by(
            level_id=niveau.id,
            filiere_id=filiere.id
        ).first()

        if not existe:
            db.add(Class(
                id         = uuid.uuid4(),
                level_id   = niveau.id,
                filiere_id = filiere.id
            ))

    db.commit()
    print("✅ Classes insérées")
    print("✅ Seed terminé")
    db.close()

if __name__ == "__main__":
    seed()