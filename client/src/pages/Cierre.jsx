import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';

const tonos = [
  { id: 'suave', nombre: 'SUAVE Y CALMADO', descripcion: 'Desaturacion lenta, particulas suaves, fade out prolongado.' },
  { id: 'intenso', nombre: 'INTENSO Y ENERGICO', descripcion: 'Explosion de color, zoom out, corte a negro con eco.' },
  { id: 'suspensivo', nombre: 'SUSPENSIVO Y ABIERTO', descripcion: 'Fragmentacion del ultimo frame, nota sostenida.' },
  { id: 'silencio', nombre: 'SILENCIO ABSOLUTO', descripcion: 'Fundido a negro limpio, sin efectos ni sonido.' },
];

const instrumentos = ['PIANO', 'BATERIA', 'CUERDAS', 'EFECTO'];

export default function Cierre() {
  const { id } = useParams();
  const [tonoSeleccionado, setTonoSeleccionado] = useState(null);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState(null);

  return (
    <div className="flex flex-col">
      <div className="px-6 py-3 border-b-2 border-black flex gap-2 items-center text-sm font-bold" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/biblioteca" className="text-[#4DE8FF] hover:text-[#FFE156]">BIBLIOTECA</Link>
        <span className="text-[#FFF8E7]">/</span>
        <Link to={'/editor/' + id} className="text-[#4DE8FF] hover:text-[#FFE156]">EDITOR: {id?.toUpperCase()}</Link>
        <span className="text-[#FFF8E7]">/</span>
        <span className="text-[#FFE156]">CIERRE</span>
      </div>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <p className="text-xl text-center font-bold text-[#FFE156]" style={{ textShadow: '2px 2px 0px #000000' }}>
          LA PELICULA HA TERMINADO. AHORA TU DECIDES COMO CIERRA.
        </p>

        <fieldset className="border-2 border-black p-6 rounded-lg shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <legend className="text-lg font-bold text-[#FFE156] px-2" style={{ textShadow: '2px 2px 0px #000000' }}>ELIGE EL TONO DE TU FINAL:</legend>
          <div className="flex flex-col gap-3">
            {tonos.map((tono) => (
              <label key={tono.id} className={'flex items-start gap-4 p-4 rounded-lg border-2 border-black cursor-pointer transition-all shadow-[3px_3px_0px_#000000] ' + (tonoSeleccionado === tono.id ? 'bg-[#00D4AA]' : 'bg-[#2B1B3D] hover:shadow-[1px_1px_0px_#000000]')}>
                <input type="radio" name="tono" value={tono.id} checked={tonoSeleccionado === tono.id} onChange={() => setTonoSeleccionado(tono.id)} className="mt-1 accent-[#FFE156] w-5 h-5" />
                <div>
                  <span className="font-bold text-lg" style={{ color: tonoSeleccionado === tono.id ? '#1A3A5C' : '#FFE156' }}>{tono.nombre}</span>
                  <p className="text-sm mt-1 font-bold" style={{ color: tonoSeleccionado === tono.id ? '#1A3A5C' : '#FFF8E7' }}>{tono.descripcion}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-2 border-black p-6 rounded-lg shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <legend className="text-lg font-bold text-[#FFE156] px-2" style={{ textShadow: '2px 2px 0px #000000' }}>ELIGE TU ULTIMO INSTRUMENTO:</legend>
          <div className="flex gap-3 flex-wrap">
            {instrumentos.map((inst) => (
              <button
                key={inst}
                onClick={() => setInstrumentoSeleccionado(inst)}
                className={'px-6 py-4 rounded-lg border-2 border-black font-bold transition-all shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] ' + (instrumentoSeleccionado === inst ? 'bg-[#FF6B3D] text-[#FFF8E7]' : 'bg-[#2B1B3D] text-[#FFF8E7]')}
                style={{ minWidth: '100px', minHeight: '56px' }}
                aria-pressed={instrumentoSeleccionado === inst}
              >
                {inst}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="p-6 rounded-lg border-2 border-black flex flex-col items-center gap-4 shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <p className="text-[#FFF8E7] font-bold">TOCA TU SECUENCIA DE CIERRE (MAXIMO 15 SEGUNDOS)</p>
          <div className="text-3xl font-mono text-[#FFE156] font-bold">0:00 / 0:15</div>
          <BotonAccesible variante="primario">GRABAR SECUENCIA FINAL</BotonAccesible>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <BotonAccesible variante="secundario">PREVISUALIZAR</BotonAccesible>
          <BotonAccesible variante="secundario">USAR CIERRE PREDETERMINADO</BotonAccesible>
        </div>

        <BotonAccesible variante="primario" className="w-full">CONFIRMAR Y GUARDAR</BotonAccesible>
      </main>
    </div>
  );
}
