from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class Level(Base):
    __tablename__ = "levels"
    id = Column(UUID(as_uuid=True),primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False,unique=True)
    order_rank = Column(Integer,nullable=False)
    classes = relationship("Class", back_populates="level")

class Filiere(Base):
    __tablename__ = "filieres"
    id = Column(UUID(as_uuid=True),primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False,unique=True)
    classes = relationship("Class", back_populates="filiere")

class Class(Base):
    __tablename__ = "classes"
    id = Column(UUID(as_uuid=True),primary_key=True, default=uuid.uuid4)
    level_id = Column(UUID(as_uuid=True),ForeignKey("levels.id"), nullable=False)
    filiere_id = Column(UUID(as_uuid=True),ForeignKey("filieres.id"), nullable=False)
    __table_args__ = (
        UniqueConstraint("level_id", "filiere_id", name="uq_class_level_filiere"),
    )
    level = relationship("Level", back_populates="classes")
    filiere = relationship("Filiere", back_populates="classes")
    members = relationship("ClassMembership", back_populates="class_")
    ecues = relationship("ECUE", back_populates="class_")
    files = relationship("File", back_populates="class_")