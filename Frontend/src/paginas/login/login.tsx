import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import s1 from "../../assets/Img/S1.png";
import s3 from "../../assets/Img/S3.png";
import s4 from "../../assets/Img/S4.png";
import s5 from "../../assets/Img/S5.png";
import { UserContext, type Role, type User } from "../../context/UserContext";
import { useAlert } from "../../hooks/useAlert";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("correo_usuario", email);
    fd.append("contrasena_usuario", password);

    try {
      const res = await fetch("http://localhost:8000/auth/login", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          // Bloqueo de cuenta
          showAlert(err.detail || "Cuenta bloqueada temporalmente", "error");
        } else {
          showAlert(err.detail || "Error en login", "error");
        }
        return;
      }

      const data = await res.json();

      // Mapear rol_id a rol legible
      let rol: Role = "lector";
      if (data.usuario.rol_id === 2) rol = "escritor";
      if (data.usuario.rol_id === 3) rol = "editor";

      const usuarioConRol: User = {
        id: data.usuario.id.toString(),
        nombre: data.usuario.nombre,
        apellidos: data.usuario.apellidos,
        email: data.usuario.correo,
        foto: data.usuario.foto,
        rol,
      };

      // Guardamos usuario y token
      setUser(usuarioConRol);
      localStorage.setItem("user", JSON.stringify(usuarioConRol));
      localStorage.setItem("token", data.access_token);

      // Forzar mostrar el banner de cookies después del login
      localStorage.removeItem("cookie_consent_accepted");

      showAlert("Inicio de sesión exitoso", "success");
      navigate("/"); // Redirige al inicio
    } catch {
      showAlert("Error de conexión con el servidor", "error");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="login-card">
          <h1 className="login-title">Inicio de Sesión</h1>
          <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn">Acceso</button>
          </form>

          <p className="register-text">
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
          </p>
          <p className="RecuperarContra">
            <a href="/rec_contra">Recuperar Contraseña</a>
          </p>
        </div>
      </div>
      <img src={s1} alt="Decoraciones" className="login-decor-top-right" />
      <img src={s3} alt="Decoraciones" className="login-decor-top-center" />
      <img src={s5} alt="Decoraciones" className="login-decor-top-left" />
      <img src={s4} alt="Decoraciones" className="login-decor-left" />
    </div>
  );
}
