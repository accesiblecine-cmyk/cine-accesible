import { useState, useEffect, useCallback } from 'react';

const NOTAS = [
  { nombre: 'DO', nota: 'C3', tecla: 'A' },
  { nombre: 'DO#', nota: 'C#3', tecla: 'W' },
  { nombre: 'RE', nota: 'D3', tecla: 'S' },
  { nombre: 'RE#', nota: 'D#3', tecla: 'E' },
  { nombre: 'MI', nota: 'E3', tecla: 'D' },
  { nombre: 'FA', nota: 'F3', tecla: 'F' },
  { nombre: 'FA#', nota: 'F#3', tecla: 'T' },
  { nombre: 'SOL', nota: 'G3', tecla: 'G' },
  { nombre: 'SOL#', nota: 'G#3', tecla: 'Y' },
  { nombre: 'LA', nota: 'A3', tecla: 'H' },
  { nombre: 'LA#', nota: 'A#3', tecla: 'U' },
  { nombre: 'SI', nota: 'B3', tecla: 'J' },
  { nombre: 'DO+', nota: 'C4', tecla: 'K' },
];

export default function PianoVertical({ onNotaTocada, colores, activo }) {
  const [teclaActiva, setTeclaActiva] = useState(null);

  useEffect(() => {
    if (!activo) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const tecla = e.key.toUpperCase();
      const nota = NOTAS.find(n => n.tecla === tecla);
      if (nota) {
        e.preventDefault();
        onNotaTocada(nota);
        setTeclaActiva(nota.nombre);
        setTimeout(() => setTeclaActiva(null), 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activo, onNotaTocada]);

  return (
    <div className="flex flex-col gap-1 w-full">
      {NOTAS.map((nota) => {
        const esNegra = nota.nombre.includes('#');
        const activa = teclaActiva === nota.nombre;
        return (
          <button
            key={nota.nombre}
            onClick={() => { onNotaTocada(nota); setTeclaActiva(nota.nombre); setTimeout(() => setTeclaActiva(null), 150); }}
            className={'font-bold border-2 border-black transition-all active:scale-95 relative ' + (esNegra ? 'text-xs h-6' : 'text-sm h-8')}
            style={{
              backgroundColor: activa ? '#FFE156' : (esNegra ? '#000000' : '#FFFFFF'),
              color: esNegra ? (activa ? '#000000' : '#FFFFFF') : '#1A3A5C',
              borderRadius: '4px',
              boxShadow: activa ? '1px 1px 0px #000000' : '2px 2px 0px #000000',
              width: '100%',
              transform: activa ? 'scale(0.95)' : 'scale(1)',
            }}
            aria-label={'Piano ' + nota.nombre + ' tecla ' + nota.tecla}
          >
            <span className={activa ? 'opacity-100' : 'opacity-70'}>
              {nota.nombre}
            </span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs opacity-50" style={{ fontSize: '0.6rem' }}>
              {nota.tecla}
            </span>
          </button>
        );
      })}
    </div>
  );
}

