import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import * as Tone from 'tone';
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
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
  const puntosReproducidosRef = useRef(new Set());
  const synthPianoRef = useRef(null);
  const synthCuerdasRef = useRef(null);
  const playersBateriaRef = useRef({});
  const synthCierreRef = useRef(null);
  const playersCierreRef = useRef({});

  const [videoUrl, setVideoUrl] = useState('');
  const [puntos, setPuntos] = useState([]);
  const [cierre, setCierre] = useState(null);
  const [videoListo, setVideoListo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [mostrarAnimacionFinal, setMostrarAnimacionFinal] = useState(false);

  useEffect(() => {
    obtenerProyectoPorId(id).then(p => {
      if (p) {
        setPuntos(p.historial || []);
        setCierre(p.cierre || null);
        obtenerVideo(p.videoId).then(v => setVideoUrl(v.url)).catch(() => setCargando(false));
      } else setCargando(false);
    }).catch(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    synthPianoRef.current?.dispose();
    synthPianoRef.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 } }).toDestination();
    synthPianoRef.current.volume.value = -5;
    synthCuerdasRef.current?.dispose();
    synthCuerdasRef.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 1.5 } }).toDestination();
    synthCuerdasRef.current.volume.value = -5;
    Object.values(playersBateriaRef.current).forEach(p => p?.dispose?.());
    playersBateriaRef.current = {};
    const vol = new Tone.Volume(10).toDestination();
    ['kick','snare','hihat','crash','tom'].forEach(t => { playersBateriaRef.current[t] = new Tone.Player('/samples/' + t + '.wav').connect(vol); });
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
    synthCierreRef.current = null;

    if (cierre.instrumento === 'bateria') {
      const vol = new Tone.Volume(10).toDestination();
      ['kick','snare','hihat','crash','tom'].forEach(t => { playersCierreRef.current[t] = new Tone.Player('/samples/' + t + '.wav').connect(vol); });
    } else {
      const osc = cierre.instrumento === 'piano' ? 'triangle' : 'sine';
      const rel = cierre.instrumento === 'cuerdas' ? 1.5 : 0.8;
      synthCierreRef.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: osc }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: rel } }).toDestination();
      synthCierreRef.current.volume.value = -5;
    }
  }, [cierre]);

  useEffect(() => {
    if (!videoUrl) return;
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.addEventListener('loadeddata', () => setVideoListo(true));
    video.addEventListener('timeupdate', () => {
      if (!video.paused) {
        puntos.forEach(p => {
          if (!puntosReproducidosRef.current.has(p.id) && video.currentTime >= p.tiempo) {
            puntosReproducidosRef.current.add(p.id);
            if (p.instrumento === 'Piano') synthPianoRef.current?.triggerAttackRelease(p.notaReal || 'C4', '8n');
            else if (p.instrumento === 'Bateria') { const pl = playersBateriaRef.current[p.nota?.toLowerCase()]; if (pl) { pl.seek(0); pl.start(); } }
            else if (p.instrumento === 'Cuerdas') synthCuerdasRef.current?.triggerAttackRelease(p.notaReal || 'C4', '2n');
            if (materialRef.current) {
              const ef = { Calido: 0, Frio: 1, Zoom: 2, Glitch: 3 };
              materialRef.current.uniforms.u_tipoEfecto.value = ef[p.nombreEfecto] ?? 0;
              materialRef.current.uniforms.u_efectoActivo.value = 1.0;
              setTimeout(() => { if (materialRef.current) materialRef.current.uniforms.u_efectoActivo.value = 0; }, p.instrumento === 'Cuerdas' ? 2000 : 500);
            }
          }
        });
        if (video.duration > 0 && video.currentTime >= video.duration - 0.5) {
          video.pause(); setTerminado(true); setReproduciendo(false); setMostrarAnimacionFinal(true);
          if (cierre?.secuencia) {
            cierre.secuencia.forEach(s => {
              setTimeout(() => {
                if (cierre.instrumento === 'bateria') { const pl = playersCierreRef.current?.kick; if (pl) { pl.seek(0); pl.start(); } }
                else synthCierreRef.current?.triggerAttackRelease(s.nota, '2n');
              }, s.tiempo * 1000);
            });
          }
          setTimeout(() => setMostrarAnimacionFinal(false), 3000);
        }
      }
    });
    video.addEventListener('play', () => { puntosReproducidosRef.current.clear(); setReproduciendo(true); });
    video.addEventListener('pause', () => setReproduciendo(false));
    videoRef.current = video;
  }, [videoUrl, puntos, cierre]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !videoListo) return;
    const video = videoRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); camera.position.z = 1;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter; texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.ShaderMaterial({
      uniforms: { u_texture: { value: texture }, u_efectoActivo: { value: 0 }, u_tipoEfecto: { value: 0 } },
      vertexShader: 'varying vec2 v_uv; void main() { v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 v_uv; uniform sampler2D u_texture; uniform float u_efectoActivo; uniform int u_tipoEfecto; void main() { vec4 color = texture2D(u_texture, v_uv); if (u_efectoActivo > 0.5) { float i = 0.6; if (u_tipoEfecto == 0) { color.r *= 1.5; color.b *= 0.5; } else if (u_tipoEfecto == 1) { color.b *= 1.5; color.r *= 0.5; } else if (u_tipoEfecto == 2) { color *= 1.3; } else if (u_tipoEfecto == 3) { float g = sin(v_uv.y * 100.0) * 0.15; color.r += g; color.b -= g; } } gl_FragColor = color; }',
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    let animacionActiva = true;
    const animate = () => { if (!animacionActiva) return; requestAnimationFrame(animate); if (video.readyState >= 2) renderer.render(scene, camera); };
    animate();
    const resize = () => { if (!canvasRef.current) return; const p = canvasRef.current.parentElement; if (p) renderer.setSize(Math.max(400, p.clientWidth - 32), Math.max(200, p.clientHeight - 32)); };
    resize(); window.addEventListener('resize', resize);
    return () => { animacionActiva = false; renderer.dispose(); window.removeEventListener('resize', resize); };
  }, [videoListo]);

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
        </div>
      </div>
      <div className="flex justify-center gap-4 py-4 border-t-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <button onClick={handlePlay} className="px-8 py-3 rounded-lg border-2 border-black font-bold text-lg shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" style={{ backgroundColor: '#00D4AA', color: '#1A3A5C' }}>
          {terminado ? 'REINICIAR' : reproduciendo ? 'PAUSA' : 'REPRODUCIR'}
        </button>
      </div>
    </div>
  );
}
