from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoriaDTO(BaseModel):
    id_categoria: Optional[int] = None
    nombre: str
    fecha_creacion: Optional[datetime] = None
    estado: Optional[bool] = True

    model_config = {
        "from_attributes": True
    }