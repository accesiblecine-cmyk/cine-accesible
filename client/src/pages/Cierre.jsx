import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';

const tonos = [
  { id: 'suave', nombre: 'Suave y calmado', descripcion: 'Desaturacion lenta, particulas suaves, fade out prolongado.' },
  { id: 'intenso', nombre: 'Intenso y energico', descripcion: 'Explosion de color, zoom out, corte a negro con eco.' },
  { id: 'suspensivo', nombre: 'Suspensivo y abierto', descripcion: 'Fragmentacion del ultimo frame, nota sostenida.' },
  { id: 'silencio', nombre: 'Silencio absoluto', descripcion: 'Fundido a negro limpio, sin efectos ni sonido.' },
];

const instrumentos = ['Piano', 'Bateria', 'Cuerdas', 'Efecto'];

export default function Cierre() {
  const { id } = useParams();
  const [tonoSeleccionado, setTonoSeleccionado] = useState(null);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState(null);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F0F0F0] flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#404040]">
        <Link to={'/editor/' + id} className="text-[#B0B0B0] hover:text-[#F0F0F0]">
          Volver al editor
        </Link>
        <h1 className="text-xl font-bold text-[#6BB5FF]">Cierre de pelicula</h1>
        <div></div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <p className="text-xl text-center">
          La pelicula ha terminado. Ahora tu decides como cierra.
        </p>

        <fieldset>
          <legend className="text-lg font-bold mb-4">Elige el tono de tu final:</legend>
          <div className="flex flex-col gap-3">
            {tonos.map((tono) => (
              <label
                key={tono.id}
                className={
                  'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ' +
                  (tonoSeleccionado === tono.id
                    ? 'border-[#6BB5FF] bg-[#252525]'
                    : 'border-[#404040] hover:border-[#B0B0B0]')
                }
              >
                <input
                  type="radio"
                  name="tono"
                  value={tono.id}
                  checked={tonoSeleccionado === tono.id}
                  onChange={() => setTonoSeleccionado(tono.id)}
                  className="mt-1 accent-[#6BB5FF]"
                />
                <div>
                  <span className="font-bold text-lg">{tono.nombre}</span>
                  <p className="text-[#B0B0B0] text-sm mt-1">{tono.descripcion}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-bold mb-4">Elige tu ultimo instrumento:</legend>
          <div className="flex gap-3">
            {instrumentos.map((inst) => (
              <button
                key={inst}
                onClick={() => setInstrumentoSeleccionado(inst)}
                className={
                  'px-6 py-4 rounded-lg border font-bold transition-colors focus:outline focus:outline-2 focus:outline-[#FFB347] ' +
                  (instrumentoSeleccionado === inst
                    ? 'border-[#6BB5FF] bg-[#252525] text-[#6BB5FF]'
                    : 'border-[#404040] hover:border-[#B0B0B0]')
                }
                style={{ minWidth: '100px', minHeight: '56px' }}
                aria-pressed={instrumentoSeleccionado === inst}
              >
                {inst}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="bg-[#2A2A2A] p-6 rounded-lg flex flex-col items-center gap-4">
          <p className="text-[#B0B0B0]">Toca tu secuencia de cierre (maximo 15 segundos)</p>
          <div className="text-3xl font-mono">0:00 / 0:15</div>
          <BotonAccesible variante="primario">
            Grabar secuencia final
          </BotonAccesible>
        </div>

        <div className="flex gap-4 justify-center">
          <BotonAccesible variante="secundario">Previsualizar</BotonAccesible>
          <BotonAccesible variante="secundario">Usar cierre predeterminado</BotonAccesible>
        </div>

        <BotonAccesible variante="primario" className="w-full">
          Confirmar y guardar
        </BotonAccesible>
      </main>
    </div>
  );
}
