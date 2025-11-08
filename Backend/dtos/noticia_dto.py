from datetime import date
from pydantic import BaseModel
from typing import Optional, List

class NoticiaBase(BaseModel):
    titulo: str
    introduccion: str
    contenido: str
    categoria_id: int
    # usuario_escritor_id will be set by the backend from the authenticated user
    estado: Optional[int] = 1  # 1: borrador, 2: en revisión, 3: publicada

class NoticiaCreate(NoticiaBase):
    pass

class NoticiaUpdate(BaseModel):
    titulo: Optional[str] = None
    introduccion: Optional[str] = None
    contenido: Optional[str] = None
    categoria_id: Optional[int] = None
    estado: Optional[int] = None
    usuario_revisor_id: Optional[int] = None

class NoticiaResponse(NoticiaBase):
    id_noticia: int
    fecha_creacion: date
    imagen: Optional[str] = None
    usuario_revisor_id: Optional[int] = None
    usuario_escritor_id: Optional[int] = None

    class Config:
        # Pydantic v2 renamed 'orm_mode' to 'from_attributes'
        from_attributes = True