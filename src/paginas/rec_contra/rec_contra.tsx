import { useState } from "react";
import s1 from "../../assets/Img/S1.png";
import s2 from "../../assets/Img/S2.png";
import s5 from "../../assets/Img/s5.png";
import "./rec_contra.css";
import { useAlert } from "../../hooks/useAlert";

export default function RecuperarContraseña() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/recuperar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mostramos el token directamente
        showAlert(`Token generado: ${data.token}`, "success");
      } else {
        showAlert(data.detail || "Ocurrió un error, intenta nuevamente", "error");
      }
    } catch {
      showAlert("No se pudo conectar con el servidor", "error");
    }
  };

  return (
    <div className="page">
      <h1 className="title">Recuperar Contraseña</h1>
      <div className="form-container">
        <img src={s1} alt="Adorno" className="adorno adorno-top-left" />
        <img src={s2} alt="Adorno" className="adorno adorno-top-right" />
        <img src={s5} alt="Adorno" className="adorno adorno-bottom-left" />
        <img src={s5} alt="Adorno" className="adorno adorno-bottom-right" />

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="log" type="submit"><span>Enviar</span></button>
        </form>

        {mensaje && <p className="success-msg">{mensaje}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
