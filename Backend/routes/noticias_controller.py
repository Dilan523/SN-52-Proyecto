from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.noticia import Noticia
from models.imagen import Imagen
from dtos.noticia_dto import NoticiaCreate, NoticiaUpdate, NoticiaResponse
from security.auth import get_current_user
from models.usuario import Usuario
from datetime import date
import shutil
import os

router = APIRouter(
    prefix="/api/noticias",
    tags=["noticias"]
)

UPLOAD_DIRECTORY = "uploads/noticias"

@router.post("/", response_model=NoticiaResponse)
async def crear_noticia(
    request: Request,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Debug: mostrar info del usuario autenticado
    try:
        print(f"[noticias] crear_noticia called by user id={current_user.id_usuario} rol_id={current_user.rol_id} correo={getattr(current_user, 'correo_usuario', None)}")
    except Exception as e:
        print(f"[noticias] crear_noticia: error printing current_user: {e}")

    if getattr(current_user, 'rol_id', None) not in [1, 2]:  # Asumiendo 1: admin, 2: escritor
        raise HTTPException(status_code=403, detail="No tienes permisos para crear noticias")

    # Leer body raw para depurar y aceptar variantes - evita 422 por validación automática
    body = await request.json()
    print(f"[noticias] payload: {body}")

    # Validación mínima
    titulo = body.get('titulo')
    introduccion = body.get('introduccion', '')
    contenido = body.get('contenido', '')
    categoria_id = body.get('categoria_id')
    estado = body.get('estado', 1)

    if not titulo or not contenido or not categoria_id:
        raise HTTPException(status_code=422, detail="Faltan campos obligatorios: titulo, contenido o categoria_id")

    nueva_noticia = Noticia(
        titulo=titulo,
        introduccion=introduccion,
        contenido=contenido,
        categoria_id=int(categoria_id),
        usuario_escritor_id=current_user.id_usuario,
        fecha_creacion=date.today(),
        estado=int(estado)
    )

    db.add(nueva_noticia)
    db.commit()
    db.refresh(nueva_noticia)
    print(f"[noticias] noticia creada id={nueva_noticia.id_noticia} por usuario={nueva_noticia.usuario_escritor_id}")
    return nueva_noticia

@router.put("/{noticia_id}", response_model=NoticiaResponse)
async def actualizar_noticia(
    noticia_id: int,
    noticia_update: NoticiaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_noticia = db.query(Noticia).filter(Noticia.id_noticia == noticia_id).first()
    if not db_noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    if current_user.rol_id not in [1, 2] or (
        current_user.rol_id == 2 and db_noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para editar esta noticia")

    update_data = noticia_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_noticia, key, value)

    db.commit()
    db.refresh(db_noticia)
    return db_noticia

@router.delete("/{noticia_id}")
async def eliminar_noticia(
    noticia_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_noticia = db.query(Noticia).filter(Noticia.id_noticia == noticia_id).first()
    if not db_noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    if current_user.rol_id != 1 and (
        current_user.rol_id == 2 and db_noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta noticia")

    db.delete(db_noticia)
    db.commit()
    return {"message": "Noticia eliminada correctamente"}

@router.get("/", response_model=List[NoticiaResponse])
async def obtener_noticias(
    skip: int = 0,
    limit: int = 10,
    categoria_id: int = None,
    estado: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Noticia)
    if categoria_id:
        query = query.filter(Noticia.categoria_id == categoria_id)
    if estado:
        query = query.filter(Noticia.estado == estado)
    
    noticias = query.offset(skip).limit(limit).all()
    # Ensure each noticia has an imagen URL: if noticia.imagen is empty, try to get the first Imagen row
    for n in noticias:
        try:
            if not getattr(n, 'imagen', None):
                img = db.query(Imagen).filter(Imagen.noticia_id == n.id_noticia).order_by(Imagen.id_imagen.asc()).first()
                if img:
                    n.imagen = img.url
        except Exception:
            # don't fail the whole request if image lookup fails
            pass
    return noticias

@router.get("/{noticia_id}", response_model=NoticiaResponse)
async def obtener_noticia(
    noticia_id: int,
    db: Session = Depends(get_db)
):
    noticia = db.query(Noticia).filter(Noticia.id_noticia == noticia_id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    return noticia

@router.post("/{noticia_id}/imagen")
async def subir_imagen_noticia(
    noticia_id: int,
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_noticia = db.query(Noticia).filter(Noticia.id_noticia == noticia_id).first()
    if not db_noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    if current_user.rol_id not in [1, 2] or (
        current_user.rol_id == 2 and db_noticia.usuario_escritor_id != current_user.id_usuario
    ):
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar esta noticia")

    # Crear el directorio si no existe
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    
    # Generar nombre único para el archivo
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"noticia_{noticia_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
    # Guardar el archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Actualizar la ruta de la imagen en la base de datos
    db_noticia.imagen = file_path
    db.commit()
    
    return {"filename": file_name}