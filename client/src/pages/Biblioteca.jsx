import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';
import { obtenerVideos } from '../utils/api';

const coloresPorCategoria = {
  Naturaleza: '#2D5A27',
  Urbano: '#5B2C6F',
  Abstracto: '#B03A2E',
};

export default function Biblioteca() {
  const [videos, setVideos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerVideos()
      .then(data => { setVideos(data); setCargando(false); })
      .catch(err => { setError('No se pudieron cargar los videos'); setCargando(false); });
  }, []);

  const categorias = ['TODOS', ...new Set(videos.map(v => v.categoria))];

  const videosFiltrados = videos.filter(v => {
    const coincideBusqueda = v.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'TODOS' || v.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-xl font-bold text-[#FFE156] animate-pulse">CARGANDO VIDEOS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-xl font-bold text-[#E0254F]">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-[#FFE156]" style={{ textShadow: '3px 3px 0px #000000' }}>
        ELIGE UNA PELICULA
      </h2>
      <p className="text-sm mb-8 text-[#FFF8E7B3]">
        Selecciona un video para empezar a crear tu experiencia audiovisual
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="BUSCAR VIDEO..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 border-2 border-black rounded-lg px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_#000000] focus:outline focus:outline-2 focus:outline-[#FFE156]"
          style={{ backgroundColor: '#1A3A5C', color: '#FFF8E7' }}
          aria-label="Buscar video"
        />
        <div className="flex gap-2 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={'px-4 py-2 border-2 border-black font-bold text-xs rounded-lg shadow-[2px_2px_0px_#000000] transition-all hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] ' + (categoriaFiltro === cat ? 'bg-[#FFE156] text-[#1A3A5C]' : 'bg-[#2B1B3D] text-[#FFF8E7]')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {videosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl font-bold text-[#FFF8E7B3]">NO SE ENCONTRARON VIDEOS</p>
          <p className="text-sm mt-2 text-[#FFF8E7B3]">Intenta con otra busqueda o filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {videosFiltrados.map((video) => {
            const colorFondo = coloresPorCategoria[video.categoria] || '#1A3A5C';
            const ariaLabel = video.titulo + ', duracion ' + Math.floor(video.duracion / 60) + ':' + (video.duracion % 60).toString().padStart(2, '0') + ', categoria ' + video.categoria;
            const duracionFormato = Math.floor(video.duracion / 60) + ':' + (video.duracion % 60).toString().padStart(2, '0');
            return (
              <Link
                key={video.id}
                to={'/editor/' + video.id}
                className="rounded-lg overflow-hidden border-2 border-black transition-all duration-200 shadow-[6px_6px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] focus:outline focus:outline-3 focus:outline-[#FFE156] group"
                style={{ backgroundColor: '#1A3A5C' }}
                aria-label={ariaLabel}
              >
                <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: colorFondo }}>
                  <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }}></div>
                  <span className="text-5xl font-black opacity-40 group-hover:opacity-60 transition-opacity text-white">
                    {video.titulo.charAt(0)}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:underline text-[#FFE156]">{video.titulo}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-[#FFF8E7]">{duracionFormato}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded border border-black bg-[#2B1B3D] text-[#4DE8FF]">
                      {video.categoria}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <BotonAccesible variante="secundario">SUBIR VIDEO PROPIO</BotonAccesible>
      </div>
    </div>
  );
}
