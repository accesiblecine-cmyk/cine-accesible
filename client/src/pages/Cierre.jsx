import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Tone from 'tone';
import { obtenerProyectoPorId } from '../utils/api';

const tonos = [
  { id: 'suave', nombre: 'SUAVE Y CALMADO', desc: 'Desaturacion lenta, particulas suaves, fade out.' },
  { id: 'intenso', nombre: 'INTENSO Y ENERGICO', desc: 'Explosion de color, zoom out, corte a negro.' },
  { id: 'suspensivo', nombre: 'SUSPENSIVO Y ABIERTO', desc: 'Fragmentacion del ultimo frame, nota sostenida.' },
  { id: 'silencio', nombre: 'SILENCIO ABSOLUTO', desc: 'Fundido a negro limpio, sin efectos ni sonido.' },
];

const instrumentos = [
  { id: 'piano', nombre: 'PIANO', osc: 'triangle' },
  { id: 'bateria', nombre: 'BATERIA', osc: 'square' },
  { id: 'cuerdas', nombre: 'CUERDAS', osc: 'sine' },
];

export default function Cierre() {
  const { id } = useParams();
  const [tonoSeleccionado, setTonoSeleccionado] = useState('suave');
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState('piano');
  const [grabando, setGrabando] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [secuencia, setSecuencia] = useState([]);
  const [guardado, setGuardado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const synthRef = useRef(null);
  const drumSamplerRef = useRef(null);
  const intervalRef = useRef(null);
  const instActual = instrumentos.find(i => i.id === instrumentoSeleccionado) || instrumentos[0];

  useEffect(() => {
    if (synthRef.current) { synthRef.current.dispose(); synthRef.current = null; }
    if (drumSamplerRef.current) {
  Object.values(drumSamplerRef.current).forEach(p => p?.dispose?.());
  drumSamplerRef.current = null;
}

    if (instrumentoSeleccionado === 'bateria') {
     const vol = new Tone.Volume(10).toDestination();
drumSamplerRef.current = {
  kick: new Tone.Player('/samples/kick.wav').connect(vol),
  snare: new Tone.Player('/samples/snare.wav').connect(vol),
  hihat: new Tone.Player('/samples/hihat.wav').connect(vol),
  crash: new Tone.Player('/samples/crash.wav').connect(vol),
  tom: new Tone.Player('/samples/tom.wav').connect(vol),
};
    } else {
      const oscType = instrumentoSeleccionado === 'piano' ? 'triangle' : 'sine';
      const release = instrumentoSeleccionado === 'cuerdas' ? 1.5 : 0.8;
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: oscType },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: release },
      }).toDestination();
      synthRef.current.volume.value = -5;
    }
     return () => {
      if (synthRef.current) synthRef.current.dispose();
      if (drumSamplerRef.current) {
        Object.values(drumSamplerRef.current).forEach(p => p?.dispose?.());
        drumSamplerRef.current = null;
      }
    };
  }, [instrumentoSeleccionado]);

  const iniciarGrabacion = useCallback(async () => {
    await Tone.start();
    setSecuencia([]);
    setGrabando(true);
    setTiempoGrabacion(0);
    const inicio = Date.now();
    intervalRef.current = setInterval(() => {
      const transcurrido = (Date.now() - inicio) / 1000;
      setTiempoGrabacion(transcurrido);
      if (transcurrido >= 15) detenerGrabacion();
    }, 100);
  }, []);

  const detenerGrabacion = useCallback(() => {
    setGrabando(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const tocarNota = useCallback(async (nota) => {
    if (!grabando) return;
    await Tone.start();
    if (instrumentoSeleccionado === 'bateria' && drumSamplerRef.current) {
      const player = drumSamplerRef.current?.kick;
if (player) { player.seek(0); player.start(); }
    } else if (synthRef.current) {
      synthRef.current.triggerAttackRelease(nota, '8n');
    }
    setSecuencia(prev => [...prev, { tiempo: tiempoGrabacion, nota, instrumento: instrumentoSeleccionado }]);
  }, [grabando, tiempoGrabacion, instrumentoSeleccionado]);

  const previsualizar = useCallback(async () => {
    await Tone.start();
    secuencia.forEach((p) => {
      setTimeout(() => {
        if (instrumentoSeleccionado === 'bateria' && drumSamplerRef.current) {
          drumSamplerRef.current.triggerAttackRelease('C4', '8n');
        } else if (synthRef.current) {
          synthRef.current.triggerAttackRelease(p.nota, '8n');
        }
      }, p.tiempo * 1000);
    });
  }, [secuencia, instrumentoSeleccionado]);

  const handleGuardarCierre = async () => {
    setMostrarAnimacion(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://cine-accesible-api.onrender.com/api/proyectos?videoId=' + id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      const proyectos = await res.json();
      const proy = proyectos.find(p => p.estado === 'borrador');
      
      if (proy) {
        await fetch('https://cine-accesible-api.onrender.com/api/proyectos/' + proy.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ cierre: { tono: tonoSeleccionado, instrumento: instrumentoSeleccionado, secuencia }, estado: 'completado' }),
        });
      } else {
        await fetch('https://cine-accesible-api.onrender.com/api/proyectos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ videoId: id, cierre: { tono: tonoSeleccionado, instrumento: instrumentoSeleccionado, secuencia }, estado: 'completado' }),
        });
      }
      setTimeout(() => { setGuardado(true); setMostrarAnimacion(false); }, 2000);
    } catch (e) {
      setMensaje('ERROR AL GUARDAR');
      setMostrarAnimacion(false);
      setTimeout(() => setMensaje(''), 2000);
    }
  };

  const notasVisuales = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI', 'DO+'];
  const notasReales = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const coloresAnimacion = {
    suave: 'from-[#2B1B3D] to-black',
    intenso: 'from-[#E0254F] to-black',
    suspensivo: 'from-[#4DE8FF] to-black',
    silencio: 'from-black to-black',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2B1B3D' }}>
      {mostrarAnimacion && (
        <div className={'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b ' + coloresAnimacion[tonoSeleccionado]}>
          <p className="text-5xl font-bold text-[#FFE156] animate-pulse" style={{ textShadow: '4px 4px 0px #000000' }}>
            {tonoSeleccionado === 'suave' && 'DESVANECIENDO...'}
            {tonoSeleccionado === 'intenso' && 'EXPLOTANDO...'}
            {tonoSeleccionado === 'suspensivo' && 'FRAGMENTANDO...'}
            {tonoSeleccionado === 'silencio' && 'SILENCIO...'}
          </p>
        </div>
      )}

      <div className="px-6 py-3 border-b-2 border-black flex gap-2 items-center text-sm font-bold" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/biblioteca" className="text-[#4DE8FF] hover:text-[#FFE156]">BIBLIOTECA</Link>
        <span className="text-[#FFF8E7]">/</span>
        <Link to={'/editor/' + id} className="text-[#4DE8FF] hover:text-[#FFE156]">EDITOR</Link>
        <span className="text-[#FFF8E7]">/</span>
        <span className="text-[#FFE156]">CIERRE</span>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
        <p className="text-xl text-center font-bold text-[#FFE156]" style={{ textShadow: '2px 2px 0px #000000' }}>
          LA PELICULA HA TERMINADO. AHORA TU DECIDES COMO CIERRA.
        </p>

        {!guardado ? (
          <>
            <fieldset className="border-2 border-black p-6 rounded-lg shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
              <legend className="text-lg font-bold text-[#FFE156] px-2">ELIGE EL TONO:</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tonos.map(tono => (
                  <label key={tono.id} className={'flex items-start gap-3 p-4 rounded-lg border-2 border-black cursor-pointer transition-all ' + (tonoSeleccionado === tono.id ? 'bg-[#00D4AA]' : 'bg-[#2B1B3D] hover:shadow-[2px_2px_0px_#000000]')}>
                    <input type="radio" name="tono" value={tono.id} checked={tonoSeleccionado === tono.id} onChange={() => setTonoSeleccionado(tono.id)} className="mt-1 accent-[#FFE156] w-5 h-5" />
                    <div>
                      <span className="font-bold" style={{ color: tonoSeleccionado === tono.id ? '#1A3A5C' : '#FFE156' }}>{tono.nombre}</span>
                      <p className="text-xs mt-1" style={{ color: tonoSeleccionado === tono.id ? '#1A3A5C' : '#FFF8E7' }}>{tono.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-2 border-black p-6 rounded-lg shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
              <legend className="text-lg font-bold text-[#FFE156] px-2">ELIGE INSTRUMENTO:</legend>
              <div className="flex gap-3">
                {instrumentos.map(inst => (
                  <button key={inst.id} onClick={() => setInstrumentoSeleccionado(inst.id)}
                    className={'px-6 py-4 rounded-lg border-2 border-black font-bold transition-all shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] ' + (instrumentoSeleccionado === inst.id ? 'bg-[#FF6B3D] text-[#FFF8E7]' : 'bg-[#2B1B3D] text-[#FFF8E7]')}
                    style={{ minWidth: '100px', minHeight: '56px' }}>{inst.nombre}</button>
                ))}
              </div>
            </fieldset>

            <div className="p-6 rounded-lg border-2 border-black shadow-[6px_6px_0px_#000000] flex flex-col items-center gap-4" style={{ backgroundColor: '#1A3A5C' }}>
              <p className="text-[#FFF8E7] font-bold">SECUENCIA FINAL (15 SEG)</p>
              <div className="text-4xl font-mono text-[#FFE156] font-bold">{tiempoGrabacion.toFixed(1)}s / 15.0s</div>
              <div className="flex gap-4">
                {!grabando ? (
                  <button onClick={iniciarGrabacion} className="px-8 py-4 rounded-lg border-2 border-black bg-[#E0254F] text-[#FFF8E7] font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all animate-pulse">GRABAR</button>
                ) : (
                  <button onClick={detenerGrabacion} className="px-8 py-4 rounded-lg border-2 border-black bg-[#FFE156] text-[#1A3A5C] font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all">DETENER</button>
                )}
              </div>
              {grabando && (
                <div className="flex gap-2 flex-wrap justify-center mt-4">
                  {notasVisuales.map((nota, i) => (
                    <button key={nota} onClick={() => tocarNota(notasReales[i])}
                      className="w-14 h-14 rounded-lg border-2 border-black bg-[#4DE8FF] text-[#1A3A5C] font-bold text-sm shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] active:scale-95 transition-all">{nota}</button>
                  ))}
                </div>
              )}
            </div>

            {secuencia.length > 0 && (
              <div className="flex gap-4 justify-center flex-wrap">
                <button onClick={previsualizar} className="px-6 py-3 rounded-lg border-2 border-black bg-[#4DE8FF] text-[#1A3A5C] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">PREVISUALIZAR</button>
                <button onClick={() => { setSecuencia([]); setTiempoGrabacion(0); }} className="px-6 py-3 rounded-lg border-2 border-black bg-[#FF4582] text-[#FFF8E7] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">REGRABAR</button>
              </div>
            )}

            <button onClick={handleGuardarCierre} className="w-full py-4 rounded-lg border-2 border-black bg-[#00D4AA] text-[#1A3A5C] font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">CONFIRMAR Y GUARDAR</button>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-3xl font-bold text-[#00D4AA] mb-4" style={{ textShadow: '3px 3px 0px #000000' }}>PROYECTO COMPLETADO</p>
            <p className="text-[#FFF8E7] text-lg mb-8">Tu version de esta pelicula esta lista.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to={'/ver/' + id} className="px-6 py-3 rounded-lg border-2 border-black bg-[#00D4AA] text-[#1A3A5C] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">VER RESULTADO</Link>
              <Link to="/perfil" className="px-6 py-3 rounded-lg border-2 border-black bg-[#4DE8FF] text-[#1A3A5C] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">MIS PROYECTOS</Link>
              <Link to="/biblioteca" className="px-6 py-3 rounded-lg border-2 border-black bg-[#FF6B3D] text-[#FFF8E7] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">NUEVO PROYECTO</Link>
            </div>
          </div>
        )}
      </main>

      {mensaje && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000000]" style={{ backgroundColor: mensaje.includes('ERROR') ? '#E0254F' : '#00D4AA', color: '#1A3A5C' }}>
          <p className="font-bold text-sm">{mensaje}</p>
        </div>
      )}
    </div>
  );
}
