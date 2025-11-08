from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from db.session import get_db
from models.imagen import Imagen
from models.noticia import Noticia
from dtos.imagen_dto import ImagenCreate, ImagenUpdate, ImagenResponse
from datetime import date
from security.auth import get_current_user
from models.usuario import Usuario

router = APIRouter(
    prefix="/api/imagenes",
    tags=["imagenes"]
)

UPLOAD_DIRECTORY = "uploads/imagenes"

@router.post("/", response_model=ImagenResponse)
async def crear_imagen(
    noticia_id: int,
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que la noticia existe
    noticia = db.query(Noticia).filter(Noticia.id_noticia == noticia_id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    # Verificar permisos
    if current_user.rol_id not in [1, 2] or (
        current_user.rol_id == 2 and noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para agregar imágenes a esta noticia")
    
    # Crear directorio si no existe
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    
    # Guardar archivo
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"noticia_{noticia_id}_{os.urandom(8).hex()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Crear registro en base de datos
    # tipo_archivo: guardar sin el punto
    tipo_archivo = file_extension.lstrip('.') if file_extension else None
    nueva_imagen = Imagen(
        url=file_path,
        tipo_archivo=tipo_archivo,
        noticia_id=noticia_id,
        fecha_creacion=date.today()
    )

    # Asociar imagen a la noticia (actualizar campo imagen en Noticia) para permitir
    # que endpoints que retornan la noticia incluyan la ruta de la imagen principal.
    noticia.imagen = file_path

    db.add(nueva_imagen)
    db.commit()
    db.refresh(nueva_imagen)
    # refresh noticia as well
    db.refresh(noticia)
    return nueva_imagen

@router.get("/noticia/{noticia_id}", response_model=List[ImagenResponse])
async def obtener_imagenes_noticia(
    noticia_id: int,
    db: Session = Depends(get_db)
):
    imagenes = db.query(Imagen).filter(Imagen.noticia_id == noticia_id).all()
    return imagenes

@router.get("/{imagen_id}", response_model=ImagenResponse)
async def obtener_imagen(
    imagen_id: int,
    db: Session = Depends(get_db)
):
    imagen = db.query(Imagen).filter(Imagen.id_imagen == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return imagen

@router.put("/{imagen_id}", response_model=ImagenResponse)
async def actualizar_imagen(
    imagen_id: int,
    imagen_update: ImagenUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_imagen = db.query(Imagen).filter(Imagen.id_imagen == imagen_id).first()
    if not db_imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Verificar permisos
    noticia = db.query(Noticia).filter(Noticia.id_noticia == db_imagen.noticia_id).first()
    if current_user.rol_id not in [1, 2] or (
        current_user.rol_id == 2 and noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar esta imagen")
    
    for key, value in imagen_update.dict(exclude_unset=True).items():
        setattr(db_imagen, key, value)
    
    db.commit()
    db.refresh(db_imagen)
    return db_imagen

@router.delete("/{imagen_id}")
async def eliminar_imagen(
    imagen_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_imagen = db.query(Imagen).filter(Imagen.id_imagen == imagen_id).first()
    if not db_imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Verificar permisos
    noticia = db.query(Noticia).filter(Noticia.id_noticia == db_imagen.noticia_id).first()
    if current_user.rol_id not in [1, 2] or (
        current_user.rol_id == 2 and noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta imagen")
    
    # Eliminar archivo físico
    if os.path.exists(db_imagen.url):
        os.remove(db_imagen.url)
    
    db.delete(db_imagen)
    db.commit()
    return {"message": "Imagen eliminada correctamente"}