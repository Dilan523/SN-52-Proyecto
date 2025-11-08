# routes/usuarios_controller.py
from fastapi import (
    APIRouter, Depends, HTTPException, status,
    UploadFile, File, Form, Body, Request
)
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from db.session import get_db
from models.usuario import Usuario
from models.schemas import UsuarioOut, TokenResponse, RecuperarPasswordRequest
from security.passwords import encriptar_contrasena, verificar_contrasena
from security.jwt import create_access_token
from datetime import datetime, timedelta
import uuid

# Servicio de correo (usa Mailjet; ya lo tienes en services/mail_service.py)
from services.mail_service import enviar_correo_bienvenida, enviar_correo_recuperacion

# Router principal (mantengo /auth para que queden las rutas originales)
router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Templates (renderizar formularios)
templates = Jinja2Templates(directory="templates")


# ----------------- Registro -----------------
@router.post("/register", response_model=UsuarioOut)
async def register(
    nombre_usuario: str = Form(...),
    apellido_usuario: str = Form(...),
    correo_usuario: str = Form(...),
    contrasena_usuario: str = Form(...),
    rol_id: int = Form(1),
    foto_usuario: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    # Verificar si el correo ya existe
    if db.query(Usuario).filter(Usuario.correo_usuario == correo_usuario).first():
        raise HTTPException(status_code=400, detail="Correo ya registrado")

    hashed_password = encriptar_contrasena(contrasena_usuario)

    # Crear usuario
    nuevo_usuario = Usuario(
        nombre_usuario=nombre_usuario,
        apellido_usuario=apellido_usuario,
        correo_usuario=correo_usuario,
        contrasena_usuario=hashed_password,
        rol_id=rol_id,
        foto_usuario=foto_usuario.filename if foto_usuario else None
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Guardar foto si se subió
    if foto_usuario:
        with open(f"uploads/{foto_usuario.filename}", "wb") as f:
            f.write(await foto_usuario.read())

    # Enviar correo de bienvenida (no bloquea el registro)
    try:
        enviar_correo_bienvenida(destinatario=nuevo_usuario.correo_usuario, nombre=nuevo_usuario.nombre_usuario)
    except Exception as e:
        print(f"⚠️ Error enviando correo de bienvenida: {e}")

    return UsuarioOut(
        id=nuevo_usuario.id_usuario,
        nombre=nuevo_usuario.nombre_usuario,
        apellidos=nuevo_usuario.apellido_usuario,
        correo=nuevo_usuario.correo_usuario,
        foto=nuevo_usuario.foto_usuario,
        rol_id=nuevo_usuario.rol_id
    )


# ----------------- Login -----------------
@router.post("/login", response_model=TokenResponse)
def login(
    correo_usuario: str = Form(...),
    contrasena_usuario: str = Form(...),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == correo_usuario).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Correo no registrado")

    # Verificar si la cuenta está bloqueada
    if usuario.bloqueado_hasta and usuario.bloqueado_hasta > datetime.utcnow():
        tiempo_restante = usuario.bloqueado_hasta - datetime.utcnow()
        minutos = int(tiempo_restante.total_seconds() / 60)
        raise HTTPException(status_code=429, detail=f"Cuenta bloqueada. Intenta de nuevo en {minutos} minutos.")

    if not verificar_contrasena(contrasena_usuario, usuario.contrasena_usuario):
        # Incrementar intentos fallidos
        usuario.intentos_fallidos += 1

        if usuario.intentos_fallidos >= 3:
            # Bloquear por 15 minutos
            usuario.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=15)
            usuario.intentos_fallidos = 0  # Resetear intentos
            db.commit()
            raise HTTPException(status_code=429, detail="Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.")
        else:
            db.commit()
            raise HTTPException(status_code=400, detail=f"Contraseña incorrecta. Intentos restantes: {3 - usuario.intentos_fallidos}")

    # Login exitoso: resetear intentos fallidos
    usuario.intentos_fallidos = 0
    usuario.bloqueado_hasta = None
    db.commit()

    token = create_access_token({"sub": str(usuario.id_usuario), "rol_id": usuario.rol_id})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        usuario=UsuarioOut(
            id=usuario.id_usuario,
            nombre=usuario.nombre_usuario,
            apellidos=usuario.apellido_usuario,
            correo=usuario.correo_usuario,
            foto=usuario.foto_usuario,
            rol_id=usuario.rol_id
        )
    )


