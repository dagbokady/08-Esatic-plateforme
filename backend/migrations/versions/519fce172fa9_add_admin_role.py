"""add admin role

Revision ID: 519fce172fa9
Revises: e7a073f4903f
Create Date: 2026-04-04 12:34:35.495037

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '519fce172fa9'
down_revision: Union[str, Sequence[str], None] = 'e7a073f4903f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade():
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'")

def downgrade():
    pass

