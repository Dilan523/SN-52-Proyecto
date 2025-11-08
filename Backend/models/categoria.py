from db import Base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class Categoria(Base):
    __tablename__ = "categorias"
    id_categoria = Column(Integer,
                primary_key=True)
    fecha_creacion = Column(Date)
    estado = Column(Boolean)
    nombre = Column(String(60))
    
    # #relacion uno a muchos
    noticias = relationship("Noticia", back_populates="categoria")