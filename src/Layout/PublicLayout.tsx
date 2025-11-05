import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";
import perfilDefault from "../assets/Img/perfil.jpg";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Alert from "../components/Alert";
import FreeReadModal from "../components/FreeReadModal";
import FreeReads from "../services/freeReads";
import CookieConsentBanner from "../components/CookieConsentBanner";

export default function PublicLayout() {
  const { user, logout } = useContext(UserContext);
  const [remaining, setRemaining] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPersistent, setModalPersistent] = useState(false);
  const reopenTimerRef = ({} as { current: number | null });
  // const location = useLocation(); // Eliminar si no se usa
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    
    // Reiniciar contador a 3 al cerrar sesión
    FreeReads.resetFreeReads();
    setRemaining(3);
    setModalOpen(false);
    setModalPersistent(false);
    
    navigate("/login");
  };

  // Inicializar contador y actualizar cuando cambie el usuario
  useEffect(() => {
    if (!user) {
      // Si no hay usuario, asegurar que tenga sus 3 lecturas
      const current = FreeReads.getRemaining();
      if (current <= 0) {
        FreeReads.resetFreeReads();
      }
      setRemaining(FreeReads.getRemaining());
    }
  }, [user]);

  // Consumir una lectura cada 5 segundos para usuarios no autenticados
  useEffect(() => {
    if (!user) {
  let intervalId: number;
      const CONSUME_INTERVAL = 5000; // 5 segundos
      
      // Función para consumir una lectura
      const consumeRead = () => {
        const currentRemaining = FreeReads.getRemaining();
        console.log('Lecturas restantes:', currentRemaining);
        
        if (currentRemaining > 0) {
          const result = FreeReads.consumeFreeRead();
          console.log('Lectura consumida automáticamente, restantes:', result.remaining);
          setRemaining(result.remaining);
          
          if (result.remaining <= 0) {
            setModalOpen(true);
            setModalPersistent(true);
            // Detener el intervalo cuando se agotan las lecturas
            if (intervalId) {
              clearInterval(intervalId);
            }
          }
        } else {
          setModalOpen(true);
          setModalPersistent(true);
          // Detener el intervalo si no hay lecturas
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      };

      // Iniciar el intervalo para consumir lecturas cada 5 segundos
      intervalId = window.setInterval(consumeRead, CONSUME_INTERVAL);
      // Limpiar el intervalo cuando se desmonta o cambia el usuario
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [user]);

  // Manejar eventos de actualización del contador
  useEffect(() => {
    const handleFreeReadsUpdate = () => {
      const remaining = FreeReads.getRemaining();
      console.log('Actualización de lecturas:', remaining);
      setRemaining(remaining);
      
      // Si hay lecturas disponibles y el modal está abierto, cerrarlo
      if (remaining > 0) {
        setModalPersistent(false);
        setModalOpen(false);
      }
    };

    const handleFreeReadsDepleted = () => {
      console.log('Lecturas agotadas');
      setModalOpen(true);
      setModalPersistent(true);
    };

    // Inicializar contador al montar o cambiar usuario
    if (!user) {
      const n = FreeReads.initFreeReads();
      console.log('Inicializando contador:', n);
      setRemaining(n);
    }

    window.addEventListener('freeReadsUpdated', handleFreeReadsUpdate);
    window.addEventListener('freeReadsDepleted', handleFreeReadsDepleted);

    return () => {
      window.removeEventListener('freeReadsUpdated', handleFreeReadsUpdate);
      window.removeEventListener('freeReadsDepleted', handleFreeReadsDepleted);
    };
  }, [user]);

  useEffect(() => {
    // cuando el usuario se autentica, cerrar modal y limpiar reintentos
    if (user) {
      setModalOpen(false);
      setModalPersistent(false);
      if (reopenTimerRef.current) {
        window.clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = null as any;
      }
    }
    // si usuario sale, asegurar que contador está inicializado
    if (!user) {
      setRemaining(FreeReads.getRemaining());
    }
  }, [user]);

  // limpiar timer on unmount
  useEffect(() => {
    return () => {
      if (reopenTimerRef.current) {
        window.clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = null as any;
      }
    };
  }, []);

  const handleCloseModal = () => {
    // No permitir cerrar el modal si es persistente y el usuario no está autenticado
    if (modalPersistent && !user) {
      return;
    }
    // Si el usuario está autenticado o el modal no es persistente, permitir cerrar
    setModalOpen(false);
  };

  return (
    <div className="public-layout">
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
                {/* contador de lecturas gratuitas para usuarios no registrados */}
                <div
                  title="Artículos gratuitos restantes"
                  className="free-read-counter"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginLeft: 8,
                    padding: '6px 10px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setModalOpen(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" stroke="#21b0a6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontWeight: 600 }}>{remaining}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="navbar-bottom">
          <Link to="/deportes">Deportes</Link>
          <Link to="/arte">Arte</Link>
          <Link to="/cultura">Cultura</Link>
          <Link to="/bienestar">Bienestar</Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      <Alert />
      <FreeReadModal open={modalOpen} onClose={handleCloseModal} />
      <CookieConsentBanner />
    </div>
  );
}
