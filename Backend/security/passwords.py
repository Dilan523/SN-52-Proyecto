from passlib.context import CryptContext

# Configuración de bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def encriptar_contrasena(password: str) -> str:
    """Genera un hash seguro de la contraseña"""
    return pwd_context.hash(password)

def verificar_contrasena(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña ingresada coincida con el hash almacenado"""
    return pwd_context.verify(plain_password, hashed_password)
