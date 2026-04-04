from alembic import op
import sqlalchemy as sa

revision = '2ff0d2269f8e'
down_revision = '519fce172fa9'
branch_labels = None
depends_on = None


def upgrade():
    # Créer le type ENUM d'abord
    op.execute("CREATE TYPE approvalstatus AS ENUM ('pending', 'approved', 'rejected')")

    # Puis ajouter la colonne avec une valeur par défaut
    op.execute("""
        ALTER TABLE users
        ADD COLUMN approval_status approvalstatus
        NOT NULL DEFAULT 'approved'
    """)

    # Mettre pending pour les users qui n'ont pas de classe
    # (ils doivent attendre approbation)
    op.execute("""
        UPDATE users SET approval_status = 'approved'
        WHERE role = 'admin'
    """)


def downgrade():
    op.drop_column('users', 'approval_status')
    op.execute("DROP TYPE approvalstatus")