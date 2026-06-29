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

    return () => {
      video.pause();
    };
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_efectoActivo.value = efectoActivo ? 1.0 : 0.0;
    }
  }, [efectoActivo]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_intensidad.value = intensidadEfectos;
    }
  }, [intensidadEfectos]);

  const tocarPiano = useCallback(async () => {
    await Tone.start();
    const sampler = new Tone.Sampler({
      urls: { C4: 'https://tonejs.github.io/audio/casio/C4.mp3' },
      baseUrl: 'https://tonejs.github.io/audio/',
    }).toDestination();
    Tone.loaded().then(() => sampler.triggerAttackRelease('C4', '8n'));
    materialRef.current.uniforms.u_tipoEfecto.value = 0;
    setEfectoActivo(true);
    setTimeout(() => setEfectoActivo(false), 400);
  }, []);

  const tocarBateria = useCallback(async (tipo) => {
    await Tone.start();
    const urls = {
      kick: 'https://tonejs.github.io/audio/505/kick.mp3',
      snare: 'https://tonejs.github.io/audio/505/snare.mp3',
      hihat: 'https://tonejs.github.io/audio/505/hh.mp3',
    };
    const sampler = new Tone.Sampler({
      urls: { C4: urls[tipo] || urls.kick },
      baseUrl: 'https://tonejs.github.io/audio/',
    }).toDestination();
    Tone.loaded().then(() => sampler.triggerAttackRelease('C4', '8n'));
    let tipoEfecto = 0;
    if (tipo === 'kick') tipoEfecto = 2;
    else if (tipo === 'snare') tipoEfecto = 3;
    materialRef.current.uniforms.u_tipoEfecto.value = tipoEfecto;
    setEfectoActivo(true);
    setTimeout(() => setEfectoActivo(false), 400);
  }, []);

  const tocarCuerdas = useCallback(async () => {
    await Tone.start();
    const synth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
    synth.triggerAttackRelease('C4', '2n');
    materialRef.current.uniforms.u_tipoEfecto.value = 1;
    setEfectoActivo(true);
    setTimeout(() => setEfectoActivo(false), 800);
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F0F0F0] flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#404040]">
        <div className="flex gap-4 items-center">
          <Link to="/biblioteca" className="text-[#B0B0B0] hover:text-[#F0F0F0]">Volver</Link>
          <h1 className="text-xl font-bold text-[#6BB5FF]">Editor</h1>
        </div>
        <div className="flex gap-3">
          <BotonAccesible variante="secundario">Guardar</BotonAccesible>
          <Link to={'/editor/' + id + '/cierre'}>
            <BotonAccesible variante="primario">Terminar</BotonAccesible>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          {!videoCargado && (
            <p className="text-[#B0B0B0]">Cargando video...</p>
          )}
          <canvas
            ref={canvasRef}
            className="rounded-lg border border-[#404040]"
            width={800}
            height={450}
          />
          <div className="flex gap-4 items-center">
            <button
              onClick={() => videoRef.current?.play()}
              className="text-[#6BB5FF] hover:text-[#5AA4EE] text-lg py-2 px-4"
              aria-label="Reproducir video"
            >
              Play
            </button>
            <button
              onClick={() => videoRef.current?.pause()}
              className="text-[#6BB5FF] hover:text-[#5AA4EE] text-lg py-2 px-4"
              aria-label="Pausar video"
            >
              Pausa
            </button>
          </div>
        </div>

        <aside className="w-80 bg-[#252525] p-6 flex flex-col gap-6 border-l border-[#404040] overflow-y-auto">
          <h2 className="text-lg font-bold">Instrumentos</h2>

          <div className="flex gap-2">
            {['piano', 'bateria', 'cuerdas'].map((inst) => (
              <button
                key={inst}
                onClick={() => setInstrumentoActual(inst)}
                className={
                  'px-4 py-2 rounded-lg font-medium transition-colors ' +
                  (instrumentoActual === inst
                    ? 'bg-[#6BB5FF] text-[#1A1A1A]'
                    : 'bg-[#1A1A1A] text-[#B0B0B0] border border-[#404040] hover:border-[#B0B0B0]')
                }
                aria-pressed={instrumentoActual === inst}
              >
                {inst.charAt(0).toUpperCase() + inst.slice(1)}
              </button>
            ))}
          </div>

          {instrumentoActual === 'piano' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#B0B0B0] text-sm">Piano</h3>
              <div className="flex gap-2 flex-wrap">
                {['Do', 'Re', 'Mi', 'Fa', 'Sol'].map((nota) => (
                  <button
                    key={nota}
                    onClick={tocarPiano}
                    className="bg-[#1A1A1A] border border-[#404040] hover:border-[#6BB5FF] text-[#F0F0F0] rounded-lg py-3 px-4 focus:outline focus:outline-2 focus:outline-[#FFB347]"
                    style={{ minWidth: '52px', minHeight: '52px' }}
                    aria-label={'Piano nota ' + nota}
                  >
                    {nota}
                  </button>
                ))}
              </div>
            </div>
          )}

          {instrumentoActual === 'bateria' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#B0B0B0] text-sm">Bateria</h3>
              <div className="flex gap-3">
                {[
                  { nombre: 'Kick', tipo: 'kick', label: 'Bombo' },
                  { nombre: 'Snare', tipo: 'snare', label: 'Caja' },
                  { nombre: 'Hi-hat', tipo: 'hihat', label: 'Platillo' },
                ].map((pad) => (
                  <button
                    key={pad.nombre}
                    onClick={() => tocarBateria(pad.tipo)}
                    className="bg-[#1A1A1A] border border-[#404040] hover:border-[#6BB5FF] text-[#F0F0F0] rounded-full w-16 h-16 flex items-center justify-center text-sm font-bold focus:outline focus:outline-2 focus:outline-[#FFB347]"
                    aria-label={'Bateria ' + pad.label}
                  >
                    {pad.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {instrumentoActual === 'cuerdas' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[#B0B0B0] text-sm">Cuerdas</h3>
              <button
                onClick={tocarCuerdas}
                className="bg-[#1A1A1A] border border-[#404040] hover:border-[#6BB5FF] text-[#F0F0F0] rounded-lg py-4 px-6 w-full focus:outline focus:outline-2 focus:outline-[#FFB347]"
                style={{ minHeight: '56px' }}
                aria-label="Cuerdas, sonido sostenido"
              >
                Tocar cuerda
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="intensidad" className="text-[#B0B0B0] text-sm">
              Intensidad de efectos
            </label>
            <input
              id="intensidad"
              type="range"
              min="0"
              max="100"
              value={intensidadEfectos * 100}
              onChange={(e) => useEditorStore.getState().setIntensidadEfectos(e.target.value / 100)}
              className="w-full accent-[#6BB5FF]"
              aria-label="Intensidad de efectos"
            />
            <span className="text-xs text-[#B0B0B0]">{Math.round(intensidadEfectos * 100)}%</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
