import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import "./ResetPassword.css";
import s1 from "../../assets/Img/S1.png";
import s2 from "../../assets/Img/S2.png";
import s4 from "../../assets/Img/s4.png";
import s5 from "../../assets/Img/s5.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("⚠️ Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/usuarios/reset-password/${token}`,
        {
          method: "POST",
          body: new URLSearchParams({
            nueva_contrasena: password,
            confirmar_contrasena: confirm,
          }),
        }
      );

      if (response.ok) {
        setMessage("✅ Contraseña restablecida correctamente");
        setPassword("");
        setConfirm("");
      } else {
        const data = await response.json();
        setMessage(data.detail || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setMessage("❌ Error de conexión con el servidor");
    }
  };

  return (
<div className="reset-password-page-container">
      <div className="reset-password-content">
        <div className="reset-card">
          <h2 className="reset-title">Restablecer Contraseña</h2>
          <p className="reset-subtitle">Ingresa tu nueva contraseña para continuar</p>
          <form onSubmit={handleSubmit} className="reset-form">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="reset-btn">Actualizar contraseña</button>
          </form>
          {message && <p className="reset-message">{message}</p>}
        </div>
      </div>
      <img src={s1} alt="Decoración1" className="reset-decor-top-right" />
      <img src={s2} alt="Decoración1" className="reset-decor-top-left" />
      <img src={s4} alt="Decoración1" className="reset-decor-bottom-right" />
      <img src={s5} alt="Decoración1" className="reset-decor-bottom-left" />
    </div>
  );
};

export default ResetPassword;