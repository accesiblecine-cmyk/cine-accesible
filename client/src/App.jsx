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

function Layout({ children }) {
  const tamanoTexto = useAccesibilidadStore((s) => s.tamanoTexto);
  const reducirAnimaciones = useAccesibilidadStore((s) => s.reducirAnimaciones);
  const escalaGrises = useAccesibilidadStore((s) => s.escalaGrises);
  const altoContraste = useAccesibilidadStore((s) => s.altoContraste);
  const colores = useAccesibilidadStore((s) => s.colores);

  useEffect(() => {
    document.documentElement.style.fontSize = (18 * tamanoTexto) + 'px';
  }, [tamanoTexto]);

  useEffect(() => {
    const estilo = document.getElementById('estilo-accesibilidad');
    if (estilo) estilo.remove();

    const nuevoEstilo = document.createElement('style');
    nuevoEstilo.id = 'estilo-accesibilidad';
    let css = '';

    if (reducirAnimaciones) {
      css += '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
    }

    if (escalaGrises) {
      css += 'html { filter: grayscale(100%) !important; }';
    } else if (altoContraste) {
      css += 'html { filter: contrast(200%) brightness(120%) !important; }';
    } else {
      css += 'html { filter: none; }';
    }

    nuevoEstilo.textContent = css;
    document.head.appendChild(nuevoEstilo);
  }, [reducirAnimaciones, escalaGrises, altoContraste]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        window.location.href = '/biblioteca';
      }
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        window.location.href = '/login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colores.bg, color: colores.text }}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <PanelAccesibilidad />
      <NarradorGlobal />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
