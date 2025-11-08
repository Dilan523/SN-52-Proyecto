from db import Base
from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship

class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True)
    fecha_creacion = Column(Date)
    nombre = Column(String(60), unique=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")
