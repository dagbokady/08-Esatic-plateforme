from sqlalchemy import Column, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from app.database import Base



class UserRole(str, enum.Enum):
    student  = "student"
    delegate = "delegate"


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    matricule     = Column(String, nullable=False, unique=True)
    full_name     = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    is_active     = Column(Boolean, default=True, nullable=False)

    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)


    class_         = relationship("Class", foreign_keys=[class_id])
    memberships    = relationship("ClassMembership", back_populates="user")
    uploaded_files = relationship("File", back_populates="uploader")
    votes          = relationship("Vote", back_populates="voter")
    invitations = relationship("Invitation", back_populates="created_by_user")