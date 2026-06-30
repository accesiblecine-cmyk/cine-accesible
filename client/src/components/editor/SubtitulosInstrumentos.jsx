import { useEffect, useRef, useState } from 'react';
import useAccesibilidadStore from '../../store/useAccesibilidadStore';

export default function SubtitulosInstrumentos({ puntos, tiempoActual }) {
  const [subtitulo, setSubtitulo] = useState(null);
  const timeoutRef = useRef(null);
  const activo = useAccesibilidadStore((s) => s.subtitulos);

  useEffect(() => {
    if (!activo) return;
    const nuevoPunto = puntos.find(p => {
      const diff = Math.abs(p.tiempo - tiempoActual);
      return diff < 0.05;
    });

    if (nuevoPunto) {
      setSubtitulo({
        id: nuevoPunto.id,
        texto: nuevoPunto.instrumento + ': ' + nuevoPunto.nota + ' (' + nuevoPunto.nombreEfecto + ')',
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSubtitulo(null), 1200);
    }
  }, [puntos, tiempoActual, activo]);

  if (!activo || !subtitulo) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="bg-black bg-opacity-70 border-2 border-white rounded-lg px-6 py-3">
        <p className="text-white font-bold text-lg text-center" style={{ fontFamily: 'JetBrains Mono, monospace', textShadow: '2px 2px 0px #000000' }}>
          {subtitulo.texto}
        </p>
      </div>
    </div>
  );
}
