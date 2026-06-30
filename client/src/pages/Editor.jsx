import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import * as Tone from 'tone';
import PianoVertical from '../components/editor/PianoVertical';
import LineaTiempo from '../components/editor/LineaTiempo';
import OndasSonido from '../components/editor/OndasSonido';
import SubtitulosInstrumentos from '../components/editor/SubtitulosInstrumentos';
import useAccesibilidadStore from '../store/useAccesibilidadStore';

const NOTAS_CUERDAS = [
  { nombre: 'DO', nota: 'C3' }, { nombre: 'RE', nota: 'D3' }, { nombre: 'MI', nota: 'E3' },
  { nombre: 'FA', nota: 'F3' }, { nombre: 'SOL', nota: 'G3' }, { nombre: 'LA', nota: 'A3' },
  { nombre: 'SI', nota: 'B3' }, { nombre: 'DO+', nota: 'C4' },
];

const TIPOS_PIANO = [
  { id: 'piano', nombre: 'PIANO', osc: 'triangle' },
  { id: 'organo', nombre: 'ORGANO', osc: 'square' },
  { id: 'campanas', nombre: 'CAMP', osc: 'sine' },
];

const TIPOS_CUERDAS = [
  { id: 'cuerdas', nombre: 'CUER', osc: 'sine' },
  { id: 'violin', nombre: 'VLN', osc: 'sawtooth' },
  { id: 'bajo', nombre: 'BAJO', osc: 'triangle' },
];

