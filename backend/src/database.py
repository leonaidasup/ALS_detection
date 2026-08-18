from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # verifica la conexion
    pool_size=5,              # 5 conexiones persistentes
    max_overflow=10,          # 10 conexiones adicionales en picos de consumo
    pool_recycle=900,         # reinicia conexiones cada 15 min
    pool_timeout=30           # segundos maximos de espera para obtener una conexion libre
)

# crear de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# mapear las tablas (ORM)
Base = declarative_base()

# generar y entregar sesion
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()