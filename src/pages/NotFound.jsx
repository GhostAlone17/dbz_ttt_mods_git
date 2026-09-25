import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="container animate-in" style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <span style={{
                fontSize: 'clamp(6rem, 20vw, 10rem)',
                fontWeight: '900',
                color: '#1a1a1a',
                lineHeight: 1,
                userSelect: 'none'
            }}>
                404
            </span>
            <div style={{ position: 'relative', marginTop: '-20px' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem' }}>
                    Página no encontrada
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    Parece que te has perdido en el espacio-tiempo. Esta URL no conduce a ninguna parte.
                </p>

                <Link to="/" className="btn-base btn-download" style={{ display: 'inline-flex', width: 'auto', padding: '0.8rem 2rem' }}>
                    <Home size={20} /> Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
