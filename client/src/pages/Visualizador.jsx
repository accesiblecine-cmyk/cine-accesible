import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Tone from 'tone';
import { obtenerVideo, obtenerProyectoPorId } from '../utils/api';

export default function Visualizador() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const puntosReproducidosRef = useRef(new Set());
  const synthRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [puntos, setPuntos] = useState([]);
  const [cierre, setCierre] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [terminado, setTerminado] = useState(false);

  useEffect(() => {
    obtenerProyectoPorId(id).then(p => {
      console.log('Proyecto:', p);
      if (p) {
        setPuntos(p.historial || []);
        setCierre(p.cierre || null);
        obtenerVideo(p.videoId).then(v => setVideoUrl(v.url)).catch(() => setCargando(false));
      } else {
        setCargando(false);
      }
    }).catch(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 },
    }).toDestination();
    synthRef.current.volume.value = -5;
    return () => { if (synthRef.current) synthRef.current.dispose(); };
  }, []);

  useEffect(() => {
    if (!videoUrl) return;
    setCargando(false);
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.paused) return;
    const tiempo = video.currentTime;
    puntos.forEach(p => {
      if (!puntosReproducidosRef.current.has(p.id) && tiempo >= p.tiempo) {
        puntosReproducidosRef.current.add(p.id);
        if (synthRef.current) synthRef.current.triggerAttackRelease(p.notaReal || 'C4', '8n');
      }
    });
    if (video.duration > 0 && tiempo >= video.duration - 0.5) {
      video.pause();
      setTerminado(true);
      setReproduciendo(false);
      if (cierre?.secuencia) {
        cierre.secuencia.forEach((s) => {
          setTimeout(() => {
            if (synthRef.current) synthRef.current.triggerAttackRelease(s.nota, '2n');
          }, s.tiempo * 1000);
        });
      }
    }
  };

  const handlePlay = async () => {
    await Tone.start();
    const v = videoRef.current;
    if (!v) return;
    if (terminado) {
      v.currentTime = 0;
      setTerminado(false);
      puntosReproducidosRef.current.clear();
    }
    if (v.paused) {
      v.play();
      setReproduciendo(true);
      puntosReproducidosRef.current.clear();
    } else {
      v.pause();
      setReproduciendo(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#2B1B3D' }}>
        <p className="text-xl font-bold text-[#FFE156] animate-pulse">CARGANDO PROYECTO...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#2B1B3D' }}>
      <header className="flex items-center gap-3 px-4 py-2 border-b-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/perfil" className="text-xs font-bold text-[#4DE8FF] hover:underline">MIS PROYECTOS</Link>
        <span className="text-xs text-[#FFF8E7]">/ VISUALIZANDO</span>
        <div className="flex-1"></div>
        {terminado && <span className="text-xs font-bold text-[#00D4AA] animate-pulse">COMPLETADO</span>}
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="rounded-lg border-2 border-black shadow-[6px_6px_0px_#000000] max-w-full max-h-full"
          style={{ maxHeight: '70vh' }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
          playsInline
          preload="auto"
        />
      </div>

      <div className="flex justify-center gap-4 py-4 border-t-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <button onClick={handlePlay} className="px-8 py-3 rounded-lg border-2 border-black font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" style={{ backgroundColor: '#00D4AA', color: '#1A3A5C' }}>
          {terminado ? 'REINICIAR' : reproduciendo ? 'PAUSA' : 'REPRODUCIR'}
        </button>
      </div>

      {terminado && cierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center p-8 rounded-lg border-2 border-black shadow-[8px_8px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
            <p className="text-3xl font-bold text-[#FFE156] mb-4" style={{ textShadow: '3px 3px 0px #000000' }}>FIN</p>
            <p className="text-[#FFF8E7] mb-2">Tono: {cierre.tono?.toUpperCase()}</p>
            <p className="text-[#FFF8E7] mb-6">Instrumento: {cierre.instrumento?.toUpperCase()}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => { setTerminado(false); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }} className="px-6 py-3 rounded-lg border-2 border-black bg-[#4DE8FF] text-[#1A3A5C] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">VER DE NUEVO</button>
              <Link to="/perfil" className="px-6 py-3 rounded-lg border-2 border-black bg-[#FF6B3D] text-[#FFF8E7] font-bold shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all">MIS PROYECTOS</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
