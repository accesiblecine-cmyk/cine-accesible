import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import * as Tone from 'tone';
import useEditorStore from '../store/useEditorStore';
import BotonAccesible from '../components/ui/BotonAccesible';

export default function Editor() {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const materialRef = useRef(null);
  const [videoCargado, setVideoCargado] = useState(false);
  const [efectoActivo, setEfectoActivo] = useState(false);
  const [instrumentoActual, setInstrumentoActual] = useState('piano');
  const intensidadEfectos = useEditorStore((s) => s.intensidadEfectos);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/sample.mp4';
    video.loop = true;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.addEventListener('loadeddata', () => {
      setVideoCargado(true);
      video.play().catch(() => {});
    });
    videoRef.current = video;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(800, 450);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const vertexShader = 'varying vec2 v_uv; void main() { v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    const fragmentShader = 'varying vec2 v_uv; uniform sampler2D u_texture; uniform float u_efectoActivo; uniform float u_intensidad; uniform int u_tipoEfecto; void main() { vec4 color = texture2D(u_texture, v_uv); if (u_efectoActivo > 0.5) { float i = u_intensidad; if (u_tipoEfecto == 0) { color.r *= (1.0 + 0.6 * i); color.b *= (1.0 - 0.5 * i); } else if (u_tipoEfecto == 1) { color.b *= (1.0 + 0.6 * i); color.r *= (1.0 - 0.5 * i); } else if (u_tipoEfecto == 2) { color *= (1.0 + 0.4 * i); } else if (u_tipoEfecto == 3) { float glitch = sin(v_uv.y * 100.0) * 0.1 * i; color.r += glitch; color.b -= glitch; } } gl_FragColor = color; }';

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: texture },
        u_efectoActivo: { value: 0.0 },
        u_intensidad: { value: 0.5 },
        u_tipoEfecto: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const animate = () => {
      requestAnimationFrame(animate);
      material.uniforms.u_efectoActivo.value = efectoActivo ? 1.0 : 0.0;
      material.uniforms.u_intensidad.value = intensidadEfectos;
      renderer.render(scene, camera);
    };
    animate();

    return () => { video.pause(); };
  }, []);

  useEffect(() => {
    if (materialRef.current) materialRef.current.uniforms.u_efectoActivo.value = efectoActivo ? 1.0 : 0.0;
  }, [efectoActivo]);

  useEffect(() => {
    if (materialRef.current) materialRef.current.uniforms.u_intensidad.value = intensidadEfectos;
  }, [intensidadEfectos]);

  const tocarPiano = useCallback(async () => {
    await Tone.start();
    const sampler = new Tone.Sampler({ urls: { C4: 'https://tonejs.github.io/audio/casio/C4.mp3' }, baseUrl: 'https://tonejs.github.io/audio/' }).toDestination();
    Tone.loaded().then(() => sampler.triggerAttackRelease('C4', '8n'));
    materialRef.current.uniforms.u_tipoEfecto.value = 0;
    setEfectoActivo(true); setTimeout(() => setEfectoActivo(false), 400);
  }, []);

  const tocarBateria = useCallback(async (tipo) => {
    await Tone.start();
    const urls = { kick: 'https://tonejs.github.io/audio/505/kick.mp3', snare: 'https://tonejs.github.io/audio/505/snare.mp3', hihat: 'https://tonejs.github.io/audio/505/hh.mp3' };
    const sampler = new Tone.Sampler({ urls: { C4: urls[tipo] || urls.kick }, baseUrl: 'https://tonejs.github.io/audio/' }).toDestination();
    Tone.loaded().then(() => sampler.triggerAttackRelease('C4', '8n'));
    let tipoEfecto = 0;
    if (tipo === 'kick') tipoEfecto = 2;
    else if (tipo === 'snare') tipoEfecto = 3;
    materialRef.current.uniforms.u_tipoEfecto.value = tipoEfecto;
    setEfectoActivo(true); setTimeout(() => setEfectoActivo(false), 400);
  }, []);

  const tocarCuerdas = useCallback(async () => {
    await Tone.start();
    const synth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
    synth.triggerAttackRelease('C4', '2n');
    materialRef.current.uniforms.u_tipoEfecto.value = 1;
    setEfectoActivo(true); setTimeout(() => setEfectoActivo(false), 800);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="px-6 py-3 border-b-2 border-black flex gap-2 items-center text-sm font-bold" style={{ backgroundColor: '#1A3A5C' }}>
        <Link to="/biblioteca" className="text-[#4DE8FF] hover:text-[#FFE156]">BIBLIOTECA</Link>
        <span className="text-[#FFF8E7]">/</span>
        <span className="text-[#FFE156]">EDITOR: {id?.toUpperCase()}</span>
      </div>

      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-[#FFE156]" style={{ textShadow: '2px 2px 0px #000000' }}>EDITOR</h1>
        <div className="flex gap-3">
          <BotonAccesible variante="secundario">GUARDAR (Ctrl+S)</BotonAccesible>
          <Link to={'/editor/' + id + '/cierre'}>
            <BotonAccesible variante="primario">TERMINAR</BotonAccesible>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          {!videoCargado && <p className="text-[#FFE156] font-bold">CARGANDO VIDEO...</p>}
          <canvas ref={canvasRef} className="rounded-lg border-2 border-black shadow-[6px_6px_0px_#000000]" width={800} height={450} />
          <div className="flex gap-4 items-center">
            <button onClick={() => videoRef.current?.play()} className="text-[#4DE8FF] hover:text-[#FFE156] text-lg font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#000000]" aria-label="Reproducir video">PLAY</button>
            <button onClick={() => videoRef.current?.pause()} className="text-[#4DE8FF] hover:text-[#FFE156] text-lg font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#000000]" aria-label="Pausar video">PAUSA</button>
          </div>
        </div>

        <aside className="w-80 p-6 flex flex-col gap-6 border-l-2 border-black overflow-y-auto" style={{ backgroundColor: '#1A3A5C' }}>
          <h2 className="text-lg font-bold text-[#FFE156]">INSTRUMENTOS</h2>

          <div className="flex gap-2">
            {['piano', 'bateria', 'cuerdas'].map((inst) => (
              <button
                key={inst}
                onClick={() => setInstrumentoActual(inst)}
                className={'px-4 py-2 font-bold border-2 border-black transition-all shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] ' + (instrumentoActual === inst ? 'bg-[#FF6B3D] text-[#FFF8E7]' : 'bg-[#2B1B3D] text-[#FFF8E7]')}
                aria-pressed={instrumentoActual === inst}
              >
                {inst.toUpperCase()}
              </button>
            ))}
          </div>

          {instrumentoActual === 'piano' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#4DE8FF] text-sm font-bold">PIANO</h3>
              <div className="flex gap-2 flex-wrap">
                {['DO', 'RE', 'MI', 'FA', 'SOL'].map((nota) => (
                  <button key={nota} onClick={tocarPiano} className="bg-[#2B1B3D] border-2 border-black hover:border-[#FFE156] text-[#FFF8E7] font-bold rounded-lg py-3 px-4 shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all" style={{ minWidth: '52px', minHeight: '52px' }} aria-label={'Piano nota ' + nota}>{nota}</button>
                ))}
              </div>
            </div>
          )}

          {instrumentoActual === 'bateria' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#4DE8FF] text-sm font-bold">BATERIA</h3>
              <div className="flex gap-3">
                {[{ nombre: 'KICK', tipo: 'kick' }, { nombre: 'SNARE', tipo: 'snare' }, { nombre: 'HH', tipo: 'hihat' }].map((pad) => (
                  <button key={pad.nombre} onClick={() => tocarBateria(pad.tipo)} className="bg-[#2B1B3D] border-2 border-black hover:border-[#FFE156] text-[#FFF8E7] font-bold rounded-full w-16 h-16 shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all" aria-label={'Bateria ' + pad.nombre}>{pad.nombre}</button>
                ))}
              </div>
            </div>
          )}

          {instrumentoActual === 'cuerdas' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#4DE8FF] text-sm font-bold">CUERDAS</h3>
              <button onClick={tocarCuerdas} className="bg-[#2B1B3D] border-2 border-black hover:border-[#FFE156] text-[#FFF8E7] font-bold rounded-lg py-4 px-6 w-full shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all" style={{ minHeight: '56px' }} aria-label="Cuerdas, sonido sostenido">TOCAR CUERDA</button>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="intensidad" className="text-[#FFE156] text-sm font-bold">INTENSIDAD: {Math.round(intensidadEfectos * 100)}%</label>
            <input id="intensidad" type="range" min="0" max="100" value={intensidadEfectos * 100} onChange={(e) => useEditorStore.getState().setIntensidadEfectos(e.target.value / 100)} className="w-full accent-[#FF6B3D]" aria-label="Intensidad de efectos" />
          </div>
        </aside>
      </div>
    </div>
  );
}
