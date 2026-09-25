import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { setGithubToken } from '../lib/api';

const Login = () => {
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const MASTER_KEY = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

        if (password === MASTER_KEY) {
            if (token.trim()) setGithubToken(token);
            localStorage.setItem('admin_auth', 'true');
            window.dispatchEvent(new Event('storage'));
            navigate('/panel-privado-gestion');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="container animate-in" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="login-card" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem',
                textAlign: 'center',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(230, 25, 25, 0.1)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <Lock size={28} color="var(--accent)" />
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem' }}>Zona Restringida</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                    Introduce la clave maestra para gestionar los contenidos.
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Master Key..."
                        className="search-input"
                        style={{ textAlign: 'center', paddingLeft: '1rem' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Token de GitHub (opcional)"
                        className="search-input"
                        style={{ textAlign: 'center', paddingLeft: '1rem' }}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.5', marginTop: '-0.5rem' }}>
                        Solo si vas a publicar: usa un <b>fine-grained PAT</b> con permiso
                        <b> Contents: Read and write</b> en el repo. Se guarda en esta pestaña.
                    </p>
                    <button type="submit" className="btn-base btn-download" style={{ padding: '1rem' }}>
                        Desbloquear Panel
                    </button>
                </form>

                {error && (
                    <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '700', marginTop: '1.5rem' }}>
                        Acceso Denegado.
                    </p>
                )}
            </div>

            <style>{`
                .login-card {
                    background: var(--bg-card);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: border-color 0.3s;
                }
                .login-card:hover {
                    border-color: #333;
                }
            `}</style>
        </div>
    );
};

export default Login;
