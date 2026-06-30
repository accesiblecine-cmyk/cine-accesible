import { useRef } from 'react';

const coloresCapa = {
  Piano: '#FF4582',
  Bateria: '#FF6B3D',
  Cuerdas: '#4DE8FF',
};

export default function LineaTiempo({ puntos, tiempoActual, duracion, onClic, onMoverPunto, puntoSeleccionado, onSeleccionarPunto, colores }) {
  const ref = useRef(null);

  const handleClic = (e) => {
    if (!ref.current || duracion <= 0) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const porcentaje = x / rect.width;
    onClic(porcentaje * duracion);
  };

  const formatoTiempo = (s) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const se = Math.floor(s % 60);
    return m + ':' + (se < 10 ? '0' : '') + se;
  };

  const capsulas = {};
  puntos.forEach(p => {
    const capa = p.instrumento;
    if (!capsulas[capa]) capsulas[capa] = [];
    capsulas[capa].push(p);
  });

  return (
    <div className="flex flex-col gap-1">
      {Object.keys(capsulas).map(capa => (
        <div key={capa} className="flex items-center gap-2">
          <span className="text-xs font-bold w-14 text-right" style={{ color: coloresCapa[capa] || '#FFF8E7' }}>{capa.substring(0, 4).toUpperCase()}</span>
          <div className="flex-1 h-5 rounded border border-black relative overflow-hidden" style={{ backgroundColor: '#2B1B3D' }}>
            {capsulas[capa].map(p => (
              <div
                key={p.id}
                onClick={(e) => { e.stopPropagation(); onSeleccionarPunto(p); }}
                className="absolute top-0 bottom-0 w-1.5 cursor-pointer hover:scale-125 transition-transform"
                style={{
                  left: duracion > 0 ? (p.tiempo / duracion) * 100 + '%' : '0%',
                  backgroundColor: puntoSeleccionado === p.id ? '#FFFFFF' : (coloresCapa[capa] || '#FF6B3D'),
                  transform: 'translateX(-50%)',
                  border: puntoSeleccionado === p.id ? '1px solid black' : 'none',
                  zIndex: puntoSeleccionado === p.id ? 10 : 1,
                }}
                title={capa + ': ' + p.nota + ' - ' + formatoTiempo(p.tiempo)}
              ></div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold w-14 text-right" style={{ color: '#4DE8FF' }}>TODO</span>
        <div
          ref={ref}
          className="flex-1 h-8 rounded-lg border-2 border-black relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: '#2B1B3D' }}
          onClick={handleClic}
        >
          <div className="absolute inset-0 flex items-center" style={{ opacity: 0.2 }}>
            <div className="h-full transition-all duration-100" style={{ width: duracion > 0 ? (tiempoActual / duracion) * 100 + '%' : '0%', backgroundColor: '#4DE8FF' }}></div>
          </div>
          <div className="absolute top-0 bottom-0 w-0.5 z-20" style={{ left: duracion > 0 ? (tiempoActual / duracion) * 100 + '%' : '0%', backgroundColor: '#E0254F' }}></div>
          {puntos.map(p => (
            <div
              key={p.id}
              onClick={(e) => { e.stopPropagation(); onSeleccionarPunto(p); }}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 cursor-pointer hover:scale-150 transition-transform border border-black z-15"
              style={{
                left: duracion > 0 ? (p.tiempo / duracion) * 100 + '%' : '0%',
                backgroundColor: puntoSeleccionado === p.id ? '#FFFFFF' : (coloresCapa[p.instrumento] || '#FFE156'),
              }}
              title={p.instrumento + ': ' + p.nota + ' - ' + formatoTiempo(p.tiempo)}
            ></div>
          ))}
        </div>
        <span className="text-xs font-bold w-14" style={{ color: '#FFF8E7' }}>{formatoTiempo(tiempoActual)}</span>
      </div>
    </div>
  );
}






