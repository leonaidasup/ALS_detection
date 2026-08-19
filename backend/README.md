ALS Detection API

API REST para la gestión de usuarios (medicos) y registro de pacientes dentro del sistema de detección de Esclerosis Lateral Amiotrófica (ELA). Construida con FastAPI, SQLAlchemy, PostgreSQL y Pydantic.
Requisitos Previos

    Python 3.10+

    PostgreSQL activo

    Gestor de paquetes uv instalado

Configuración del Proyecto

    Clonar el repositorio e ingresar a la carpeta:

     cd ALS_detection

    Sincronizar el entorno e instalar dependencias con uv:

     uv sync

    Variables de Entorno:
    Crea un archivo .env en la raíz del proyecto con la siguiente estructura:

     PROJECT_NAME="ALS Detection API"
     VERSION="1.0.0"
     API_V1_STR="/api/v1"

     # Base de datos
     POSTGRES_SERVER=localhost
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=tu_contraseña
     POSTGRES_DB=als_db
     POSTGRES_PORT=5432

     # Seguridad / JWT
     SECRET_KEY=tu_secret_key_aqui
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=60

Ejecución del Servidor

Para iniciar la API en modo de desarrollo con recarga automática:

    uv run uvicorn src.main:app --reload