import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { obtenerUsuario, cerrarSesion, estaAutenticado } from '../../utils/api';

export default function Navbar() {
  const location = useLocation();
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleLogout = () => setMostrarConfirmacion(true);
  const confirmarLogout = () => { cerrarSesion(); window.location.href = '/'; };

  const linkClase = (path) => {
    const base = 'px-5 py-2 font-bold transition-all duration-200 border-2';
    if (location.pathname === path) {
      return base + ' text-[#FFF8E7] border-black shadow-[3px_3px_0px_#000000] bg-[#FF6B3D]';
    }
    return base + ' text-[#FFF8E7] border-transparent hover:text-[#FFE156] hover:border-black hover:shadow-[3px_3px_0px_#000000]';
  };

  return (
    <>
      <header className="px-6 py-4 border-b-3 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <Link to="/" className="text-2xl font-bold no-underline text-[#FFE156]" style={{ textShadow: '3px 3px 0px #000000' }}>
            CINE ACCESIBLE
          </Link>

          <nav className="flex gap-3 items-center flex-wrap" aria-label="Navegacion principal">
            {!autenticado ? (
              <>
                <Link to="/login" className={linkClase('/login')}>LOGIN</Link>
                <Link to="/registro" className={linkClase('/registro')}>REGISTRO</Link>
              </>
            ) : (
              <>
                <Link to="/biblioteca" className={linkClase('/biblioteca')}>BIBLIOTECA</Link>
               <Link to="/perfil" className="text-[#4DE8FF] font-bold text-xs border-2 border-[#4DE8FF] px-3 py-1 shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all hidden sm:inline no-underline">
  {usuario?.nombre?.toUpperCase() || 'USUARIO'}
</Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 font-bold text-[#FFE156] border-2 border-black bg-[#E0254F] shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                  aria-label="Cerrar sesion"
                >
                  SALIR
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-60" onClick={() => setMostrarConfirmacion(false)}></div>
          <div className="relative z-50 p-8 rounded-lg border-2 border-black shadow-[8px_8px_0px_#000000] text-center max-w-sm mx-4" style={{ backgroundColor: '#1A3A5C' }}>
            <p className="text-[#FFE156] font-bold text-lg mb-6">ESTAS SEGURO DE QUE QUIERES CERRAR SESION?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmarLogout} className="px-6 py-3 rounded-lg border-2 border-black bg-[#E0254F] text-[#FFF8E7] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">SI, SALIR</button>
              <button onClick={() => setMostrarConfirmacion(false)} className="px-6 py-3 rounded-lg border-2 border-black bg-[#00D4AA] text-[#1A3A5C] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
