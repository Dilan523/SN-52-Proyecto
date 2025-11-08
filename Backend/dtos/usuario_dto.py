from pydantic import BaseModel, EmailStr

class UsuarioCreateDTO(BaseModel):
    nombre_usuario: str
    apellido_usuario: str
    correo_usuario: EmailStr
    contrasena_usuario: str
    rol_id: int   # 1 = lector, 2 = escritor, 3 = editor

class UsuarioLoginDTO(BaseModel):
    correo_usuario: EmailStr
    contrasena_usuario: str
