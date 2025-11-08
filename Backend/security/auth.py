from fastapi import APIRouter, UploadFile, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.session import get_db
from models.usuario import Usuario
from security.passwords import encriptar_contrasena, verificar_contrasena
from security.jwt import create_access_token
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Autenticación"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register")
async def register(
    nombre_usuario: str = Form(...),
    apellido_usuario: str = Form(...),
    correo_usuario: str = Form(...),
    contrasena_usuario: str = Form(...),
    foto_usuario: UploadFile = None,
    db: Session = Depends(get_db)
):
    # Validar que no exista el correo
    existing_user = db.query(Usuario).filter(Usuario.correo_usuario == correo_usuario).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Correo ya registrado")

    hashed_password = encriptar_contrasena(contrasena_usuario)

    # Guardar foto si existe
    foto_filename = None
    if foto_usuario:
        foto_filename = f"{correo_usuario}.{foto_usuario.filename.split('.')[-1]}"
        file_path = f"static/fotos/{foto_filename}"
        with open(file_path, "wb") as f:
            content = await foto_usuario.read()
            f.write(content)

    nuevo_usuario = Usuario(
        nombre_usuario=nombre_usuario,
        apellido_usuario=apellido_usuario,
        correo_usuario=correo_usuario,
        contrasena_usuario=hashed_password,
        rol_id=2,  # Rol por defecto: escritor
        foto_usuario=foto_filename
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {"usuario_id": nuevo_usuario.id, "mensaje": "Usuario registrado correctamente"}

@router.post("/login")
async def login(
    correo_usuario: str = Form(...),
    contrasena_usuario: str = Form(...),
    db: Session = Depends(get_db)
):
    # Buscar usuario por el campo correcto
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == correo_usuario).first()
    if not usuario or not verificar_contrasena(contrasena_usuario, usuario.contrasena_usuario):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": usuario.correo_usuario})
    # Devolver token y datos del usuario para que el frontend los guarde
    usuario_payload = {
        "id": usuario.id_usuario,
        "nombre": usuario.nombre_usuario,
        "apellidos": usuario.apellido_usuario,
        "correo": usuario.correo_usuario,
        "foto": usuario.foto_usuario,
        "rol_id": usuario.rol_id
    }
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario_payload}

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    from security.jwt import verify_token
    try:
        payload = verify_token(token)
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        # Log payload for debugging (temporary)
        print(f"[auth] token payload: {payload}")
    except:
        raise credentials_exception
        
    # Allow token 'sub' to be either correo (email) or the numeric id
    usuario = None
    try:
        # if sub is numeric id, lookup by id_usuario
        user_id = int(sub)
        usuario = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    except Exception:
        # otherwise, assume sub is correo_usuario
        usuario = db.query(Usuario).filter(Usuario.correo_usuario == sub).first()
    # Log lookup result for debugging (temporary)
    if usuario:
        print(f"[auth] found user id={usuario.id_usuario} rol_id={usuario.rol_id} correo={usuario.correo_usuario}")
    else:
        print(f"[auth] no user found for sub={sub}")
    if usuario is None:
        raise credentials_exception
    return usuario
