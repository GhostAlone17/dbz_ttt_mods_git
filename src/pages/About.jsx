import { useEffect } from 'react';
import { Youtube, Zap } from 'lucide-react';
import logoImg from '../assets/Logo_GhostAlone17.jpg';
import './About.css';

const About = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="about-page">
            <div className="about-container">
                <header className="about-header">
                    <img
                        src={logoImg}
                        alt="GhostAlone17 Logo"
                        className="about-logo"
                    />
                    <h2>GhostAlone17</h2>
                    <p>Modder de Dragon Ball Budokai Tenkaichi</p>
                </header>

                <section className="about-main-card">
                    <h3 className="about-section-title">
                        <Zap color="var(--accent)" /> Mi Misión
                    </h3>
                    <p className="about-text">
                        Bienvenido a mi archivo personal de mods. Como apasionado de la saga Tenkaichi, mi objetivo es expandir y mejorar
                        la experiencia de <strong>Dragon Ball Z: Tenkaichi Tag Team</strong> y <strong>Budokai Tenkaichi 3</strong>.
                    </p>
                    <p className="about-text" style={{ marginBottom: '3rem' }}>
                        En este blog encontrarás mis trabajos más recientes, desde ports de personajes hasta mejoras técnicas de texturas
                        y mecánicas, todo disponible para descarga directa y sin publicidad.
                    </p>

                    <div className="about-info-grid">
                        <div className="about-info-card">
                            <h4>Soporte & Sugerencias</h4>
                            <p>
                                Si tienes dudas sobre la instalación de algún mod, puedes contactarme en mi canal.
                            </p>
                        </div>
                        <div className="about-info-card">
                            <h4>Actualizaciones</h4>
                            <p>
                                Subo contenido regularmente. ¡No olvides suscribirte al canal para no perderte nada!
                            </p>
                        </div>
                    </div>

                    <div className="about-cta">
                        <a
                            href="https://youtube.com/@ghostalone17?si=KsPvFE8zOzMz5tar"
                            target="_blank"
                            rel="noreferrer"
                            className="about-youtube-btn"
                        >
                            <Youtube size={20} /> Visitar mi Canal de YouTube
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
