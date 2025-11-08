# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Usuario para lectura
class UsuarioOut(BaseModel):
    id: int
    nombre: str
    apellidos: str
    correo: EmailStr
    foto: Optional[str]
    rol_id: int

    model_config = {"from_attributes": True}

# Usuario para registro
class UsuarioRegister(BaseModel):
    nombre_usuario: str
    apellido_usuario: str
    correo_usuario: EmailStr
    contrasena_usuario: str
    rol_id: int = 1
    foto_usuario: Optional[str]

    model_config = {"from_attributes": True}

# Usuario para login
class UsuarioLogin(BaseModel):
    correo_usuario: EmailStr
    contrasena_usuario: str

    model_config = {"from_attributes": True}

# Respuesta del login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioOut

    model_config = {"from_attributes": True}

# Recuperar contraseña
class RecuperarPasswordRequest(BaseModel):
    email: EmailStr

    model_config = {"from_attributes": True}
