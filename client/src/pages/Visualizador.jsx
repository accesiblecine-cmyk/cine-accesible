import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import * as Tone from 'tone';
import OndasSonido from '../components/editor/OndasSonido';
import SubtitulosInstrumentos from '../components/editor/SubtitulosInstrumentos';
import { obtenerVideo, obtenerProyectoPorId } from '../utils/api';

const coloresAnimacion = {
  suave: 'from-[#2B1B3D] to-black',
  intenso: 'from-[#E0254F] to-black',
  suspensivo: 'from-[#4DE8FF] to-black',
  silencio: 'from-black to-black',
};

export default function Visualizador() {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const materialRef = useRef(null);
  const rendererRef = useRef(null);
  const synthPianoRef = useRef(null);
  const synthCuerdasRef = useRef(null);
  const playersBateriaRef = useRef({});
  const synthCierreRef = useRef(null);
  const playersCierreRef = useRef({});

  const [videoUrl, setVideoUrl] = useState('');
  const [puntos, setPuntos] = useState([]);
  const [cierre, setCierre] = useState(null);
  const [videoCargado, setVideoCargado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [mostrarAnimacionFinal, setMostrarAnimacionFinal] = useState(false);
  const [efectosActivos, setEfectosActivos] = useState({});

  useEffect(() => {
    obtenerProyectoPorId(id).then(p => {
      if (p) {
        setPuntos(p.historial || []);
        setCierre(p.cierre || null);
        obtenerVideo(p.videoId).then(v => { setVideoUrl(v.url); }).catch(() => setCargando(false));
      } else setCargando(false);
    }).catch(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    synthPianoRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
    }).toDestination();
    synthPianoRef.current.volume.value = -5;
    synthCuerdasRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' }, envelope: { attack: 0.1, decay: 0.4, sustain: 0.5, release: 1.2 },
    }).toDestination();
    synthCuerdasRef.current.volume.value = -5;
    const volBat = new Tone.Volume(10).toDestination();
    ['kick','snare','hihat','crash','tom'].forEach(t => {
      playersBateriaRef.current[t] = new Tone.Player('/samples/' + t + '.wav').connect(volBat);
    });
    return () => {
      synthPianoRef.current?.dispose();
      synthCuerdasRef.current?.dispose();
      Object.values(playersBateriaRef.current).forEach(p => p?.dispose?.());
    };
  }, []);

  useEffect(() => {
    if (!cierre) return;
    synthCierreRef.current?.dispose();
    Object.values(playersCierreRef.current).forEach(p => p?.dispose?.());
    playersCierreRef.current = {};
    if (cierre.instrumento === 'bateria') {
      const vol = new Tone.Volume(10).toDestination();
      ['kick','snare','hihat','crash','tom'].forEach(t => {
        playersCierreRef.current[t] = new Tone.Player('/samples/' + t + '.wav').connect(vol);
      });
    } else {
      const osc = cierre.instrumento === 'piano' ? 'triangle' : 'sine';
      const rel = cierre.instrumento === 'cuerdas' ? 1.5 : 0.8;
      synthCierreRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: osc }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: rel },
      }).toDestination();
      synthCierreRef.current.volume.value = -5;
    }
  }, [cierre]);

  useEffect(() => {
    if (!videoUrl) return;
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = false; video.muted = true; video.crossOrigin = 'anonymous';
    video.playsInline = true; video.preload = 'auto'; video.setAttribute('playsinline', '');
    video.addEventListener('loadeddata', () => { setVideoCargado(true); setCargando(false); });
    video.addEventListener('play', () => setReproduciendo(true));
    video.addEventListener('pause', () => setReproduciendo(false));
    videoRef.current = video;
    return () => { video.pause(); };
  }, [videoUrl]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !videoCargado) return;
    const video = videoRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, powerPreference: 'high-performance', antialias: false });
    renderer.setPixelRatio(1); rendererRef.current = renderer;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); camera.position.z = 1;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter; texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.ShaderMaterial({
      uniforms: { u_texture: { value: texture }, u_efectoActivo: { value: 0 }, u_intensidad: { value: 0.5 }, u_tipoEfecto: { value: 0 } },
      vertexShader: 'varying vec2 v_uv; void main() { v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 v_uv; uniform sampler2D u_texture; uniform float u_efectoActivo; uniform float u_intensidad; uniform int u_tipoEfecto; void main() { vec4 color = texture2D(u_texture, v_uv); float i = u_intensidad; if (u_efectoActivo > 0.5) { if (u_tipoEfecto == 0) { color.r *= (1.0 + 0.6 * i); color.b *= (1.0 - 0.5 * i); } else if (u_tipoEfecto == 1) { color.b *= (1.0 + 0.6 * i); color.r *= (1.0 - 0.5 * i); } else if (u_tipoEfecto == 2) { color *= (1.0 + 0.4 * i); } else if (u_tipoEfecto == 3) { float glitch = sin(v_uv.y * 100.0) * 0.1 * i; color.r += glitch; color.b -= glitch; } } gl_FragColor = color; }',
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    let animacionActiva = true;
    const animate = () => {
      if (!animacionActiva) return;
      requestAnimationFrame(animate);
      if (materialRef.current) {
        const efArr = materialRef.current.uniforms.u_efectos?.value;
        if (efArr) {
          efArr[0] = Object.values(efectosActivos).includes('Calido') ? 1.0 : 0.0;
          efArr[1] = Object.values(efectosActivos).includes('Frio') ? 1.0 : 0.0;
          efArr[2] = Object.values(efectosActivos).includes('Zoom') ? 1.0 : 0.0;
          efArr[3] = Object.values(efectosActivos).includes('Glitch') ? 1.0 : 0.0;
        }
      }
      if (video.readyState >= 2) renderer.render(scene, camera);
    };
    animate();
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const parent = canvasRef.current.parentElement;
      if (parent) renderer.setSize(Math.max(400, parent.clientWidth - 32), Math.max(200, parent.clientHeight - 32));
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      animacionActiva = false;
      renderer.dispose(); material.dispose(); texture.dispose();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [videoCargado]);

  const puntosRef = useRef([]);
  const puntosReproducidosRef = useRef(new Set());
  useEffect(() => { puntosRef.current = puntos; }, [puntos]);

  const ejecutarPunto = async (punto) => {
    await Tone.start();
    if (punto.instrumento === 'Piano') synthPianoRef.current?.triggerAttackRelease(punto.notaReal || 'C4', '8n');
    else if (punto.instrumento === 'Bateria') {
      const p = playersBateriaRef.current[punto.nota?.toLowerCase()];
      if (p) { p.seek(0); p.start(); }
    }
    else if (punto.instrumento === 'Cuerdas') synthCuerdasRef.current?.triggerAttackRelease(punto.notaReal || 'C4', '2n');
    const ef = { Calido: 0, Frio: 1, Zoom: 2, Glitch: 3 };
    if (materialRef.current) {
      materialRef.current.uniforms.u_tipoEfecto.value = ef[punto.nombreEfecto] ?? 0;
      materialRef.current.uniforms.u_efectoActivo.value = 1.0;
      setEfectosActivos(prev => ({ ...prev, [punto.id]: punto.nombreEfecto }));
      setTimeout(() => {
        if (materialRef.current) materialRef.current.uniforms.u_efectoActivo.value = 0;
        setEfectosActivos(prev => { const n = { ...prev }; delete n[punto.id]; return n; });
      }, punto.instrumento === 'Cuerdas' ? 2000 : 500);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (!video.paused) {
        puntosRef.current.forEach(p => {
          if (!puntosReproducidosRef.current.has(p.id) && video.currentTime >= p.tiempo) {
            puntosReproducidosRef.current.add(p.id);
            ejecutarPunto(p);
          }
        });
        if (video.duration > 0 && video.currentTime >= video.duration - 0.5) {
          video.pause(); setTerminado(true); setReproduciendo(false); setMostrarAnimacionFinal(true);
          if (cierre?.secuencia) {
            cierre.secuencia.forEach(s => {
              setTimeout(() => {
                if (cierre.instrumento === 'bateria') {
                  const p = playersCierreRef.current?.kick;
                  if (p) { p.seek(0); p.start(); }
                } else synthCierreRef.current?.triggerAttackRelease(s.nota, '2n');
              }, s.tiempo * 1000);
            });
          }
          setTimeout(() => setMostrarAnimacionFinal(false), 3000);
        }
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [puntos, cierre, videoCargado]);

  const handlePlay = async () => {
    await Tone.start();
    const v = videoRef.current; if (!v) return;
    if (terminado) { v.currentTime = 0; setTerminado(false); setMostrarAnimacionFinal(false); puntosReproducidosRef.current.clear(); }
    v.paused ? v.play() : v.pause();
  };

  if (cargando) return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#2B1B3D' }}><p className="text-xl font-bold text-[#FFE156] animate-pulse">CARGANDO PROYECTO...</p></div>;

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#2B1B3D' }}>
      {mostrarAnimacionFinal && cierre && (
        <div className={'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b ' + coloresAnimacion[cierre.tono] + ' transition-all duration-1000'}>
          <p className="text-5xl font-bold text-[#FFE156] animate-pulse" style={{ textShadow: '4px 4px 0px #000000' }}>
            {cierre.tono === 'suave' && 'DESVANECIENDO...'}
            {cierre.tono === 'intenso' && 'EXPLOTANDO...'}
            {cierre.tono === 'suspensivo' && 'FRAGMENTANDO...'}
            {cierre.tono === 'silencio' && 'SILENCIO...'}
          </p>
        </div>
      )}
      <header className="flex items-center gap-3 px-4 py-2 border-b-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/perfil" className="text-xs font-bold text-[#4DE8FF] hover:underline">MIS PROYECTOS</Link>
        <span className="text-xs text-[#FFF8E7]">/ VISUALIZANDO</span>
        <div className="flex-1"></div>
        {terminado && <span className="text-xs font-bold text-[#00D4AA] animate-pulse">COMPLETADO</span>}
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          <canvas ref={canvasRef} className="rounded-lg border-2 border-black shadow-[6px_6px_0px_#000000] w-full" style={{ aspectRatio: '16/9', maxHeight: '70vh' }} />
          {videoCargado && <OndasSonido puntos={puntos} tiempoActual={videoRef.current?.currentTime || 0} />}
          {videoCargado && <SubtitulosInstrumentos puntos={puntos} tiempoActual={videoRef.current?.currentTime || 0} />}
        </div>
      </div>
<div className="w-full max-w-4xl mx-auto px-4 pb-2">
  <input
    type="range"
    min="0"
    max={videoRef.current?.duration || 0}
    value={videoRef.current?.currentTime || 0}
    onChange={(e) => { const v = videoRef.current; if (v) v.currentTime = parseFloat(e.target.value); }}
    className="w-full accent-[#FF6B3D]"
  />
</div>
      <div className="flex justify-center gap-4 py-4 border-t-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <button onClick={handlePlay} className="px-8 py-3 rounded-lg border-2 border-black font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" style={{ backgroundColor: '#00D4AA', color: '#1A3A5C' }}>
          {terminado ? 'REINICIAR' : reproduciendo ? 'PAUSA' : 'REPRODUCIR'}
        </button>
      </div>
    </div>
  );
}
