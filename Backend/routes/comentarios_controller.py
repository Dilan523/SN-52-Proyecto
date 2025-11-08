from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from db.session import get_db
from models.comentario import Comentario
from models.noticia import Noticia
from dtos.comentario_dto import ComentarioCreate, ComentarioUpdate, ComentarioResponse
from security.auth import get_current_user
from models.usuario import Usuario

router = APIRouter(
    prefix="/api/comentarios",
    tags=["comentarios"]
)

@router.post("/", response_model=ComentarioResponse)
async def crear_comentario(
    comentario: ComentarioCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que la noticia existe
    noticia = db.query(Noticia).filter(Noticia.id_noticia == comentario.noticia_id).first()
    if not noticia:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    
    nuevo_comentario = Comentario(
        **comentario.dict(),
        fecha_creacion=datetime.utcnow(),
        estado=True,
        usuario_id=current_user.id_usuario
    )

    db.add(nuevo_comentario)
    db.commit()
    db.refresh(nuevo_comentario)

    # Build response with nested usuario info
    usuario_info = {
        'id': current_user.id_usuario,
        'nombre': f"{current_user.nombre_usuario} {current_user.apellido_usuario}".strip(),
        'foto': current_user.foto_usuario
    }

    response = {
        'id_comentario': nuevo_comentario.id_comentario,
        'contenido': nuevo_comentario.contenido,
        'fecha_creacion': nuevo_comentario.fecha_creacion,
        'noticia_id': nuevo_comentario.noticia_id,
        'usuario': usuario_info,
        'estado': nuevo_comentario.estado
    }
    return response

@router.get("/noticia/{noticia_id}", response_model=List[ComentarioResponse])
async def obtener_comentarios_noticia(
    noticia_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    comentarios = db.query(Comentario)\
        .filter(Comentario.noticia_id == noticia_id)\
        .filter(Comentario.estado == True)\
        .order_by(Comentario.fecha_creacion.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    results = []
    for c in comentarios:
        # usuario relationship may be loaded; guard against None
        usuario = None
        if hasattr(c, 'usuario') and c.usuario:
            usuario = {
                'id': getattr(c.usuario, 'id_usuario', None),
                'nombre': f"{getattr(c.usuario, 'nombre_usuario', '')} {getattr(c.usuario, 'apellido_usuario', '')}".strip(),
                'foto': getattr(c.usuario, 'foto_usuario', None)
            }
        else:
            usuario = {'id': c.usuario_id, 'nombre': None, 'foto': None}

        results.append({
            'id_comentario': c.id_comentario,
            'contenido': c.contenido,
            'fecha_creacion': c.fecha_creacion,
            'noticia_id': c.noticia_id,
            'usuario': usuario,
            'estado': c.estado
        })

    return results

@router.get("/{comentario_id}", response_model=ComentarioResponse)
async def obtener_comentario(
    comentario_id: int,
    db: Session = Depends(get_db)
):
    comentario = db.query(Comentario).filter(Comentario.id_comentario == comentario_id).first()
    if not comentario:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    return comentario

@router.put("/{comentario_id}", response_model=ComentarioResponse)
async def actualizar_comentario(
    comentario_id: int,
    comentario_update: ComentarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_comentario = db.query(Comentario).filter(Comentario.id_comentario == comentario_id).first()
    if not db_comentario:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    
    # Solo el autor del comentario o un administrador pueden modificarlo
    if current_user.rol_id != 1 and db_comentario.usuario_id != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar este comentario")
    
    for key, value in comentario_update.dict(exclude_unset=True).items():
        setattr(db_comentario, key, value)
    
    db.commit()
    db.refresh(db_comentario)
    return db_comentario

@router.delete("/{comentario_id}")
async def eliminar_comentario(
    comentario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_comentario = db.query(Comentario).filter(Comentario.id_comentario == comentario_id).first()
    if not db_comentario:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    
    # Solo el autor del comentario o un administrador pueden eliminarlo
    if current_user.rol_id != 1 and db_comentario.usuario_id != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este comentario")
    
    # Soft delete
    db_comentario.estado = False
    db.commit()
    return {"message": "Comentario eliminado correctamente"}

@router.put("/{comentario_id}/restaurar", response_model=ComentarioResponse)
async def restaurar_comentario(
    comentario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol_id != 1:  # Solo administradores pueden restaurar comentarios
        raise HTTPException(status_code=403, detail="No tienes permisos para restaurar comentarios")
    
    db_comentario = db.query(Comentario).filter(Comentario.id_comentario == comentario_id).first()
    if not db_comentario:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    
    db_comentario.estado = True
    db.commit()
    db.refresh(db_comentario)
    return db_comentario