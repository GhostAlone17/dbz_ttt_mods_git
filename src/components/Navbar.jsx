import { Link, useLocation } from 'react-router-dom';
import { Youtube, Menu, X, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem('admin_auth');
            setIsAdmin(auth === 'true');
        };
        
        checkAuth();
        window.addEventListener('storage', checkAuth);
        
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Solo aplicar en móvil
            if (window.innerWidth > 768) return;
            
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < 50) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY) {
                setIsVisible(false);
                setIsOpen(false);
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav className={`nav container ${!isVisible ? 'nav-hidden' : ''}`}>
            {/* Lado Izquierdo: Logo */}
            <Link 
                to="/" 
                className={`nav-logo ${isOpen ? 'hidden-mobile' : ''}`} 
                onClick={() => setIsOpen(false)}
            >
                GHOST<span>ALONE17</span>
            </Link>

            {/* Botón Hamburguesa */}
            <button
                className="mobile-btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    zIndex: 999,
                    padding: '8px'
                }}
            >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Menú de Navegación */}
            <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
                <div className="nav-links-inner">
                    <Link
                        to="/"
                        className={`nav-link-mobile ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        Explorar
                    </Link>
                    <Link
                        to="/acerca-de"
                        className={`nav-link-mobile ${location.pathname === '/acerca-de' ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        Acerca de
                    </Link>

                    {isAdmin && (
                        <Link
                            to="/panel-privado-gestion"
                            className={`nav-link-mobile ${location.pathname === '/panel-privado-gestion' ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Shield size={18} /> Panel Admin
                        </Link>
                    )}

                    <div className="nav-separator"></div>

                    <a
                        href="https://youtube.com/@ghostalone17"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-yt-nav"
                        onClick={() => setIsOpen(false)}
                    >
                        <Youtube size={18} color="#e61919" />
                        <span>@GhostAlone17</span>
                    </a>
                </div>
            </div>

            <style>{`
        .nav-link-mobile {
          color: #888;
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: 700;
          transition: 0.2s;
        }
        .nav-link-mobile.active { color: var(--accent); }

        .btn-yt-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.7rem 1.2rem;
          background: #151515;
          border: 1px solid #333;
          border-radius: 10px;
          text-decoration: none !important;
          color: #fff !important;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .btn-yt-nav span { text-decoration: none !important; }

        @media (max-width: 768px) {
          .mobile-btn { 
            display: block !important;
            position: fixed;
            right: 1rem;
            top: 1.3rem;
          }
          .nav-logo { 
            z-index: 999;
            position: relative;
            transition: opacity 0.3s, transform 0.3s;
          }
          .nav-logo.hidden-mobile {
            opacity: 0;
            transform: translateX(-20px);
            pointer-events: none;
          }
          .nav-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 280px;
            height: 100vh;
            background: var(--bg-card);
            border-left: 1px solid var(--border);
            z-index: 998;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            padding-top: 5rem;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          }
          .nav-menu.open { right: 0; }
          .nav-links-inner {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            width: 100%;
            padding: 0 1.5rem;
          }
          .nav-link-mobile {
            font-size: 1rem;
            padding: 0.8rem 0;
            width: 100%;
            border-bottom: 1px solid var(--border);
          }
          .nav-link-mobile:hover { color: var(--accent); }
          .nav-separator { display: none; }
          .btn-yt-nav {
            width: 100%;
            justify-content: center;
            margin-top: 1rem;
          }
        }

        @media (min-width: 769px) {
          .nav-menu { display: flex; align-items: center; }
          .nav-links-inner { display: flex; gap: 2.5rem; align-items: center; }
          .nav-link-mobile { font-size: 0.9rem; font-weight: 600; }
          .nav-separator { width: 1px; height: 20px; background: var(--border); }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
