import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            marginTop: '60px',
            padding: '40px 20px 20px',
            color: 'var(--text-main)'
        }}>
            <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
                {/* Fan-Made Banner */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    padding: '15px 20px',
                    background: 'rgba(230, 25, 25, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(230, 25, 25, 0.3)'
                }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '0.95rem',
                        color: 'var(--accent)',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>
                        PROYECTO FAN-MADE NO OFICIAL
                    </p>
                    <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                    }}>
                        No afiliado con Bandai Namco, Akira Toriyama, ni ninguna entidad oficial de Dragon Ball
                    </p>
                </div>

                {/* Main Footer Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px',
                    marginBottom: '30px'
                }}>
                    {/* About Section */}
                    <div>
                        <h3 style={{ 
                            fontSize: '1.2rem', 
                            marginBottom: '15px',
                            color: 'var(--accent)',
                            fontWeight: '800',
                            letterSpacing: '1px'
                        }}>
                            GHOSTALONE17
                        </h3>
                        <p style={{ 
                            fontSize: '0.9rem', 
                            lineHeight: '1.6',
                            color: 'var(--text-muted)'
                        }}>
                            Comunidad dedicada a compartir mods de Dragon Ball creados por fans. 
                            Preservando y celebrando la creatividad de la comunidad.
                        </p>
                        <a
                            href="https://www.youtube.com/@GHOSTALONE17"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '15px',
                                padding: '8px 16px',
                                background: 'var(--accent)',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--accent-hover)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'var(--accent)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <Youtube size={18} />
                            Visita nuestro canal
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ 
                            fontSize: '1.2rem', 
                            marginBottom: '15px',
                            color: 'var(--accent)',
                            fontWeight: '800'
                        }}>
                            Enlaces Rápidos
                        </h3>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '10px' }}>
                                <Link 
                                    to="/"
                                    style={{ 
                                        color: 'var(--text-muted)', 
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                >
                                    Explorar Mods
                                </Link>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <Link 
                                    to="/acerca-de"
                                    style={{ 
                                        color: 'var(--text-muted)', 
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                >
                                    Acerca de
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 style={{ 
                            fontSize: '1.2rem', 
                            marginBottom: '15px',
                            color: 'var(--accent)',
                            fontWeight: '800'
                        }}>
                            Legal
                        </h3>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: 0,
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '10px' }}>
                                <Link 
                                    to="/privacidad"
                                    style={{ 
                                        color: 'var(--text-muted)', 
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                >
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <Link 
                                    to="/aviso-legal"
                                    style={{ 
                                        color: 'var(--text-muted)', 
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                >
                                    Aviso Legal
                                </Link>
                            </li>
                        </ul>
                        <p style={{ 
                            marginTop: '15px', 
                            fontSize: '0.8rem',
                            color: '#555',
                            lineHeight: '1.5',
                            fontWeight: '500'
                        }}>
                            Dragon Ball © Akira Toriyama<br/>
                            © Bandai Namco Entertainment<br/>
                            © Toei Animation
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <p style={{ 
                        margin: '0 0 10px 0',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        fontWeight: '600'
                    }}>
                        Hecho con pasión por la comunidad de Dragon Ball
                    </p>
                    <p style={{ 
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#555',
                        fontWeight: '500'
                    }}>
                        © {currentYear} GHOSTALONE17 | Todos los derechos de Dragon Ball pertenecen a sus respectivos dueños
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
