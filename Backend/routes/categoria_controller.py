from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from models.categoria import Categoria
from dtos.categoria_dto import CategoriaDTO
from db.session import SessionLocal
#objeto que contiene este grupo de rutas
# obtener el objeto sesión de la base de datos
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
            db.close()

router = APIRouter( prefix="/categorias" )

#crear cada ruta 
@router.get('/', response_model=List[CategoriaDTO])
def listar_categorias(db: Session = Depends(get_session)):
    categorias = db.query(Categoria).all()
    return [CategoriaDTO(id_categoria=c.id_categoria, nombre=c.nombre, fecha_creacion=c.fecha_creacion, estado=c.estado) for c in categorias]

#ruta parametrizada
@router.get('/{id}')
def listar_por_id(id: int):
    return f"Categoría con ID: {id}"

#ruta post
@router.post('/')
def crear_categoria(nueva_categoria: CategoriaDTO,
                    db: Session = Depends(get_session)):
    nc = Categoria(
        nombre = nueva_categoria.nombre)
    db.add(nc)
    db.commit()
    db.refresh(nc)
    return nc

#ruta put
@router.put('/{id}')
def actualizar_categoria(id: int):
    return f"Categoría con ID: {id} actualizada con éxito"

#ruta delete
@router.delete('/{id}')
def eliminar_categoria(id: int):
    return f"Categoría con ID: {id} eliminada con éxito"