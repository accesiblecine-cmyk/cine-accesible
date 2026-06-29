import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';

const videos = [
  { id: 'bosque', titulo: 'Bosque en niebla', duracion: '2:30', categoria: 'Naturaleza' },
  { id: 'olas', titulo: 'Olas del mar', duracion: '1:45', categoria: 'Naturaleza' },
  { id: 'ciudad', titulo: 'Luces de ciudad', duracion: '3:00', categoria: 'Urbano' },
  { id: 'abstracto', titulo: 'Formas y colores', duracion: '2:15', categoria: 'Abstracto' },
];

export default function Biblioteca() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F0F0F0]">
      <header className="flex justify-between items-center px-8 py-6 border-b border-[#404040]">
        <h1 className="text-3xl font-bold text-[#6BB5FF]">Cine Accesible</h1>
        <nav className="flex gap-4 items-center">
          <span className="text-[#B0B0B0]">Hola</span>
          <Link to="/perfil" className="text-[#6BB5FF] hover:underline">Mi perfil</Link>
        </nav>
      </header>

      <main className="px-8 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Elige una pelicula para empezar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => {
            const ariaLabel = video.titulo + ', duracion ' + video.duracion + ', categoria ' + video.categoria;
            return (
              <Link
                key={video.id}
                to={'/editor/' + video.id}
                className="bg-[#2A2A2A] rounded-lg overflow-hidden border border-[#404040] hover:border-[#6BB5FF] focus:outline focus:outline-2 focus:outline-[#FFB347] transition-all duration-300"
                aria-label={ariaLabel}
              >
                <div className="h-40 bg-[#1A1A1A] flex items-center justify-center text-[#404040] text-sm">
                  [Miniatura: {video.titulo}]
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{video.titulo}</h3>
                  <p className="text-[#B0B0B0] text-sm">{video.duracion} - {video.categoria}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <BotonAccesible variante="secundario">Subir video propio</BotonAccesible>
        </div>
      </main>
    </div>
  );
}
