from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME="tucorreo@gmail.com",
    MAIL_PASSWORD="ayvzkdsorvcmqjux",
    MAIL_FROM="tucorreo@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="SN-52",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fm = FastMail(conf)

async def enviar_email(email_destino: EmailStr, asunto: str, cuerpo: str):
    message = MessageSchema(
        subject=asunto,
        recipients=[email_destino],
        body=cuerpo,
        subtype="html"
    )
    await fm.send_message(message)