# ----------------- Actualizar perfil -----------------
@router.put("/update/{user_id}", response_model=UsuarioOut)
async def update_user(
    user_id: int,
    nombre_usuario: str = Form(...),
    apellido_usuario: str = Form(...),
    correo_usuario: str = Form(...),
    foto_usuario: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.nombre_usuario = nombre_usuario
    usuario.apellido_usuario = apellido_usuario
    usuario.correo_usuario = correo_usuario

    if foto_usuario:
        filename = foto_usuario.filename
        with open(f"uploads/{filename}", "wb") as f:
            f.write(await foto_usuario.read())
        usuario.foto_usuario = filename

    db.commit()
    db.refresh(usuario)

    return UsuarioOut(
        id=usuario.id_usuario,
        nombre=usuario.nombre_usuario,
        apellidos=usuario.apellido_usuario,
        correo=usuario.correo_usuario,
        foto=usuario.foto_usuario,
        rol_id=usuario.rol_id
    )


# ----------------- Recuperar contraseña (envía correo) -----------------
@router.post("/recuperar-password")
async def recuperar_password(req: RecuperarPasswordRequest, db: Session = Depends(get_db)):
    # Nota: RecuperarPasswordRequest tiene el campo `email` (según tu schemas.py)
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == req.email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Generar token y expiración
    token = str(uuid.uuid4())
    usuario.reset_token = token
    usuario.reset_token_expira = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    # Elige la ruta que quieras usar en el enlace. Mantengo /auth/reset-password para coherencia.
    link = f"http://127.0.0.1:8000/auth/reset-password/{token}"

    # Enviar correo con token (usa tu servicio Mailjet)
    try:
        enviar_correo_recuperacion(destinatario=usuario.correo_usuario, nombre=usuario.nombre_usuario, token=token)
    except Exception as e:
        # si falla el envío real, imprimimos el link en consola para pruebas
        print(f"⚠️ Error enviando correo de recuperación: {e}")
        print("Link de prueba:", link)

    return JSONResponse({"msg": "Se ha enviado un correo con las instrucciones para recuperar tu contraseña.", "link_prueba": link})


# ----------------- Restablecer contraseña vía API (POST) -----------------
@router.post("/reset-password")
def reset_password_api(
    token: str = Body(...),
    nueva_password: str = Body(...),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.reset_token == token).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Token inválido")

    if usuario.reset_token_expira and usuario.reset_token_expira < datetime.utcnow():
        raise HTTPException(status_code=400, detail="El token ha expirado. Solicita uno nuevo.")

    usuario.contrasena_usuario = encriptar_contrasena(nueva_password)
    usuario.reset_token = None
    usuario.reset_token_expiration = None
    db.commit()

    return {"msg": "Contraseña actualizada correctamente"}


# ----------------- RUTAS HTML para reset (GET/POST) -----------------
# 1) GET que muestra el formulario (ruta bajo /auth)
@router.get("/reset-password/{token}")
async def mostrar_formulario_reset_auth(request: Request, token: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.reset_token == token).first()
    if not usuario:
        # mostrar página simple de error
        return templates.TemplateResponse("reset_error.html", {"request": request, "mensaje": "Token inválido o usuario no existe."}, status_code=404)

    if usuario.reset_token_expira and usuario.reset_token_expira < datetime.utcnow():
        return templates.TemplateResponse("reset_error.html", {"request": request, "mensaje": "El enlace ha expirado."}, status_code=400)

    # muestra el formulario, pasamos token al template
    return templates.TemplateResponse("reset_password.html", {"request": request, "token": token})


# 2) POST que procesa el formulario enviado desde el navegador (ruta bajo /auth)
@router.post("/reset-password/{token}")
async def procesar_reset_password_auth(
    request: Request,
    token: str,
    nueva_contrasena: str = Form(...),
    confirmar_contrasena: str = Form(...),
    db: Session = Depends(get_db),
):
    usuario = db.query(Usuario).filter(Usuario.reset_token == token).first()
    if not usuario:
        return templates.TemplateResponse("reset_error.html", {"request": request, "mensaje": "Token inválido o usuario no existe."}, status_code=404)

    if usuario.reset_token_expiration and usuario.reset_token_expira < datetime.utcnow():
        return templates.TemplateResponse("reset_error.html", {"request": request, "mensaje": "El enlace ha expirado."}, status_code=400)

    if nueva_contrasena != confirmar_contrasena:
        # re-render con mensaje de error
        return templates.TemplateResponse("reset_password.html", {"request": request, "token": token, "error": "Las contraseñas no coinciden."})

    usuario.contrasena_usuario = encriptar_contrasena(nueva_contrasena)
    usuario.reset_token = None
    usuario.reset_token_expira = None
    db.commit()

    return templates.TemplateResponse("reset_success.html", {"request": request, "mensaje": "Contraseña restablecida correctamente ✅"})


# ----------------- Rutas duplicadas para compatibilidad (/usuarios/reset-password/...) ---------------
# (Si ya enviaste correos apuntando a /usuarios/reset-password/<token>, mantenemos compatibilidad)
router_compat = APIRouter(prefix="/usuarios", tags=["Usuarios-Compat"])

@router_compat.get("/reset-password/{token}")
async def mostrar_formulario_reset_compat(request: Request, token: str, db: Session = Depends(get_db)):
    # Reusa la misma lógica
    return await mostrar_formulario_reset_auth(request, token, db)

@router_compat.post("/reset-password/{token}")
async def procesar_reset_password_compat(
    request: Request,
    token: str,
    nueva_contrasena: str = Form(...),
    confirmar_contrasena: str = Form(...),
    db: Session = Depends(get_db),
):
    return await procesar_reset_password_auth(request, token, nueva_contrasena, confirmar_contrasena, db)


# Nota: el archivo que importa este router debe incluir ambos:
# app.include_router(router)          # rutas /auth/...
# app.include_router(router_compat)   # rutas /usuarios/... (compatibilidad)
