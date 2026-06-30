import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import RutaProtegida from './components/ui/RutaProtegida';
import PanelAccesibilidad from './components/ui/PanelAccesibilidad';
import NarradorGlobal from './components/ui/NarradorGlobal';
import useAccesibilidadStore from './store/useAccesibilidadStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Biblioteca from './pages/Biblioteca';
import Editor from './pages/Editor';
import Cierre from './pages/Cierre';
import Perfil from './pages/Perfil';
import Visualizador from './pages/Visualizador';

function Layout({ children }) {
  const tamanoTexto = useAccesibilidadStore((s) => s.tamanoTexto);
  const reducirAnimaciones = useAccesibilidadStore((s) => s.reducirAnimaciones);
  const escalaGrises = useAccesibilidadStore((s) => s.escalaGrises);
  const altoContraste = useAccesibilidadStore((s) => s.altoContraste);
  const modoActivo = useAccesibilidadStore((s) => s.modoActivo);

  useEffect(() => {
    document.documentElement.style.fontSize = (18 * tamanoTexto) + 'px';
  }, [tamanoTexto]);

  useEffect(() => {
    const estiloId = 'estilo-accesibilidad';
    let estilo = document.getElementById(estiloId);
    if (estilo) estilo.remove();

    estilo = document.createElement('style');
    estilo.id = estiloId;
    let css = '';

    if (reducirAnimaciones) {
      css += '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; animation-iteration-count: 1 !important; }';
    }

    if (escalaGrises) {
      css += 'html { filter: grayscale(100%) !important; }';
    } else if (altoContraste) {
      css += 'html { filter: contrast(200%) brightness(130%) !important; }';
      css += 'body { background-color: #000000 !important; color: #FFFFFF !important; }';
    } else {
      css += 'html { filter: none; } body { background-color: auto; color: auto; }';
    }

    estilo.textContent = css;
    document.head.appendChild(estilo);

    return () => {
      if (estilo && document.getElementById(estiloId)) {
        estilo.remove();
      }
    };
  }, [reducirAnimaciones, escalaGrises, altoContraste]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        window.location.href = '/biblioteca';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isVisualMode = modoActivo === 'visual';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2B1B3D', color: '#FFF8E7' }}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <PanelAccesibilidad />
      {isVisualMode && <NarradorGlobal />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Layout><Landing /></Layout>} />
  <Route path="/login" element={<Layout><Login /></Layout>} />
  <Route path="/registro" element={<Layout><Registro /></Layout>} />
  <Route path="/biblioteca" element={<Layout><RutaProtegida><Biblioteca /></RutaProtegida></Layout>} />
  <Route path="/editor/:id" element={<Layout><RutaProtegida><Editor /></RutaProtegida></Layout>} />
  <Route path="/editor/:id/cierre" element={<Layout><RutaProtegida><Cierre /></RutaProtegida></Layout>} />
  <Route path="/perfil" element={<Layout><RutaProtegida><Perfil /></RutaProtegida></Layout>} />
<Route path="/ver/:id" element={<Layout><Visualizador /></Layout>} />
</Routes>
    </BrowserRouter>
  );
}

export default App;
