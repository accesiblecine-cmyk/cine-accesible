import { useState } from 'react';
import useAccesibilidadStore, { modos } from '../../store/useAccesibilidadStore';

export default function PanelAccesibilidad() {
  const [abierto, setAbierto] = useState(false);
  const store = useAccesibilidadStore();

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-bold text-2xl"
        style={{ backgroundColor: '#FFE156', color: '#000000' }}
        aria-label="Abrir panel de accesibilidad"
        title="Accesibilidad (Ctrl+A)"
      >
        Aa
      </button>

      {abierto && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setAbierto(false)}>
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div
            className="relative z-50 w-96 max-w-full h-full overflow-y-auto p-6 border-l-2 border-black shadow-[-8px_0px_0px_#000000]"
            style={{ backgroundColor: '#1A3A5C' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#FFE156]" style={{ textShadow: '2px 2px 0px #000000' }}>
                ACCESIBILIDAD
              </h2>
              <button
                onClick={() => setAbierto(false)}
                className="w-12 h-12 rounded-lg border-2 border-black bg-[#E0254F] text-[#FFF8E7] font-bold text-xl shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all"
                aria-label="Cerrar panel"
              >
                X
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[#FFE156] font-bold text-sm block mb-2">MODO DE ACCESIBILIDAD</label>
                <select
                  value={store.modoActivo}
                  onChange={(e) => store.setModo(e.target.value)}
                  className="w-full border-2 border-black rounded-lg px-4 py-3 font-bold shadow-[3px_3px_0px_#000000]"
                  style={{ backgroundColor: '#2B1B3D', color: '#FFF8E7' }}
                >
                  {Object.keys(modos).map((key) => (
                    <option key={key} value={key}>{modos[key].nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#FFE156] font-bold text-sm block mb-2">TAMANO DE TEXTO: {Math.round(store.tamanoTexto * 100)}%</label>
                <input
                  type="range" min="80" max="200" value={store.tamanoTexto * 100}
                  onChange={(e) => store.setTamanoTexto(e.target.value / 100)}
                  className="w-full accent-[#FF6B3D]"
                />
              </div>

              <div>
                <label className="text-[#FFE156] font-bold text-sm block mb-2">INTENSIDAD DE EFECTOS: {Math.round(store.intensidadEfectos * 100)}%</label>
                <input
                  type="range" min="0" max="100" value={store.intensidadEfectos * 100}
                  onChange={(e) => store.setIntensidadEfectos(e.target.value / 100)}
                  className="w-full accent-[#FF6B3D]"
                />
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { key: 'ondasSonido', label: 'ONDAS DE SONIDO', desc: 'Muestra ondas visuales al tocar' },
                  { key: 'subtitulos', label: 'SUBTITULOS', desc: 'Muestra texto del instrumento' },
                  { key: 'reducirAnimaciones', label: 'REDUCIR ANIMACIONES', desc: 'Transiciones instantaneas' },
                  { key: 'altoContraste', label: 'ALTO CONTRASTE', desc: 'Maximo contraste de colores' },
                  { key: 'escalaGrises', label: 'ESCALA DE GRISES', desc: 'Elimina todo el color' },
                  { key: 'vibracion', label: 'VIBRACION', desc: 'Vibra al tocar instrumentos' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-black cursor-pointer hover:shadow-[2px_2px_0px_#000000] transition-all"
                    style={{ backgroundColor: store[item.key] ? '#00D4AA' : '#2B1B3D' }}
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
                className="w-full py-3 rounded-lg border-2 border-black font-bold bg-[#FF4582] text-[#FFF8E7] shadow-[3px_3px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] transition-all"
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
