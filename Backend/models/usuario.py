# usuario.py
from db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre_usuario = Column(String(60))
    apellido_usuario = Column(String(60))
    correo_usuario = Column(String(60), unique=True, index=True)
    contrasena_usuario = Column(String(255), nullable=False)
    foto_usuario = Column(String(255), nullable=True)

    rol_id = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    rol = relationship("Rol", back_populates="usuarios")
    comentarios = relationship("Comentario", back_populates="usuario")

    reset_token = Column(String(255), nullable=True)
    reset_token_expiration = Column(DateTime, nullable=True)


    # Campos para límite de intentos de login
    intentos_fallidos = Column(Integer, default=0, nullable=False)
    bloqueado_hasta = Column(DateTime, nullable=True)
