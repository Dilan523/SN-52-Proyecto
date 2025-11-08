from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.rol import Rol
from dtos.rol_dto import RolCreate, RolUpdate, RolResponse
from security.auth import get_current_user
from models.usuario import Usuario

router = APIRouter(
    prefix="/api/roles",
    tags=["roles"]
)

@router.post("/", response_model=RolResponse)
async def crear_rol(
    rol: RolCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol_id != 1:  # Solo administradores
        raise HTTPException(status_code=403, detail="No tienes permisos para crear roles")
    
    nuevo_rol = Rol(**rol.dict())
    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)
    return nuevo_rol

@router.get("/", response_model=List[RolResponse])
async def obtener_roles(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    roles = db.query(Rol).offset(skip).limit(limit).all()
    return roles

@router.get("/{rol_id}", response_model=RolResponse)
async def obtener_rol(
    rol_id: int,
    db: Session = Depends(get_db)
):
    rol = db.query(Rol).filter(Rol.id_rol == rol_id).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol

@router.put("/{rol_id}", response_model=RolResponse)
async def actualizar_rol(
    rol_id: int,
    rol_update: RolUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol_id != 1:  # Solo administradores
        raise HTTPException(status_code=403, detail="No tienes permisos para actualizar roles")
    
    db_rol = db.query(Rol).filter(Rol.id_rol == rol_id).first()
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    for key, value in rol_update.dict(exclude_unset=True).items():
        setattr(db_rol, key, value)
    
    db.commit()
    db.refresh(db_rol)
    return db_rol

@router.delete("/{rol_id}")
async def eliminar_rol(
    rol_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.rol_id != 1:  # Solo administradores
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar roles")
    
    db_rol = db.query(Rol).filter(Rol.id_rol == rol_id).first()
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    # Verificar que no haya usuarios con este rol
    usuarios_con_rol = db.query(Usuario).filter(Usuario.rol_id == rol_id).first()
    if usuarios_con_rol:
        raise HTTPException(status_code=400, detail="No se puede eliminar un rol que está siendo usado por usuarios")
    
    db.delete(db_rol)
    db.commit()
    return {"message": "Rol eliminado correctamente"}