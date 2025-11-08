import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import './CookieConsentBanner.css';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Esta comprobación asegura que el código solo se ejecute en el cliente
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  // Escuchar cambios en localStorage para mostrar el banner cuando el usuario se registra o inicia sesión
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        // Si hay un nuevo usuario o token, mostrar el banner de cookies
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consent !== 'true') {
          setShowBanner(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // También verificar cuando el componente se monta
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <Cookie className="cookie-icon" />
        <div className="cookie-text">
          <h4 className="cookie-title">Nuestras cookies.Tu eleccion</h4>
          <p>
            Usamos cookies para mejorar tu experiencia de navegación y analizar nuestro tráfico. Al hacer clic en "Aceptar", aceptas nuestro uso de cookies.
          </p>
          <p>
            Consultar nuetras <Link to="/privacidad" className="link-text">Política de Privacidad</Link> y <Link to="/terminos" className="link-text">Términos y Condiciones</Link> para 
            tipos de datos personales que recopilamos, incluidos datos sobre tu navegador.Puedes cambiar tus preferencias de cookies en cualquier momento.
          </p>
        </div>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="accept-button">Aceptar</button>
        </div>
      </div>
    </div>
  );
}
