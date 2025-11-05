import React from 'react';
import './P-Privacidad.css';

const PPrivacidad: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Política de Privacidad y Tratamiento de Datos</h1>
        <div className="legal-content">
          <p>
            <strong>Última actualización:</strong> 15 de Octubre de 2023
          </p>
          <p>
            Bienvenido a SN-52. Nos comprometemos a proteger su privacidad y sus datos personales. Esta política describe cómo recopilamos, usamos, almacenamos y protegemos la información que nos proporciona.
          </p>

          <h2>1. Información que Recopilamos</h2>
          <p>
            Recopilamos información para proporcionar y mejorar nuestros servicios. Esto incluye:
          </p>
          <ul>
            <li>
              <strong>Información que usted nos proporciona:</strong> Al registrarse, nos proporciona datos como su nombre, dirección de correo electrónico y contraseña. También puede proporcionarnos preferencias de contenido.
            </li>
            <li>
              <strong>Información de uso:</strong> Recopilamos información sobre cómo interactúa con nuestro sitio, como los artículos que lee, las categorías que visita y el tiempo que pasa en el sitio.
            </li>
            <li>
              <strong>Información del dispositivo:</strong> Recopilamos datos sobre el dispositivo que utiliza para acceder a nuestro servicio, como la dirección IP, el sistema operativo y el tipo de navegador.
            </li>
          </ul>

          <h2>2. Cómo Usamos su Información</h2>
          <p>
            Utilizamos la información recopilada para los siguientes propósitos:
          </p>
          <ul>
            <li>Para proporcionar y personalizar nuestros servicios, como mostrarle noticias basadas en sus intereses.</li>
            <li>Para comunicarnos con usted, incluyendo el envío de boletines informativos si ha dado su consentimiento.</li>
            <li>Para mejorar la seguridad y la integridad de nuestro sitio.</li>
            <li>Para analizar el rendimiento y mejorar la experiencia del usuario.</li>
          </ul>

          <h2>3. Cómo Compartimos su Información</h2>
          <p>
            No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información en las siguientes circunstancias:
          </p>
          <ul>
            <li>Con proveedores de servicios que nos ayudan a operar, como servicios de alojamiento y análisis.</li>
            <li>Si así lo exige la ley o en respuesta a un proceso legal válido.</li>
            <li>Para proteger nuestros derechos, propiedad o seguridad, o los de nuestros usuarios.</li>
          </ul>

          <h2>4. Seguridad de sus Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Sin embargo, ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro.
          </p>

          <h2>5. Sus Derechos</h2>
          <p>
            Usted tiene derecho a acceder, corregir o eliminar su información personal. Puede actualizar sus datos en cualquier momento desde la sección de su perfil. Si desea eliminar su cuenta, póngase en contacto con nosotros.
          </p>

          <h2>6. Cambios en esta Política</h2>
          <p>
            Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cualquier cambio publicando la nueva política en esta página. Le recomendamos que revise esta política periódicamente.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos a través de <a href="mailto:SN_52@SENA.com" className="text-primary hover:underline">SN_52@SENA.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PPrivacidad;
