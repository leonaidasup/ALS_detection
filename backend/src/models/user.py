from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from src.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Un doctor realiza muchos análisis [1: n]
    analyses = relationship("Analysis", back_populates="doctor")

    # Un doctor atiende a muchos pacientes [1: n]
    patients = relationship("Patient", back_populates="doctor")