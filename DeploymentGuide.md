# Guía de Deployment - Cloud Build (Sin Docker Desktop)

## Requisitos
- `gcloud` CLI instalado
- Cuenta de GCP con permisos de Cloud Build y Cloud Run
- Proyecto configurado en gcloud

## 1. Configurar Proyecto GCP

```bash
# Listar proyectos
gcloud projects list

# Configurar proyecto (reemplaza PROJECT_ID)
gcloud config set project als-detection-505902

# Verificar
gcloud config get-value project
```

## 2. Deploy Backend (FastAPI)

```bash
# Navega a la carpeta raíz
cd ALS_detection

# Construir y desplegar
gcloud builds submit ./backend \
  --tag gcr.io/als-detection-505902/als-backend:latest

# Desplegar en Cloud Run
gcloud run deploy als-backend \
  --image gcr.io/als-detection-505902/als-backend:latest \
  --port 8080 \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql+psycopg2://...
```

## 3. Deploy Frontend (React)

```bash
# Construir y desplegar
gcloud builds submit ./frontend \
  --tag gcr.io/als-detection-505902/als-frontend:latest

# Desplegar en Cloud Run
gcloud run deploy als-frontend \
  --image gcr.io/als-detection-505902/als-frontend:latest \
  --port 80 \
  --region us-central1 \
  --allow-unauthenticated
```

## 4. Verificar Deployments

```bash
# Ver servicios desplegados
gcloud run services list

# Ver logs del backend
gcloud run services logs read als-backend --region us-central1 --limit 50

# Ver logs del frontend
gcloud run services logs read als-frontend --region us-central1 --limit 50
```

## 5. URLs Resultantes

- **Frontend:** https://als-frontend-612025190132.us-central1.run.app
- **Backend:** https://als-backend-612025190132.us-central1.run.app

## Troubleshooting

### Error: Permission denied
```bash
gcloud auth login
```

### Error: Build failed
Verifica que los archivos `Dockerfile` estén en las carpetas correctas:
- `backend/Dockerfile`
- `frontend/Dockerfile`

### Error: 503 Service Unavailable
Verifica los logs:
```bash
gcloud run services logs read als-backend --limit 100
```

## Tips Útiles

- No necesitas Docker Desktop instalado
- GCP construye las imágenes automáticamente
- Cada deploy crea una nueva revisión (puedes revertir)
- Los costos son muy bajos para uso inicial

## Comandos Rápidos

```bash
# Redeploy backend
gcloud builds submit ./backend --tag gcr.io/als-detection-505902/als-backend:latest && \
gcloud run deploy als-backend --image gcr.io/als-detection-505902/als-backend:latest --port 8080 --region us-central1 --allow-unauthenticated

# Redeploy frontend
gcloud builds submit ./frontend --tag gcr.io/als-detection-505902/als-frontend:latest && \
gcloud run deploy als-frontend --image gcr.io/als-detection-505902/als-frontend:latest --port 80 --region us-central1 --allow-unauthenticated
```