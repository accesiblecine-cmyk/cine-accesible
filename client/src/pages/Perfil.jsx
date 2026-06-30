import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';
import { obtenerTodosProyectos, eliminarProyecto, obtenerUsuario } from '../utils/api';

export default function Perfil() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const usuario = obtenerUsuario();

  const cargarProyectos = () => {
    setCargando(true);
    obtenerTodosProyectos()
      .then(data => { setProyectos(data); setCargando(false); })
      .catch(() => { setError('No se pudieron cargar los proyectos'); setCargando(false); });
  };

  useEffect(() => { cargarProyectos(); }, []);

  const handleEliminar = async (id) => {
    try {
      await eliminarProyecto(id);
      setProyectos(proyectos.filter(p => p.id !== id));
      setMensaje('Proyecto eliminado');
      setTimeout(() => setMensaje(''), 2000);
    } catch {
      setMensaje('Error al eliminar');
      setTimeout(() => setMensaje(''), 2000);
    }
  };

  const formatoFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatoTiempo = (s) => {
    if (!s) return '0:00';
    const m = Math.floor(s / 60);
    const se = Math.floor(s % 60);
    return m + ':' + (se < 10 ? '0' : '') + se;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-xl font-bold text-[#FFE156] animate-pulse">CARGANDO PROYECTOS...</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#FFE156]" style={{ textShadow: '3px 3px 0px #000000' }}>
            MIS PROYECTOS
          </h2>
          <p className="text-sm text-[#FFF8E7B3] mt-1">{usuario?.nombre?.toUpperCase()} - {usuario?.email}</p>
        </div>
        <Link to="/biblioteca">
          <BotonAccesible variante="primario">NUEVO PROYECTO</BotonAccesible>
        </Link>
      </div>

      {mensaje && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000000]" style={{ backgroundColor: mensaje.includes('Error') ? '#E0254F' : '#00D4AA', color: '#1A3A5C' }}>
          <p className="font-bold text-sm">{mensaje}</p>
        </div>
      )}

      {error ? (
        <div className="text-center py-16">
          <p className="text-xl font-bold text-[#E0254F]">{error}</p>
        </div>
      ) : proyectos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-bold text-[#FFF8E7B3]">NO TIENES PROYECTOS TODAVIA</p>
          <p className="text-sm mt-2 text-[#FFF8E7B3]">Ve a la biblioteca y empieza a crear</p>
          <div className="mt-6">
            <Link to="/biblioteca">
              <BotonAccesible variante="secundario">IR A LA BIBLIOTECA</BotonAccesible>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {proyectos.map(proy => (
            <div
              key={proy.id}
              className="p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all"
              style={{ backgroundColor: '#1A3A5C' }}
            >
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#FFE156]">{proy.video?.titulo || 'Video'}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-[#FFF8E7B3]">
                    <span>Progreso: {formatoTiempo(proy.timestampVideo)}</span>
                    <span>Creado: {formatoFecha(proy.createdAt)}</span>
                    <span className={'font-bold ' + (proy.estado === 'completado' ? 'text-[#00D4AA]' : 'text-[#FFE156]')}>
                      {proy.estado === 'completado' ? 'COMPLETADO' : 'BORRADOR'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={proy.estado === 'completado' ? '/ver/' + proy.id : '/editor/' + proy.videoId}
                    className="px-4 py-2 border-2 border-black font-bold text-xs rounded-lg shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all"
                    style={{ backgroundColor: '#4DE8FF', color: '#1A3A5C' }}
                  >
                    {proy.estado === 'completado' ? 'VER' : 'CONTINUAR'}
                  </Link>
                  <button
                    onClick={() => handleEliminar(proy.id)}
                    className="px-4 py-2 border-2 border-black font-bold text-xs rounded-lg shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all"
                    style={{ backgroundColor: '#E0254F', color: '#FFF8E7' }}
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
