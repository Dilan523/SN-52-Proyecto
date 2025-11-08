from pydantic import BaseModel
from typing import Optional

class ImagenBase(BaseModel):
    url: str
    noticia_id: int

class ImagenCreate(ImagenBase):
    pass

class ImagenUpdate(ImagenBase):
    url: Optional[str] = None
    noticia_id: Optional[int] = None

class ImagenResponse(ImagenBase):
    id_imagen: int

    class Config:
        # Pydantic v2 renamed 'orm_mode' to 'from_attributes'
        from_attributes = True