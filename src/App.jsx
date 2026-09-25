import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/acerca-de" element={<About />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/aviso-legal" element={<Legal />} />

            {/* Rutas Administrativas Ocultas */}
            <Route path="/dbz-control-master" element={<Login />} />
            <Route path="/panel-privado-gestion" element={<Admin />} />

            {/* Redirecciones de seguridad */}
            <Route path="/admin" element={<Home />} />
            <Route path="/login" element={<Home />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
