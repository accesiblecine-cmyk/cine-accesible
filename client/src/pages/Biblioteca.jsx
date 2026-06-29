import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';
import useAccesibilidadStore from '../store/useAccesibilidadStore';

const videos = [
  { id: 'bosque', titulo: 'BOSQUE EN NIEBLA', duracion: '2:30', categoria: 'NATURALEZA' },
  { id: 'olas', titulo: 'OLAS DEL MAR', duracion: '1:45', categoria: 'NATURALEZA' },
  { id: 'ciudad', titulo: 'LUCES DE CIUDAD', duracion: '3:00', categoria: 'URBANO' },
  { id: 'abstracto', titulo: 'FORMAS Y COLORES', duracion: '2:15', categoria: 'ABSTRACTO' },
];

export default function Biblioteca() {
  const colores = useAccesibilidadStore((s) => s.colores);

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8" style={{ color: colores.accent4, textShadow: '3px 3px 0px #000000' }}>
        ELIGE UNA PELICULA PARA EMPEZAR
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {videos.map((video) => {
          const ariaLabel = video.titulo + ', duracion ' + video.duracion + ', categoria ' + video.categoria;
          return (
            <Link
              key={video.id}
              to={'/editor/' + video.id}
              className="rounded-lg overflow-hidden border-2 border-black transition-all duration-200 shadow-[6px_6px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] focus:outline focus:outline-3 focus:outline-[#FFE156]"
              style={{ backgroundColor: colores.surface }}
              aria-label={ariaLabel}
            >
              <div className="h-40 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: colores.bg, color: colores.accent5 }}>
                [MINIATURA: {video.titulo}]
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1" style={{ color: colores.accent4 }}>{video.titulo}</h3>
                <p className="text-sm font-bold" style={{ color: colores.text }}>{video.duracion} - {video.categoria}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <BotonAccesible variante="secundario">SUBIR VIDEO PROPIO</BotonAccesible>
      </div>
    </div>
  );
}
