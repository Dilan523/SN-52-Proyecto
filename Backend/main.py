# main.py
from fastapi import FastAPI
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from db import Base, engine
from routes.usuarios_controller import router as auth_router, router_compat as usuarios_compat_router
from routes.noticias_controller import router as noticias_router
from routes.roles_controller import router as roles_router
from routes.imagenes_controller import router as imagenes_router
from routes.comentarios_controller import router as comentarios_router
from routes.categoria_controller import router as categorias_router

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Inicializar la app FastAPI
app = FastAPI(title="SN-52 Backend")


@app.on_event("startup")
def on_startup():
    # Log a single startup message about DB readiness (avoid printing credentials every request)
    logging.getLogger("uvicorn.info").info("Backend iniciando: engine de base de datos configurado")

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia esto si tu frontend usa otro dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar carpeta para archivos estáticos (por ejemplo, imágenes o adjuntos)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configurar carpeta de plantillas HTML
templates = Jinja2Templates(directory="templates")

# Incluir routers
app.include_router(auth_router)           # Rutas /auth/...
app.include_router(usuarios_compat_router)  # Rutas /usuarios/... (compatibilidad con correos antiguos)
app.include_router(noticias_router)       # Rutas /api/noticias/...
app.include_router(roles_router)          # Rutas /api/roles/...
app.include_router(imagenes_router)       # Rutas /api/imagenes/...
app.include_router(comentarios_router)    # Rutas /api/comentarios/...
app.include_router(categorias_router)     # Rutas /categorias/...

# Ruta raíz de prueba
@app.get("/")
def read_root():
    return {"mensaje": "Backend SN-52 corriendo correctamente 🚀"}
