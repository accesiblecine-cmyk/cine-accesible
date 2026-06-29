import { create } from 'zustand';

const useEditorStore = create((set) => ({
  timestampVideo: 0,
  setTimestampVideo: (ts) => set({ timestampVideo: ts }),

  intensidadEfectos: 0.5,
  setIntensidadEfectos: (val) => set({ intensidadEfectos: val }),

  instrumentoActivo: null,
  setInstrumentoActivo: (inst) => set({ instrumentoActivo: inst }),

  ajustesAccesibilidad: {
    modoOscuro: true,
    tamanoUI: 1.2,
    mostrarOndas: true,
    subtitulos: true,
    reducirAnimaciones: false,
    altoContraste: false,
  },
  setAjustesAccesibilidad: (ajustes) => set({ ajustesAccesibilidad: ajustes }),
}));

export default useEditorStore;
