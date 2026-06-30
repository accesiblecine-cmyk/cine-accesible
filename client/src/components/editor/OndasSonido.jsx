import { useEffect, useRef, useCallback } from 'react';
import useAccesibilidadStore from '../../store/useAccesibilidadStore';

const coloresOnda = {
  Piano: '#FF4582',
  Bateria: '#FF6B3D',
  Cuerdas: '#4DE8FF',
};

export default function OndasSonido({ puntos, tiempoActual }) {
  const canvasRef = useRef(null);
  const ondasRef = useRef([]);
  const animacionRef = useRef(null);
  const activo = useAccesibilidadStore((s) => s.ondasSonido);

  useEffect(() => {
    if (!activo) return;
    const nuevasOndas = puntos.filter(p => {
      const diferencia = Math.abs(p.tiempo - tiempoActual);
      return diferencia < 0.05 && !ondasRef.current.find(o => o.id === p.id);
    });

    nuevasOndas.forEach(p => {
      ondasRef.current.push({
        id: p.id,
        instrumento: p.instrumento,
        radio: 0,
        opacidad: 1,
        tiempoInicio: performance.now(),
      });
    });
  }, [puntos, tiempoActual, activo]);

  useEffect(() => {
    if (!activo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animar = () => {
      const ahora = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ondasRef.current = ondasRef.current.filter(onda => {
        const edad = (ahora - onda.tiempoInicio) / 1000;
        onda.radio = edad * 400;
        onda.opacidad = Math.max(0, 1 - edad * 2);

        if (onda.opacidad <= 0) return false;

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, onda.radio, 0, Math.PI * 2);
        ctx.strokeStyle = (coloresOnda[onda.instrumento] || '#FFFFFF') + Math.floor(onda.opacidad * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3 * onda.opacidad;
        ctx.stroke();

        return true;
      });

      animacionRef.current = requestAnimationFrame(animar);
    };

    animar();
    return () => { if (animacionRef.current) cancelAnimationFrame(animacionRef.current); };
  }, [activo]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  }, []);

  useEffect(() => {
    if (!activo) return;
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize, activo]);

  if (!activo) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
