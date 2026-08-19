import uuid
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cedula = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year_old = Column(Integer, nullable=False)

    # Un paciente tiene muchos análisis [1: n]
    analyses = relationship("Analysis", back_populates="patient")

    # Muchos pacientes pertenecen a un doctor [n: 1]
    doctor = relationship("User", back_populates="patients")