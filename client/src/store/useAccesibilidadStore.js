import { create } from 'zustand';

const modos = {
  normal: {
    nombre: 'Normal',
    ondasSonido: true,
    subtitulos: true,
    reducirAnimaciones: false,
    altoContraste: false,
    escalaGrises: false,
    vibracion: false,
    tamanoTexto: 1.2,
    intensidadEfectos: 0.5,
  },
  visual: {
    nombre: 'Discapacidad visual',
    ondasSonido: false,
    subtitulos: true,
    reducirAnimaciones: true,
    altoContraste: true,
    escalaGrises: false,
    vibracion: true,
    tamanoTexto: 1.8,
    intensidadEfectos: 0.3,
  },
  auditivo: {
    nombre: 'Discapacidad auditiva',
    ondasSonido: true,
    subtitulos: true,
    reducirAnimaciones: false,
    altoContraste: false,
    escalaGrises: false,
    vibracion: true,
    tamanoTexto: 1.2,
    intensidadEfectos: 0.7,
  },
  calma: {
    nombre: 'Hipersensible (calma)',
    ondasSonido: false,
    subtitulos: false,
    reducirAnimaciones: true,
    altoContraste: false,
    escalaGrises: true,
    vibracion: false,
    tamanoTexto: 1.0,
    intensidadEfectos: 0.1,
  },
  intenso: {
    nombre: 'Hiposensible (intenso)',
    ondasSonido: true,
    subtitulos: true,
    reducirAnimaciones: false,
    altoContraste: true,
    escalaGrises: false,
    vibracion: true,
    tamanoTexto: 1.4,
    intensidadEfectos: 1.0,
  },
};

function cargarDesdeStorage() {
  try {
    const guardado = localStorage.getItem('cine-accesible-config');
    if (guardado) {
      const data = JSON.parse(guardado);
      return {
        modoActivo: data.modoActivo || 'normal',
        ondasSonido: data.ondasSonido !== undefined ? data.ondasSonido : true,
        subtitulos: data.subtitulos !== undefined ? data.subtitulos : true,
        reducirAnimaciones: data.reducirAnimaciones || false,
        altoContraste: data.altoContraste || false,
        escalaGrises: data.escalaGrises || false,
        vibracion: data.vibracion || false,
        tamanoTexto: data.tamanoTexto || 1.2,
        intensidadEfectos: data.intensidadEfectos !== undefined ? data.intensidadEfectos : 0.5,
      };
    }
  } catch (e) {}
  return {
    modoActivo: 'normal',
    ondasSonido: true,
    subtitulos: true,
    reducirAnimaciones: false,
    altoContraste: false,
    escalaGrises: false,
    vibracion: false,
    tamanoTexto: 1.2,
    intensidadEfectos: 0.5,
  };
}

function guardarEnStorage(state) {
  try {
    localStorage.setItem('cine-accesible-config', JSON.stringify({
      modoActivo: state.modoActivo,
      ondasSonido: state.ondasSonido,
      subtitulos: state.subtitulos,
      reducirAnimaciones: state.reducirAnimaciones,
      altoContraste: state.altoContraste,
      escalaGrises: state.escalaGrises,
      vibracion: state.vibracion,
      tamanoTexto: state.tamanoTexto,
      intensidadEfectos: state.intensidadEfectos,
    }));
  } catch (e) {}
}

const estadoInicial = cargarDesdeStorage();

const useAccesibilidadStore = create((set) => ({
  ...estadoInicial,

  setModo: (modo) => set((state) => {
    const config = modos[modo] || modos.normal;
    const nuevo = {
      modoActivo: modo,
      ondasSonido: config.ondasSonido,
      subtitulos: config.subtitulos,
      reducirAnimaciones: config.reducirAnimaciones,
      altoContraste: config.altoContraste,
      escalaGrises: config.escalaGrises,
      vibracion: config.vibracion,
      tamanoTexto: config.tamanoTexto,
      intensidadEfectos: config.intensidadEfectos,
    };
    guardarEnStorage({ ...state, ...nuevo });
    return nuevo;
  }),

  setTamanoTexto: (val) => set((state) => { guardarEnStorage({ ...state, tamanoTexto: val }); return { tamanoTexto: val }; }),
  setOndasSonido: (val) => set((state) => { guardarEnStorage({ ...state, ondasSonido: val }); return { ondasSonido: val }; }),
  setSubtitulos: (val) => set((state) => { guardarEnStorage({ ...state, subtitulos: val }); return { subtitulos: val }; }),
  setReducirAnimaciones: (val) => set((state) => { guardarEnStorage({ ...state, reducirAnimaciones: val }); return { reducirAnimaciones: val }; }),
  setAltoContraste: (val) => set((state) => { guardarEnStorage({ ...state, altoContraste: val }); return { altoContraste: val }; }),
  setEscalaGrises: (val) => set((state) => { guardarEnStorage({ ...state, escalaGrises: val }); return { escalaGrises: val }; }),
  setVibracion: (val) => set((state) => { guardarEnStorage({ ...state, vibracion: val }); return { vibracion: val }; }),
  setIntensidadEfectos: (val) => set((state) => { guardarEnStorage({ ...state, intensidadEfectos: val }); return { intensidadEfectos: val }; }),
}));

export default useAccesibilidadStore;
export { modos };