export default function Editor() {
  const { id } = useParams();
const [videoUrl, setVideoUrl] = useState('');
useEffect(() => {
  import('../utils/api').then(api => {
    api.obtenerVideo(id).then(v => setVideoUrl(v.url)).catch(() => setVideoUrl('/videos/sample.mp4'));
  });
}, [id]);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const materialRef = useRef(null);
  const rendererRef = useRef(null);
  const puntosReproducidosRef = useRef(new Set());
  const synthPianoRef = useRef(null);
  const synthCuerdasRef = useRef(null);
  const playersBateriaRef = useRef({});
  const audioIniciadoRef = useRef(false);
  const puntosRef = useRef([]);
  const modoGrabacionRef = useRef(true);
  const efectosActualesRef = useRef({});

  const [videoCargado, setVideoCargado] = useState(false);
  const [efectosActivos, setEfectosActivos] = useState({});
  const [instrumentoActual, setInstrumentoActual] = useState('piano');
  const [puntos, setPuntos] = useState([]);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [modoGrabacion, setModoGrabacion] = useState(true);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const [consolaExpandida, setConsolaExpandida] = useState(false);
  const [tipoPiano, setTipoPiano] = useState('piano');
  const [tipoCuerdas, setTipoCuerdas] = useState('cuerdas');
  const [bateriaCargada, setBateriaCargada] = useState(false);
  const [videoListo, setVideoListo] = useState(false);

  const [volPiano, setVolPiano] = useState(0.7);
  const [volBateria, setVolBateria] = useState(5.0);
  const [volCuerdas, setVolCuerdas] = useState(0.7);
  const [mutePiano, setMutePiano] = useState(false);
  const [muteBateria, setMuteBateria] = useState(false);
  const [muteCuerdas, setMuteCuerdas] = useState(false);

  const colores = useAccesibilidadStore((s) => s.colores);
  const intensidadEfectos = useAccesibilidadStore((s) => s.intensidadEfectos);
  const setIntensidadEfectos = useAccesibilidadStore((s) => s.setIntensidadEfectos);

  useEffect(() => { modoGrabacionRef.current = modoGrabacion; }, [modoGrabacion]);
  useEffect(() => { puntosRef.current = puntos; }, [puntos]);
  useEffect(() => { efectosActualesRef.current = efectosActivos; }, [efectosActivos]);

  const iniciarAudio = useCallback(async () => {
    if (audioIniciadoRef.current) return;
    await Tone.start();
    audioIniciadoRef.current = true;
  }, []);

  const agregarPunto = useCallback((instrumento, nota, notaReal, tipoEfecto, nombreEfecto, duracionNota) => {
    if (!modoGrabacionRef.current) return;
    const video = videoRef.current; if (!video) return;
    const tiempo = video.currentTime;
    const nuevo = { id: Date.now() + Math.random(), tiempo, instrumento, nota, notaReal, tipoEfecto, nombreEfecto, duracion: duracionNota || '8n' };
    setPuntos(prev => [...prev, nuevo].sort((a, b) => a.tiempo - b.tiempo));
  }, []);

  useEffect(() => {
    if (synthPianoRef.current) synthPianoRef.current.dispose();
    const osc = TIPOS_PIANO.find(t => t.id === tipoPiano)?.osc || 'triangle';
    synthPianoRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: osc }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
    }).toDestination();
    synthPianoRef.current.volume.value = mutePiano ? -100 : (volPiano * 20) - 20;
  }, [tipoPiano, volPiano, mutePiano]);

  useEffect(() => {
    if (synthCuerdasRef.current) synthCuerdasRef.current.dispose();
    const osc = TIPOS_CUERDAS.find(t => t.id === tipoCuerdas)?.osc || 'sine';
    synthCuerdasRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: osc }, envelope: { attack: 0.1, decay: 0.4, sustain: 0.5, release: 1.2 },
    }).toDestination();
    synthCuerdasRef.current.volume.value = muteCuerdas ? -100 : (volCuerdas * 20) - 20;
  }, [tipoCuerdas, volCuerdas, muteCuerdas]);

  useEffect(() => {
    Object.values(playersBateriaRef.current).forEach(p => p?.dispose?.());
    playersBateriaRef.current = {};
    setBateriaCargada(false);
    let cargados = 0; const total = 5;
    const samples = {
      kick: '/samples/kick.wav', snare: '/samples/snare.wav', hihat: '/samples/hihat.wav',
      crash: '/samples/crash.wav', tom: '/samples/tom.wav',
    };
    Object.entries(samples).forEach(([nombre, url]) => {
      const player = new Tone.Player({
        url, onload: () => { cargados++; if (cargados >= total) setBateriaCargada(true); },
        onerror: () => { cargados++; if (cargados >= total) setBateriaCargada(true); }
      }).toDestination();
      player.volume.value = 20;
      playersBateriaRef.current[nombre] = player;
    });
    return () => { Object.values(playersBateriaRef.current).forEach(p => p?.dispose?.()); };
  }, []);

  const ejecutarPunto = useCallback(async (punto) => {
    await iniciarAudio();
    if (punto.instrumento === 'Piano' && synthPianoRef.current) {
      synthPianoRef.current.triggerAttackRelease(punto.notaReal || 'C4', punto.duracion || '8n');
    } else if (punto.instrumento === 'Bateria') {
      const player = playersBateriaRef.current[punto.nota.toLowerCase()];
      if (player?.loaded) { player.seek(0); player.start(); }
    } else if (punto.instrumento === 'Cuerdas' && synthCuerdasRef.current) {
      synthCuerdasRef.current.triggerAttackRelease(punto.notaReal || 'C4', punto.duracion || '2n');
    }
    const dur = punto.instrumento === 'Cuerdas' ? 2000 : 500;
    setEfectosActivos(prev => {
      const next = { ...prev, [punto.id]: punto.nombreEfecto };
      setTimeout(() => { setEfectosActivos(p => { const n = { ...p }; delete n[punto.id]; return n; }); }, dur);
      return next;
    });
  }, [iniciarAudio]);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl || '/videos/sample.mp4';
    video.loop = false; video.muted = true; video.crossOrigin = 'anonymous';
    video.playsInline = true; video.preload = 'auto'; video.setAttribute('playsinline', '');
    video.addEventListener('loadeddata', () => { setVideoCargado(true); setDuracion(video.duration); setVideoListo(true); });
    video.addEventListener('timeupdate', () => {
      setTiempoActual(video.currentTime);
      if (!video.paused) {
        puntosRef.current.forEach(p => {
          if (!puntosReproducidosRef.current.has(p.id) && video.currentTime >= p.tiempo) {
            puntosReproducidosRef.current.add(p.id); ejecutarPunto(p);
          }
        });
      }
    });
    video.addEventListener('play', () => { puntosReproducidosRef.current.clear(); });
    video.addEventListener('seeked', () => { puntosReproducidosRef.current.clear(); });
    videoRef.current = video;
  }, [ejecutarPunto, videoUrl]);

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
      uniforms: { u_texture: { value: texture }, u_intensidad: { value: intensidadEfectos }, u_efectos: { value: new Float32Array(4).fill(0) } },
      vertexShader: 'varying vec2 v_uv; void main() { v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 v_uv; uniform sampler2D u_texture; uniform float u_intensidad; uniform float u_efectos[4]; void main() { vec4 color = texture2D(u_texture, v_uv); float i = u_intensidad; if (u_efectos[0] > 0.0) { float intensidad = u_efectos[0] * i; color.r *= (1.0 + 0.8 * intensidad); color.g *= (1.0 + 0.2 * intensidad); color.b *= (1.0 - 0.5 * intensidad); } if (u_efectos[1] > 0.0) { float intensidad = u_efectos[1] * i; color.b *= (1.0 + 0.8 * intensidad); color.r *= (1.0 - 0.5 * intensidad); color.g *= (1.0 - 0.2 * intensidad); } if (u_efectos[2] > 0.0) { float intensidad = u_efectos[2] * i; color.rgb *= (1.0 + 0.5 * intensidad); vec2 centro = v_uv - 0.5; float dist = length(centro); color.rgb *= (1.0 + 0.2 * intensidad * (1.0 - dist * 2.0)); } if (u_efectos[3] > 0.0) { float intensidad = u_efectos[3] * i; float glitch = sin(v_uv.y * 80.0 + u_efectos[3] * 10.0) * 0.15 * intensidad; color.r += glitch; color.b -= glitch; float lineas = sin(v_uv.y * 200.0) * 0.05 * intensidad; color.rgb += lineas; } gl_FragColor = color; }',
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    let animacionActiva = true;
    const animate = () => {
      if (!animacionActiva) return;
      requestAnimationFrame(animate);
      if (materialRef.current) {
        materialRef.current.uniforms.u_intensidad.value = intensidadEfectos;
        const arr = materialRef.current.uniforms.u_efectos.value;
        const ef = efectosActualesRef.current;
        arr[0] = Object.values(ef).includes('Calido') ? 1.0 : 0.0;
        arr[1] = Object.values(ef).includes('Frio') ? 1.0 : 0.0;
        arr[2] = Object.values(ef).includes('Zoom') ? 1.0 : 0.0;
        arr[3] = Object.values(ef).includes('Glitch') ? 1.0 : 0.0;
      }
      if (video.readyState >= 2) renderer.render(scene, camera);
    };
    animate();
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const parent = canvasRef.current.parentElement;
      if (parent) {
        const w = parent.clientWidth - 16;
        const h = parent.clientHeight - 16;
        renderer.setSize(Math.max(300, w), Math.max(150, h));
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      animacionActiva = false;
      renderer.dispose(); material.dispose(); texture.dispose();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [videoCargado]);

  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.u_intensidad.value = intensidadEfectos; }, [intensidadEfectos]);

  const irAPunto = (p) => { const v = videoRef.current; if (v) { v.currentTime = p.tiempo; setPuntoSeleccionado(p.id); } };
  const borrarPunto = (id) => { setPuntos(prev => prev.filter(p => p.id !== id)); if (puntoSeleccionado === id) setPuntoSeleccionado(null); };

  const handleNotaPiano = useCallback(async (notaObj) => {
    if (mutePiano) return; await iniciarAudio();
    if (useAccesibilidadStore.getState().vibracion) navigator.vibrate?.(30);
    if (synthPianoRef.current) synthPianoRef.current.triggerAttackRelease(notaObj.nota, '8n');
    agregarPunto('Piano', notaObj.nombre, notaObj.nota, 0, 'Calido', '8n');
  }, [mutePiano, iniciarAudio, agregarPunto]);

  const tocarBateria = useCallback(async (tipo) => {
    if (muteBateria || !bateriaCargada) return; await iniciarAudio();
    if (useAccesibilidadStore.getState().vibracion) navigator.vibrate?.(50);
    const player = playersBateriaRef.current[tipo];
    if (player?.loaded) { player.seek(0); player.start(); }
    const ef = { kick: [2, 'Zoom'], snare: [3, 'Glitch'], hihat: [0, 'Calido'], crash: [1, 'Frio'], tom: [2, 'Zoom'] };
    const [te, ne] = ef[tipo] || [0, 'Calido'];
    agregarPunto('Bateria', tipo.toUpperCase(), 'C4', te, ne, '8n');
  }, [muteBateria, bateriaCargada, iniciarAudio, agregarPunto]);

 const tocarCuerdas = useCallback(async (notaReal, nombre) => {
    if (muteCuerdas) return; await iniciarAudio();
    if (useAccesibilidadStore.getState().vibracion) navigator.vibrate?.(80);
    if (synthCuerdasRef.current) synthCuerdasRef.current.triggerAttackRelease(notaReal, '2n');
    agregarPunto('Cuerdas', nombre, notaReal, 1, 'Frio', '2n');
  }, [muteCuerdas, iniciarAudio, agregarPunto]);

  const handlePlay = async () => { const v = videoRef.current; if (!v) return; await iniciarAudio(); v.paused ? v.play().catch(() => {}) : v.pause(); };
  const handleReiniciar = () => { const v = videoRef.current; if (v) { v.currentTime = 0; v.pause(); setPuntoSeleccionado(null); puntosReproducidosRef.current.clear(); } };

  const formatoTiempo = (s) => { if (isNaN(s) || s < 0) return '0:00'; const m = Math.floor(s / 60); const se = Math.floor(s % 60); return m + ':' + (se < 10 ? '0' : '') + se; };

  useEffect(() => {
    if (instrumentoActual !== 'bateria') return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const teclas = { '1': 'kick', '2': 'snare', '3': 'hihat', '4': 'crash', '5': 'tom' };
      const tipo = teclas[e.key];
      if (tipo) { e.preventDefault(); tocarBateria(tipo); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [instrumentoActual, tocarBateria]);

  useEffect(() => {
    if (instrumentoActual !== 'cuerdas') return;
    const teclasCuerdas = { 'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3', 'k': 'C4' };
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const nota = teclasCuerdas[e.key.toLowerCase()];
      if (nota) { e.preventDefault(); tocarCuerdas(nota, nota.replace(/\d/, '')); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [instrumentoActual, tocarCuerdas]);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#2B1B3D' }}>
      <header className="flex items-center gap-2 px-3 py-2 border-b-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/biblioteca" className="text-xs font-bold hover:underline" style={{ color: '#4DE8FF' }} title="Volver a la biblioteca">BIB</Link>
        <span className="text-xs" style={{ color: '#FFF8E7' }}>/ {id?.toUpperCase()}</span>
        <div className="flex-1"></div>
        <button onClick={handleReiniciar} className="px-2 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000000] transition-all" style={{ backgroundColor: '#4DE8FF', color: '#1A3A5C' }} title="Reiniciar video">R</button>
        <button onClick={handlePlay} className="px-3 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000000] transition-all" style={{ backgroundColor: '#00D4AA', color: '#1A3A5C' }} title="Reproducir / Pausar">
          {videoRef.current && !videoRef.current.paused ? 'PAUSA' : 'PLAY'}
        </button>
        <button onClick={() => setModoGrabacion(!modoGrabacion)} className={'px-2 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000000] transition-all ' + (modoGrabacion ? 'bg-[#E0254F] text-[#FFF8E7] animate-pulse' : 'bg-[#00D4AA] text-[#1A3A5C]')} title={modoGrabacion ? 'Desactivar grabacion' : 'Activar grabacion'}>
          {modoGrabacion ? 'REC' : 'LOCK'}
        </button>
        <button onClick={() => setConsolaExpandida(!consolaExpandida)} className="px-2 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000000] transition-all" style={{ backgroundColor: consolaExpandida ? '#FFE156' : '#2B1B3D', color: consolaExpandida ? '#1A3A5C' : '#FFF8E7' }} title={consolaExpandida ? 'Ocultar lista' : 'Mostrar lista de puntos'}>
          LISTA
        </button>
        <Link to={'/editor/' + id + '/cierre'} className="px-3 py-1 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000000] transition-all" style={{ backgroundColor: '#FF6B3D', color: '#FFF8E7' }} title="Ir a la pantalla de cierre">FIN</Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-2 flex items-center justify-center" style={{ maxHeight: consolaExpandida ? '70%' : '100%', transition: 'max-height 0.3s ease' }}>
            {!videoListo && <p className="font-bold text-lg" style={{ color: '#FFE156' }}>CARGANDO VIDEO...</p>}
            <div className="relative w-full h-full">
              <canvas ref={canvasRef} className="rounded-lg border-2 border-black shadow-[4px_4px_0px_#000000]" style={{ display: videoListo ? 'block' : 'none', maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%' }} />
              {videoListo && <OndasSonido puntos={puntos} tiempoActual={tiempoActual} />}
              {videoListo && <SubtitulosInstrumentos puntos={puntos} tiempoActual={tiempoActual} />}
            </div>
          </div>
          <div className="px-3 py-2 border-t-2 border-black" style={{ backgroundColor: '#1A3A5C' }}>
            <LineaTiempo puntos={puntos} tiempoActual={tiempoActual} duracion={duracion} onClic={(t) => { if (videoRef.current) videoRef.current.currentTime = t; }} puntoSeleccionado={puntoSeleccionado} onSeleccionarPunto={(p) => setPuntoSeleccionado(p.id)} colores={colores} />
          </div>
          {consolaExpandida && (
            <div className="border-t-2 border-black overflow-y-auto" style={{ backgroundColor: '#1A3A5C', height: '25%', minHeight: '100px', transition: 'height 0.3s ease' }}>
              <div className="px-4 py-1 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: '#1A3A5C' }}>
                <h3 className="text-xs font-bold" style={{ color: '#FFE156' }}>PUNTOS ({puntos.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-bold" style={{ color: '#FFF8E7' }}>
                  <thead><tr style={{ backgroundColor: '#2B1B3D' }}><th className="py-1 px-2 text-left">#</th><th className="py-1 px-2 text-left">TIEMPO</th><th className="py-1 px-2 text-left">INST</th><th className="py-1 px-2 text-left">NOTA</th><th className="py-1 px-2 text-left">EFECTO</th><th className="py-1 px-2 text-left">ACC</th></tr></thead>
                  <tbody>
                    {puntos.length === 0 ? (
                      <tr><td colSpan="6" className="py-4 text-center text-xs" style={{ color: '#FFF8E7B3' }}>Toca los instrumentos para crear puntos</td></tr>
                    ) : (
                      puntos.map((p, i) => {
                        const colorFondo = p.instrumento === 'Piano' ? '#FF458233' : p.instrumento === 'Bateria' ? '#FF6B3D33' : '#4DE8FF33';
                        return (
                          <tr key={p.id} className="border-b border-black" style={{ backgroundColor: puntoSeleccionado === p.id ? (p.instrumento === 'Piano' ? '#FF458255' : p.instrumento === 'Bateria' ? '#FF6B3D55' : '#4DE8FF55') : colorFondo }}>
                            <td className="py-1 px-2">{i + 1}</td>
                            <td className="py-1 px-2 font-mono">{formatoTiempo(p.tiempo)}</td>
                            <td className="py-1 px-2" style={{ color: p.instrumento === 'Piano' ? '#FF4582' : p.instrumento === 'Bateria' ? '#FF6B3D' : '#4DE8FF' }}>{p.instrumento.substring(0,4)}</td>
                            <td className="py-1 px-2">{p.nota}</td>
                            <td className="py-1 px-2" style={{ color: '#00D4AA' }}>{p.nombreEfecto}</td>
                            <td className="py-1 px-2 flex gap-1">
                              <button onClick={() => irAPunto(p)} className="px-2 py-0.5 border border-black text-xs font-bold shadow-[1px_1px_0px_#000000] hover:shadow-none transition-all" style={{ backgroundColor: '#4DE8FF', color: '#1A3A5C' }} title={'Ir al segundo ' + formatoTiempo(p.tiempo)}>IR</button>
                              <button onClick={() => borrarPunto(p.id)} className="px-2 py-0.5 border border-black text-xs font-bold shadow-[1px_1px_0px_#000000] hover:shadow-none transition-all" style={{ backgroundColor: '#E0254F', color: '#FFF8E7' }} title="Eliminar punto">X</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="border-l-2 border-black flex flex-col overflow-y-auto" style={{ backgroundColor: '#1A3A5C', width: '180px', minWidth: '180px' }}>
          <div className="flex flex-col border-b-2 border-black">
            {[
              { id: 'piano', label: 'PIANO', color: '#FF4582' },
              { id: 'bateria', label: 'BATER', color: '#FF6B3D' },
              { id: 'cuerdas', label: 'CUERD', color: '#4DE8FF' },
            ].map(inst => (
              <button key={inst.id} onClick={() => setInstrumentoActual(inst.id)}
                className={'py-2 font-bold text-xs border-b border-black transition-all ' + (instrumentoActual === inst.id ? 'text-[#FFF8E7]' : '')}
                style={{ backgroundColor: instrumentoActual === inst.id ? inst.color : '#1A3A5C', color: instrumentoActual === inst.id ? '#FFF8E7' : '#FFF8E7' }}
                title={'Cambiar a ' + inst.label}
              >{inst.label}</button>
            ))}
          </div>
          <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
            {instrumentoActual === 'piano' && (
              <>
                <div className="flex gap-1">
                  {TIPOS_PIANO.map(t => (
                    <button key={t.id} onClick={() => setTipoPiano(t.id)} className={'flex-1 py-1 text-xs font-bold border-2 border-black rounded transition-all ' + (tipoPiano === t.id ? 'bg-[#FFE156] text-[#1A3A5C]' : '')} style={{ backgroundColor: tipoPiano !== t.id ? '#2B1B3D' : undefined, color: tipoPiano !== t.id ? '#FFF8E7' : undefined }} title={'Sonido ' + t.nombre}>{t.nombre}</button>
                  ))}
                </div>
                <PianoVertical onNotaTocada={handleNotaPiano} colores={colores} volumen={volPiano} activo={instrumentoActual === 'piano'} />
                <div className="flex items-center gap-1">
                  <button onClick={() => setMutePiano(!mutePiano)} className={'px-2 py-1 border-2 border-black text-xs font-bold ' + (mutePiano ? 'bg-[#E0254F] text-[#FFF8E7]' : 'bg-[#00D4AA] text-[#1A3A5C]')} title={mutePiano ? 'Activar sonido' : 'Silenciar'}>{mutePiano ? 'M' : 'S'}</button>
                  <input type="range" min="0" max="100" value={volPiano * 100} onChange={e => setVolPiano(e.target.value / 100)} className="flex-1 accent-[#FF6B3D] w-16" title={'Volumen: ' + Math.round(volPiano * 100) + '%'} />
                  <span className="text-xs font-bold" style={{ color: '#FFE156' }}>{Math.round(volPiano * 100)}%</span>
                </div>
              </>
            )}
            {instrumentoActual === 'bateria' && (
              <>
                {!bateriaCargada && <p className="text-xs font-bold" style={{ color: '#FFE156' }}>CARGANDO...</p>}
                <div className="flex flex-col gap-2">
                  {[{ n: 'KICK (1)', t: 'kick', c: '#FF6B3D' }, { n: 'SNARE (2)', t: 'snare', c: '#FFE156' }, { n: 'HH (3)', t: 'hihat', c: '#4DE8FF' }, { n: 'CRASH (4)', t: 'crash', c: '#FF4582' }, { n: 'TOM (5)', t: 'tom', c: '#00D4AA' }].map(p => (
                    <button key={p.n} onClick={() => tocarBateria(p.t)} className="font-bold rounded-lg py-3 border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm active:scale-95 w-full" style={{ backgroundColor: p.c, color: '#1A3A5C' }} title={'Tocar ' + p.n.split(' ')[0] + ' (Tecla ' + p.t.charAt(0).toUpperCase() + ')'}>{p.n}</button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMuteBateria(!muteBateria)} className={'px-2 py-1 border-2 border-black text-xs font-bold ' + (muteBateria ? 'bg-[#E0254F] text-[#FFF8E7]' : 'bg-[#00D4AA] text-[#1A3A5C]')} title={muteBateria ? 'Activar sonido' : 'Silenciar'}>{muteBateria ? 'M' : 'S'}</button>
                  <input type="range" min="0" max="500" value={volBateria * 100} onChange={e => setVolBateria(e.target.value / 100)} className="flex-1 accent-[#FF6B3D] w-16" title={'Volumen: ' + Math.round(volBateria * 100) + '%'} />
                  <span className="text-xs font-bold" style={{ color: '#FFE156' }}>{Math.round(volBateria * 100)}%</span>
                </div>
              </>
            )}
            {instrumentoActual === 'cuerdas' && (
              <>
                <div className="flex gap-1">
                  {TIPOS_CUERDAS.map(t => (
                    <button key={t.id} onClick={() => setTipoCuerdas(t.id)} className={'flex-1 py-1 text-xs font-bold border-2 border-black rounded transition-all ' + (tipoCuerdas === t.id ? 'bg-[#FFE156] text-[#1A3A5C]' : '')} style={{ backgroundColor: tipoCuerdas !== t.id ? '#2B1B3D' : undefined, color: tipoCuerdas !== t.id ? '#FFF8E7' : undefined }} title={'Sonido ' + t.nombre}>{t.nombre}</button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {NOTAS_CUERDAS.map((n, i) => {
                    const teclasCuerdas = ['A','S','D','F','G','H','J','K'];
                    return (
                      <button key={n.nota} onClick={() => tocarCuerdas(n.nota, n.nombre)}
                        className="font-bold rounded-lg py-2 border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all active:scale-95 text-sm w-full relative"
                        style={{ backgroundColor: '#4DE8FF', color: '#1A3A5C' }}
                        title={'Tocar ' + n.nombre + ' (Tecla ' + teclasCuerdas[i] + ')'}>
                        {n.nombre}
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs opacity-50" style={{ fontSize: '0.6rem' }}>{teclasCuerdas[i]}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMuteCuerdas(!muteCuerdas)} className={'px-2 py-1 border-2 border-black text-xs font-bold ' + (muteCuerdas ? 'bg-[#E0254F] text-[#FFF8E7]' : 'bg-[#00D4AA] text-[#1A3A5C]')} title={muteCuerdas ? 'Activar sonido' : 'Silenciar'}>{muteCuerdas ? 'M' : 'S'}</button>
                  <input type="range" min="0" max="100" value={volCuerdas * 100} onChange={e => setVolCuerdas(e.target.value / 100)} className="flex-1 accent-[#FF6B3D] w-16" title={'Volumen: ' + Math.round(volCuerdas * 100) + '%'} />
                  <span className="text-xs font-bold" style={{ color: '#FFE156' }}>{Math.round(volCuerdas * 100)}%</span>
                </div>
              </>
            )}
            <div className="border-t border-black pt-3 flex flex-col gap-1">
              <label className="text-xs font-bold" style={{ color: '#FFE156' }}>FX: {Math.round(intensidadEfectos * 100)}%</label>
              <input type="range" min="0" max="100" value={intensidadEfectos * 100} onChange={e => setIntensidadEfectos(e.target.value / 100)} className="w-full accent-[#FF6B3D]" title={'Intensidad de efectos: ' + Math.round(intensidadEfectos * 100) + '%'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











