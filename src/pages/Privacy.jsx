import { useEffect } from 'react';
import './LegalStyles.css';

const Privacy = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="container legal-page">
            <h1>Política de Privacidad</h1>
            
            <p className="last-updated">
                Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section>
                <h2>1. Información General</h2>
                <p>
                    GHOSTALONE17 es un sitio web fan-made dedicado a compartir modificaciones (mods) 
                    para videojuegos de Dragon Ball. Este sitio es no oficial y no está afiliado 
                    con Bandai Namco, Akira Toriyama, ni ninguna entidad oficial de Dragon Ball.
                </p>
            </section>

            <section>
                <h2>2. Uso de Google AdSense</h2>
                <p>
                    Este sitio utiliza Google AdSense para mostrar anuncios publicitarios. Google 
                    utiliza cookies y tecnologías similares para:
                </p>
                <ul>
                    <li>Mostrar anuncios personalizados basados en tus intereses</li>
                    <li>Medir el rendimiento de los anuncios</li>
                    <li>Evitar mostrarte el mismo anuncio repetidamente</li>
                </ul>
                <p>
                    Puedes controlar la personalización de anuncios visitando{' '}
                    <a 
                        href="https://www.google.com/settings/ads" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Configuración de Anuncios de Google
                    </a>.
                </p>
            </section>

            <section>
                <h2>3. Cookies</h2>
                <p>
                    Este sitio utiliza cookies propias y de terceros para:
                </p>
                <ul>
                    <li><strong>Cookies necesarias:</strong> Para el funcionamiento básico del sitio</li>
                    <li><strong>Cookies de Google AdSense:</strong> Para mostrar anuncios relevantes</li>
                    <li><strong>Cookies de análisis:</strong> Para entender cómo los usuarios utilizan el sitio</li>
                </ul>
                <p>
                    Al continuar navegando en este sitio, aceptas el uso de cookies de acuerdo con esta política.
                </p>
            </section>

            <section>
                <h2>4. Recopilación de Datos</h2>
                <p>
                    Este sitio NO recopila información personal identificable directamente. Sin embargo, 
                    Google AdSense y otros servicios de terceros pueden recopilar:
                </p>
                <ul>
                    <li>Dirección IP</li>
                    <li>Tipo de navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de permanencia</li>
                    <li>Datos de ubicación aproximada</li>
                </ul>
            </section>

            <section>
                <h2>5. Enlaces Externos</h2>
                <p>
                    Este sitio contiene enlaces a YouTube, MediaFire y otros servicios externos. 
                    No somos responsables de las prácticas de privacidad de estos sitios externos. 
                    Te recomendamos leer sus políticas de privacidad.
                </p>
            </section>

            <section>
                <h2>6. Menores de Edad</h2>
                <p>
                    Este sitio no está dirigido a menores de 13 años. No recopilamos intencionalmente 
                    información personal de menores de edad.
                </p>
            </section>

            <section>
                <h2>7. Cambios en la Política</h2>
                <p>
                    Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
                    Los cambios entrarán en vigor inmediatamente después de su publicación en esta página.
                </p>
            </section>

            <section>
                <h2>8. Contacto</h2>
                <p>
                    Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de 
                    nuestro{' '}
                    <a 
                        href="https://www.youtube.com/@GHOSTALONE17" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        canal de YouTube
                    </a>.
                </p>
            </section>

            <div className="legal-note">
                <p>
                    <strong>Nota:</strong> Este sitio es un proyecto fan-made sin fines de lucro. 
                    Los ingresos generados por publicidad se utilizan únicamente para mantener 
                    el servidor y continuar compartiendo contenido con la comunidad.
                </p>
            </div>
        </div>
    );
};

export default Privacy;
