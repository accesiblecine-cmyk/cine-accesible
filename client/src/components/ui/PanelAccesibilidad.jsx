import { useState, useEffect } from 'react';
import useAccesibilidadStore, { modos } from '../../store/useAccesibilidadStore';

export default function PanelAccesibilidad() {
  const [abierto, setAbierto] = useState(false);
  const [animando, setAnimando] = useState(false);
  const store = useAccesibilidadStore();

  useEffect(() => {
    if (abierto) {
      setAnimando(true);
    } else {
      const timer = setTimeout(() => setAnimando(false), 300);
      return () => clearTimeout(timer);
    }
  }, [abierto]);

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border-2 border-black font-bold text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
        style={{
          backgroundColor: '#FFE156',
          color: '#000000',
          boxShadow: abierto ? '1px 1px 0px #000000' : '4px 4px 0px #000000',
          transform: abierto ? 'scale(0.9)' : 'scale(1)',
        }}
        aria-label="Abrir panel de accesibilidad"
        title="Accesibilidad"
      >
        <span className="transition-transform duration-300" style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          {abierto ? 'X' : 'Aa'}
        </span>
      </button>

      {(abierto || animando) && (
        <div
          className="fixed inset-0 z-40 flex justify-end transition-all duration-300"
          style={{ opacity: abierto ? 1 : 0 }}
          onClick={() => setAbierto(false)}
        >
          <div
            className="fixed inset-0 transition-all duration-300"
            style={{ backgroundColor: 'rgba(0,0,0,' + (abierto ? 0.6 : 0) + ')' }}
          ></div>
          <div
            className="relative z-50 w-96 max-w-full h-full overflow-y-auto p-6 border-l-2 border-black transition-all duration-300 ease-out"
            style={{
              backgroundColor: '#1A3A5C',
              boxShadow: abierto ? '-8px 0px 0px #000000' : '0px 0px 0px #000000',
              transform: abierto ? 'translateX(0)' : 'translateX(100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-bold text-[#FFE156] transition-all duration-300"
                style={{
                  textShadow: '2px 2px 0px #000000',
                  transform: abierto ? 'translateY(0)' : 'translateY(-20px)',
                  opacity: abierto ? 1 : 0,
                  transitionDelay: '0.1s',
                }}
              >
                ACCESIBILIDAD
              </h2>
              <button
                onClick={() => setAbierto(false)}
                className="w-12 h-12 rounded-lg border-2 border-black bg-[#E0254F] text-[#FFF8E7] font-bold text-xl transition-all duration-200 hover:scale-110 active:scale-90 hover:shadow-[1px_1px_0px_#000000]"
                style={{ boxShadow: '3px 3px 0px #000000' }}
                aria-label="Cerrar panel"
              >
                X
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { el: (
                  <div>
                    <label className="text-[#FFE156] font-bold text-sm block mb-2">MODO DE ACCESIBILIDAD</label>
                    <select
                      value={store.modoActivo}
                      onChange={(e) => store.setModo(e.target.value)}
                      className="w-full border-2 border-black rounded-lg px-4 py-3 font-bold transition-all duration-200 hover:shadow-[1px_1px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px]"
                      style={{ backgroundColor: '#2B1B3D', color: '#FFF8E7', boxShadow: '3px 3px 0px #000000' }}
                    >
                      {Object.keys(modos).map((key) => (
                        <option key={key} value={key}>{modos[key].nombre}</option>
                      ))}
                    </select>
                  </div>
                ), delay: '0.1s' },
                { el: (
                  <div>
                    <label className="text-[#FFE156] font-bold text-sm block mb-2">TAMANO DE TEXTO: {Math.round(store.tamanoTexto * 100)}%</label>
                    <input
                      type="range" min="80" max="200" value={store.tamanoTexto * 100}
                      onChange={(e) => store.setTamanoTexto(e.target.value / 100)}
                      className="w-full accent-[#FF6B3D]"
                    />
                  </div>
                ), delay: '0.15s' },
                { el: (
                  <div>
                    <label className="text-[#FFE156] font-bold text-sm block mb-2">INTENSIDAD DE EFECTOS: {Math.round(store.intensidadEfectos * 100)}%</label>
                    <input
                      type="range" min="0" max="100" value={store.intensidadEfectos * 100}
                      onChange={(e) => store.setIntensidadEfectos(e.target.value / 100)}
                      className="w-full accent-[#FF6B3D]"
                    />
                  </div>
                ), delay: '0.2s' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="transition-all duration-300"
                  style={{
                    transform: abierto ? 'translateX(0)' : 'translateX(40px)',
                    opacity: abierto ? 1 : 0,
                    transitionDelay: item.delay,
                  }}
                >
                  {item.el}
                </div>
              ))}

              <div className="flex flex-col gap-3">
                {[
                  { key: 'ondasSonido', label: 'ONDAS DE SONIDO', desc: 'Circulos visuales al tocar' },
                  { key: 'subtitulos', label: 'SUBTITULOS', desc: 'Texto del instrumento al tocar' },
                  { key: 'reducirAnimaciones', label: 'REDUCIR ANIMACIONES', desc: 'Transiciones instantaneas' },
                  { key: 'altoContraste', label: 'ALTO CONTRASTE', desc: 'Maximo contraste de colores' },
                  { key: 'escalaGrises', label: 'ESCALA DE GRISES', desc: 'Elimina todo el color' },
                  { key: 'vibracion', label: 'VIBRACION', desc: 'Vibra al tocar instrumentos' },
                ].map((item, i) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-black cursor-pointer transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{
                      backgroundColor: store[item.key] ? '#00D4AA' : '#2B1B3D',
                      boxShadow: store[item.key] ? '2px 2px 0px #000000' : '3px 3px 0px #000000',
                      transform: abierto ? 'translateX(0)' : 'translateX(40px)',
                      opacity: abierto ? 1 : 0,
                      transitionDelay: (0.25 + i * 0.05) + 's',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={store[item.key]}
                      onChange={(e) => store['set' + item.key.charAt(0).toUpperCase() + item.key.slice(1)](e.target.checked)}
                      className="accent-[#FFE156] w-5 h-5"
                    />
                    <div>
                      <span className="font-bold text-sm" style={{ color: store[item.key] ? '#1A3A5C' : '#FFF8E7' }}>
                        {item.label}
                      </span>
                      <p className="text-xs" style={{ color: store[item.key] ? '#1A3A5C' : '#FFF8E7B3' }}>
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={() => {
                  store.setModo('normal');
                  store.setTamanoTexto(1.2);
                  store.setOndasSonido(true);
                  store.setSubtitulos(true);
                  store.setReducirAnimaciones(false);
                  store.setAltoContraste(false);
                  store.setEscalaGrises(false);
                  store.setVibracion(false);
                  store.setIntensidadEfectos(0.5);
                }}
                className="w-full py-3 rounded-lg border-2 border-black font-bold bg-[#FF4582] text-[#FFF8E7] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                style={{
                  boxShadow: '3px 3px 0px #000000',
                  transform: abierto ? 'translateY(0)' : 'translateY(20px)',
                  opacity: abierto ? 1 : 0,
                  transitionDelay: '0.6s',
                }}
              >
                RESTABLECER VALORES
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
