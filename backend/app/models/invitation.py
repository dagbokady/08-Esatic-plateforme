
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    token      = Column(String, nullable=False, unique=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active  = Column(Boolean, default=True, nullable=False)

    class_      = relationship("Class")
    created_by_user = relationship("User", back_populates="invitations")