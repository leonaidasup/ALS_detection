from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # Verifica la conexion
    pool_size=5,              # Conexiones persistentes a mantener por instancia/contenedor
    max_overflow=10,          # Conexiones adicionales temporales durante picos de trafico
    pool_recycle=900,         # Reinicia conexiones cada 15 min
    pool_timeout=30           # Segundos maximos de espera para obtener una conexion libre
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