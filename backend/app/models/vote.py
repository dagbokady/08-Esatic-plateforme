
from sqlalchemy import Column, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class ClassMembership(Base):
    __tablename__ = "class_memberships"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    class_id  = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)


    is_active = Column(Boolean, default=True, nullable=False)


    __table_args__ = (
        UniqueConstraint("user_id", "class_id", name="uq_membership"),
    )


    user   = relationship("User", back_populates="memberships")
    class_ = relationship("Class", back_populates="members")


class Vote(Base):
    __tablename__ = "votes"

    id       = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id  = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False)
    voter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    voted_at = Column(DateTime, default=datetime.utcnow, nullable=False)


    __table_args__ = (
        UniqueConstraint("file_id", "voter_id", name="uq_vote"),
    )

    file  = relationship("File", back_populates="votes")
    voter = relationship("User", back_populates="votes")