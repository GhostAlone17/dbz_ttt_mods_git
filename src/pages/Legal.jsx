import { useEffect } from 'react';
import './LegalStyles.css';

const Legal = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="container legal-page">
            <h1>Aviso Legal y Disclaimer</h1>
            
            <p className="last-updated">
                Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <div className="legal-banner">
                <h2>PROYECTO FAN-MADE</h2>
                <p>Este es un sitio web NO OFICIAL creado por fans para fans.</p>
                <p>
                    No estamos afiliados ni respaldados por Bandai Namco, Akira Toriyama, 
                    Toei Animation, Shueisha, ni ninguna entidad oficial relacionada con Dragon Ball.
                </p>
            </div>

            <section>
                <h2>1. Naturaleza del Contenido</h2>
                <p>
                    Este sitio web es un proyecto de la comunidad dedicado a compartir modificaciones 
                    (mods) creadas por fans para videojuegos de Dragon Ball, específicamente:
                </p>
                <ul>
                    <li><strong>Dragon Ball Z: Tenkaichi Tag Team (TTT)</strong></li>
                    <li><strong>Dragon Ball Z: Budokai Tenkaichi 3 (BT3)</strong></li>
                </ul>
                <p>
                    Todo el contenido compartido aquí son modificaciones no oficiales creadas por 
                    la comunidad de fans.
                </p>
            </section>

            <section>
                <h2>2. Derechos de Autor y Marcas Registradas</h2>
                <p>
                    <strong>Dragon Ball</strong> es propiedad de:
                </p>
                <ul>
                    <li>© Akira Toriyama (creador original)</li>
                    <li>© Shueisha Inc. (editorial del manga)</li>
                    <li>© Toei Animation (producción del anime)</li>
                    <li>© Bandai Namco Entertainment (videojuegos)</li>
                </ul>
                <p>
                    Todas las marcas comerciales, logos y derechos de autor pertenecen a sus respectivos propietarios. 
                    Este sitio no reclama ninguna propiedad sobre estos materiales.
                </p>
            </section>

            <section>
                <h2>
                    3. Uso Justo (Fair Use)
                </h2>
                <p>
                    El contenido de este sitio se comparte bajo el concepto de <strong>uso justo</strong> 
                    para propósitos de:
                </p>
                <ul>
                    <li>Transformación creativa de contenido existente</li>
                    <li>Comentario y crítica</li>
                    <li>Uso educativo y de archivo</li>
                    <li>Promoción de la comunidad de fans</li>
                </ul>
                <p>
                    Este sitio <strong>NO distribuye</strong> los juegos originales ni contenido pirata. 
                    Solo compartimos modificaciones que requieren que los usuarios posean una copia 
                    legal del juego original.
                </p>
            </section>

            <section>
                <h2>
                    4. Disclaimer de Responsabilidad
                </h2>
                <p>
                    <strong>IMPORTANTE:</strong>
                </p>
                <ul>
                    <li>Los mods se proporcionan "tal cual" sin garantías de ningún tipo</li>
                    <li>No somos responsables por daños a tu dispositivo o pérdida de datos</li>
                    <li>Instalar mods puede anular la garantía de tu juego</li>
                    <li>Es responsabilidad del usuario hacer copias de seguridad antes de instalar mods</li>
                    <li>No garantizamos la compatibilidad ni la estabilidad de los mods</li>
                </ul>
            </section>

            <section>
                <h2>
                    5. Créditos y Atribuciones
                </h2>
                <p>
                    Todos los mods compartidos en este sitio han sido creados por miembros de la 
                    comunidad. Hacemos nuestro mejor esfuerzo para acreditar a los creadores originales.
                </p>
                <p>
                    Si encuentras contenido que te pertenece y deseas que sea eliminado o correctamente 
                    acreditado, por favor contáctanos.
                </p>
            </section>

            <section>
                <h2>
                    6. Monetización del Sitio
                </h2>
                <p>
                    Este sitio puede mostrar anuncios a través de Google AdSense. Los ingresos generados 
                    se utilizan exclusivamente para:
                </p>
                <ul>
                    <li>Mantenimiento del servidor y hosting</li>
                    <li>Costos de dominio</li>
                    <li>Mejoras técnicas del sitio</li>
                </ul>
                <p>
                    <strong>Este no es un sitio con fines de lucro.</strong> No vendemos mods ni cobramos 
                    por el acceso al contenido.
                </p>
            </section>

            <section>
                <h2>
                    7. Enlaces Externos
                </h2>
                <p>
                    Este sitio contiene enlaces a servicios externos como:
                </p>
                <ul>
                    <li>YouTube (videos tutoriales)</li>
                    <li>MediaFire (descargas de mods)</li>
                    <li>Otros servicios de almacenamiento</li>
                </ul>
                <p>
                    No somos responsables del contenido, políticas de privacidad o prácticas de 
                    estos sitios externos.
                </p>
            </section>

            <section>
                <h2>
                    8. Solicitudes de Eliminación (DMCA)
                </h2>
                <p>
                    Respetamos la propiedad intelectual. Si crees que tu contenido protegido por 
                    derechos de autor ha sido utilizado de manera inapropiada, contáctanos a través 
                    de nuestro{' '}
                    <a 
                        href="https://www.youtube.com/@GHOSTALONE17" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        
                    >
                        canal de YouTube
                    </a>
                    {' '}con la siguiente información:
                </p>
                <ul>
                    <li>Identificación del contenido protegido</li>
                    <li>URL específica del contenido en nuestro sitio</li>
                    <li>Información de contacto</li>
                    <li>Prueba de propiedad o autorización</li>
                </ul>
            </section>

            <section>
                <h2>
                    9. Modificaciones a este Aviso
                </h2>
                <p>
                    Nos reservamos el derecho de modificar este aviso legal en cualquier momento. 
                    Los cambios serán efectivos inmediatamente después de su publicación en esta página.
                </p>
            </section>

            <section>
                <h2>
                    10. Aceptación de Términos
                </h2>
                <p>
                    Al usar este sitio web, aceptas los términos establecidos en este aviso legal. 
                    Si no estás de acuerdo con estos términos, por favor no uses este sitio.
                </p>
            </section>

            <div className="legal-note" style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '10px' }}>
                    Hecho con pasión por la comunidad de Dragon Ball
                </p>
                <p>
                    Este proyecto existe gracias al apoyo y creatividad de los fans alrededor del mundo.
                </p>
            </div>
        </div>
    );
};

export default Legal;


