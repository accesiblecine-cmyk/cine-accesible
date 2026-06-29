import { useEffect, useCallback } from 'react';
import useAccesibilidadStore from '../store/useAccesibilidadStore';

export default function useNarrador() {
  const colores = useAccesibilidadStore((s) => s.colores);
  const modoActivo = useAccesibilidadStore((s) => s.modoActivo);

  const narradorActivo = modoActivo === 'visual';

  const narrar = useCallback((texto) => {
    if (!narradorActivo) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [narradorActivo]);

  const narrarElemento = useCallback((texto) => {
    if (!narradorActivo) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [narradorActivo]);

  const silenciar = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { narrar, narrarElemento, silenciar, narradorActivo };
}
