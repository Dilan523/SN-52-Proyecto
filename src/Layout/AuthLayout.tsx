import { Outlet, Link, useNavigate } from "react-router-dom";
import "./Layout.css";
import perfilDefault from "../assets/Img/perfil.jpg";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Alert from "../components/Alert";

export default function AuthLayout() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="auth-layout">
      <header>
        <div className="navbar-top">
          <div className="navbar-logo">
            <Link to="/perfil">
              <img
                src={user?.foto ? `http://localhost:8000/uploads/${user.foto}` : perfilDefault}
                alt="Perfil"
                className="navbar-perfil"
              />
            </Link>
            <Link to="/">
              <span>SN-52</span>
            </Link>
          </div>
          <div className="navbar-actions">
            {user ? (
              <button onClick={handleLogout} className="btn">
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      <Alert />
    </div>
  );
}
