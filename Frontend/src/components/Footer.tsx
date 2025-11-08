import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
// Importación de imágenes decorativas para el footer
import s4 from "../assets/Img/s4.png";
import s3 from "../assets/Img/S3.png";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Decoración izquierda del footer */}
        <div className="footer-lateral-izquierda">
          <img src={s4} alt="decor-left" />
        </div>
        {/* Contenido principal del footer */}
        <div className="footer-content">
          <h2 className="footer-title">SN-52</h2>
          <div className="footer-social-and-contact">
            {/* Enlaces a redes sociales */}
            <div className="footer-social">
              {[
                { name: 'facebook', url: "https://cdn-icons-png.flaticon.com/512/124/124010.png" },
                { name: 'instagram', url: "https://cdn-icons-png.flaticon.com/512/174/174855.png" },
                { name: 'x', url: "https://cdn-icons-png.flaticon.com/512/124/124021.png" },
                { name: 'youtube', url: "https://cdn-icons-png.flaticon.com/512/174/174883.png" }
              ].map((social) => (
                <a key={social.name} href="#" target="_blank" rel="noopener noreferrer">
                  <img src={social.url} alt={social.name} />
                </a>
              ))}
            </div>
            {/* Información de contacto */}
            <div className="footer-contact">
              <a href="mailto:SN_52@SENA.com">SN_52@SENA.com</a>
              <span className="footer-sep">·</span>
              <a href="tel:1234567890">123-456-7890</a>
            </div>
            {/* Sección de Información */}
            <div className="footer-info">
              <h3>Información</h3>
              <Link to="/terminos">Términos y Condiciones</Link>
              <br />
              <Link to="/privacidad">Política de Privacidad</Link>
            </div>
          </div>
        </div>
        {/* Decoración derecha del footer */}
        <div className="footer-lateral-derecha">
          <img src={s3} alt="decor-right" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;