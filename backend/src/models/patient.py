from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from src.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year_old = Column(Integer, nullable=False)

    # un medico a muchos usuarios
    doctor = relationship("User", back_populates="patients")

    # un paciente muchos analisis [1: n] ademas eliminamos los analisis si se elimina el paciente
    analyses = relationship(
        "Analysis", back_populates="patient", cascade="all, delete-orphan"
    )