# ALS Detection - Diagnóstico Asistido por IA

Sistema de diagnóstico de esclerosis lateral amiotrófica (ALS) usando machine learning. Aplicación full-stack con FastAPI (backend) y React (frontend) desplegada en Google Cloud Platform.
link del modelo de I: https://colab.research.google.com/drive/1pRcxXXU9VT2l58xZX_hjYOquT3A6IgQm?usp=sharing

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)             │
│              Cloud Run: als-frontend-*.run.app              │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI + Python)                 │
│              Cloud Run: als-backend-*.run.app               │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Cloud SQL (PostgreSQL)                   │
│                  als-detection-505902:us-central1           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Local

### Requisitos
- Python 3.12+
- Node.js 18+
- Docker Desktop
- `gcloud` CLI

### Setup Desarrollo

**1. Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Accede:**
```
http://localhost:3000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/api/v1/docs
```

## 📦 Despliegue en GCP

### Variables de Entorno Requeridas

**Backend (.env):**
```
DATABASE_URL=postgresql+psycopg2://usuario:contraseña@/basedatos?host=/cloudsql/proyecto:region:instancia
SECRET_KEY=tu_clave_secreta_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Deploy con Cloud Build (SIN Docker Desktop)

**Backend:**
```bash
gcloud builds submit ./backend --tag gcr.io/proyecto/backend:latest
gcloud run deploy backend --image gcr.io/proyecto/backend:latest \
  --port 8080 --region us-central1 --allow-unauthenticated
```

**Frontend:**
```bash
gcloud builds submit ./frontend --tag gcr.io/proyecto/frontend:latest
gcloud run deploy frontend --image gcr.io/proyecto/frontend:latest \
  --port 80 --region us-central1 --allow-unauthenticated
```

## 📋 Uso de la Aplicación

### 1. Crear Paciente
- Navega a "Pacientes"
- Ingresa cédula, nombre, edad
- Click en "Crear Paciente"

### 2. Hacer Análisis
- Selecciona un paciente existente
- **Opción A:** Ingresa biomarcadores manualmente
- **Opción B:** Carga un JSON con los valores
- Click en "Ejecutar Análisis Diagnóstico"

### 3. Formato JSON para Cargar

```json
{
  "1699": 113.0,
  "20919": 137.0,
  "15778": 118.0,
  "2007": 92.0,
  "34258": 11582.0
}
```

Las claves deben ser los IDs de los biomarcadores del modelo.

## 📊 API Endpoints

### Autenticación
```
POST   /api/v1/auth/login          → Login usuario
POST   /api/v1/auth/logout         → Logout
POST   /api/v1/auth/register       → Registrar nuevo usuario
```

### Pacientes
```
GET    /api/v1/patients/           → Listar pacientes
POST   /api/v1/patients/           → Crear paciente
GET    /api/v1/patients/{id}       → Obtener paciente
```

### Análisis
```
POST   /api/v1/analyses/           → Ejecutar análisis
GET    /api/v1/analyses/history    → Historial de análisis
GET    /api/v1/analyses/biomarkers → Biomarcadores requeridos
GET    /api/config                 → Configuración del API
```

## 🏗️ Estructura del Proyecto

```
ALS_detection/
├── backend/
│   ├── src/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   ├── core/
│   │   ├── curd/
│   │   ├── ml_models/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   ├── pages/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml
```

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ CORS restringido al frontend
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Variables de entorno para secrets
- ✅ HTTPS en producción (GCP)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

## 📝 Licencia

MIT License - Ver LICENSE para detalles

## 👥 Autor

- Leonardo Amaris 

**Estado:** ✅ Producción  
**Última actualización:** Agosto 2026  
**URLs de Producción:**
- Frontend: https://als-frontend-612025190132.us-central1.run.app
- Backend API: https://als-backend-612025190132.us-central1.run.app
