from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioShort(BaseModel):
    id: int
    nombre: str
    foto: Optional[str] = None

class ComentarioBase(BaseModel):
    contenido: str
    noticia_id: int

class ComentarioCreate(ComentarioBase):
    # Usuario se toma del token (current_user) en el servidor; no debe enviarse desde el cliente
    pass

class ComentarioUpdate(BaseModel):
    contenido: Optional[str] = None

class ComentarioResponse(BaseModel):
    id_comentario: int
    contenido: str
    fecha_creacion: datetime
    noticia_id: int
    usuario: UsuarioShort
    estado: Optional[bool] = True

    class Config:
        from_attributes = True