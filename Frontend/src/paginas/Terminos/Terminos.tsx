import React from 'react';
import './Terminos.css';

const Terminos: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Términos y Condiciones de Uso</h1>
        <div className="legal-content">
          <p>
            <strong>Última actualización:</strong> 15 de Octubre de 2023
          </p>
          <p>
            Bienvenido a SN-52 (en adelante, "el Sitio"). Al acceder y utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
          </p>

          <h2>1. Aceptación de los Términos</h2>
          <p>
            Este acuerdo establece los términos legalmente vinculantes para su uso del Sitio. Al usar el Sitio, usted acepta estar sujeto a este Acuerdo, ya sea que sea un "Visitante" (lo que significa que simplemente navega por el Sitio) o un "Miembro" (lo que significa que se ha registrado en el Sitio).
          </p>

          <h2>2. Uso del Contenido</h2>
          <p>
            Todo el contenido proporcionado en este sitio es solo para fines informativos. El propietario de este sitio no se hace responsable de la exactitud o integridad de cualquier información en este sitio o que se encuentre siguiendo cualquier enlace en este sitio.
          </p>
          <p>
            El contenido no puede ser reproducido, duplicado, copiado, vendido, revendido o explotado para ningún propósito comercial sin el consentimiento expreso por escrito de los propietarios del Sitio.
          </p>

          <h2>3. Cuentas de Usuario</h2>
          <p>
            Si crea una cuenta en el Sitio, usted es responsable de mantener la seguridad de su cuenta y es totalmente responsable de todas las actividades que ocurran bajo la cuenta. Debe notificarnos de inmediato sobre cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.
          </p>

          <h2>4. Conducta del Usuario</h2>
          <p>
            Usted acepta no utilizar el Sitio para:
          </p>
          <ul>
            <li>Publicar o transmitir cualquier material que sea ilegal, amenazante, abusivo, difamatorio, obsceno, vulgar, pornográfico, profano o indecente.</li>
            <li>Violar los derechos de propiedad intelectual de otros.</li>
            <li>Subir archivos que contengan virus, archivos corruptos o cualquier otro software similar que pueda dañar el funcionamiento de la computadora de otra persona.</li>
          </ul>

          <h2>5. Limitación de Responsabilidad</h2>
          <p>
            En ninguna circunstancia el Sitio o sus propietarios serán responsables de ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar el sitio.
          </p>

          <h2>6. Modificaciones a los Términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. La continuación del uso del Sitio después de cualquier cambio constituirá su consentimiento a dichos cambios.
          </p>

          <h2>7. Ley Aplicable</h2>
          <p>
            Estos términos se regirán e interpretarán de acuerdo con las leyes de Colombia, sin dar efecto a ningún principio de conflicto de leyes.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Terminos;
