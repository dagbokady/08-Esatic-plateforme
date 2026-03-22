from sqlalchemy import Column, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.database import Base


class FileStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"


class FileType(str, enum.Enum):
    cours   = "cours"
    sujet   = "sujet"
    corrige = "corrige"
    td_tp   = "td_tp"


class File(Base):
    __tablename__ = "files"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title       = Column(String, nullable=False)
    file_type   = Column(Enum(FileType), nullable=False)
    status      = Column(Enum(FileStatus), default=FileStatus.pending, nullable=False)
    storage_url = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    class_id    = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    ecue_id     = Column(UUID(as_uuid=True), ForeignKey("ecues.id"), nullable=True)


    uploader = relationship("User", back_populates="uploaded_files")
    class_   = relationship("Class", back_populates="files")
    ecue     = relationship("ECUE", back_populates="files")
    votes    = relationship("Vote", back_populates="file")


class ECUE(Base):
    __tablename__ = "ecues"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    class_id   = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)


    class_  = relationship("Class", back_populates="ecues")
    creator = relationship("User")
    files   = relationship("File", back_populates="ecue")