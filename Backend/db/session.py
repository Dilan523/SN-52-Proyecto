"""Session wrapper que reutiliza la configuración en db.database
Evita engines duplicados y garantiza que todas las sesiones usen la misma conexión.
"""
from .database import SessionLocal, engine, get_db

# Reexportar SessionLocal y engine para compatibilidad si otros módulos los importan
# get_db está ya definido en db.database; lo reexportamos aquí.

__all__ = ["SessionLocal", "engine", "get_db"]
