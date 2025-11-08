from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .base import Base

# URL de conexión a tu base MySQL (ajusta según tu entorno)
SQLALCHEMY_DATABASE_URL = 'mysql+pymysql://root:admin@localhost:3315/sn-52-3147234'

# Engine y Session usando el Base definido en db/base.py para evitar bases duplicadas
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    # Avoid printing the DB URL on every request; use logging if needed
    try:
        yield db
    finally:
        db.close()
