import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const NOTAS = [
  { nombre: 'DO', nota: 'C4', tipo: 'blanca' },
  { nombre: 'DO#', nota: 'C#4', tipo: 'negra' },
  { nombre: 'RE', nota: 'D4', tipo: 'blanca' },
  { nombre: 'RE#', nota: 'D#4', tipo: 'negra' },
  { nombre: 'MI', nota: 'E4', tipo: 'blanca' },
  { nombre: 'FA', nota: 'F4', tipo: 'blanca' },
  { nombre: 'FA#', nota: 'F#4', tipo: 'negra' },
  { nombre: 'SOL', nota: 'G4', tipo: 'blanca' },
  { nombre: 'SOL#', nota: 'G#4', tipo: 'negra' },
  { nombre: 'LA', nota: 'A5', tipo: 'blanca' },
  { nombre: 'LA#', nota: 'A#5', tipo: 'negra' },
  { nombre: 'SI', nota: 'B5', tipo: 'blanca' },
];

export default function PianoVisual({ onNotaTocada, colores, volumen = 0.7 }) {
  const [teclaActiva, setTeclaActiva] = useState(null);
  const samplerRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 1 },
    }).toDestination();
    synthRef.current.volume.value = -10;

    return () => {
      if (synthRef.current) synthRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = (volumen * 20) - 20;
    }
  }, [volumen]);

  const tocarNota = useCallback(async (notaObj) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(notaObj.nota, '8n');
    }
    setTeclaActiva(notaObj.nombre);
    setTimeout(() => setTeclaActiva(null), 200);
    if (onNotaTocada) onNotaTocada(notaObj);
  }, [onNotaTocada]);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold" style={{ color: colores.accent5 }}>PIANO</h3>
      <div className="relative flex" style={{ height: '160px' }}>
        {NOTAS.filter(n => n.tipo === 'blanca').map((nota, idx) => {
          const estaActiva = teclaActiva === nota.nombre;
          const anchoBlanca = (100 / 7) + '%';
          return (
            <button
              key={nota.nombre}
              onClick={() => tocarNota(nota)}
              className="absolute bottom-0 border-2 border-black rounded-b-lg transition-all duration-75"
              style={{
                left: (idx * (100 / 7)) + '%',
                width: anchoBlanca,
                height: '100%',
                backgroundColor: estaActiva ? colores.accent3 : '#FFFFFF',
                zIndex: 1,
                transform: estaActiva ? 'scaleY(0.97)' : 'scaleY(1)',
                boxShadow: estaActiva ? 'none' : '3px 3px 0px #000000',
              }}
              aria-label={'Piano nota ' + nota.nombre}
            >
              <span className="absolute bottom-2 w-full text-center text-xs font-bold" style={{ color: '#1A3A5C' }}>
                {nota.nombre}
              </span>
            </button>
          );
        })}

        {NOTAS.filter(n => n.tipo === 'negra').map((nota, idxNegra) => {
          const estaActiva = teclaActiva === nota.nombre;
          const posicionesNegras = [0.65, 1.65, 3.65, 4.65, 5.65];
          return (
            <button
              key={nota.nombre}
              onClick={() => tocarNota(nota)}
              className="absolute top-0 border-2 border-black rounded-b-lg transition-all duration-75"
              style={{
                left: (posicionesNegras[idxNegra] * (100 / 7)) + '%',
                width: (55 / 7) + '%',
                height: '60%',
                backgroundColor: estaActiva ? colores.accent4 : '#000000',
                zIndex: 2,
                transform: estaActiva ? 'scaleY(0.97)' : 'scaleY(1)',
                boxShadow: estaActiva ? 'none' : '3px 3px 0px #000000',
              }}
              aria-label={'Piano nota ' + nota.nombre}
            />
          );
        })}
      </div>
    </div>
  );
}
