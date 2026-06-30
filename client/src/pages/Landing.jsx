import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';
import { estaAutenticado } from '../utils/api';

export default function Landing() {
  const autenticado = estaAutenticado();

  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 gap-12">
      <section className="text-center max-w-2xl">
        <h2 className="text-6xl font-bold mb-6 text-[#FFE156]" style={{ textShadow: '4px 4px 0px #000000' }}>
          TOCA, MIRA, CREA.
        </h2>
        <p className="text-xl text-[#FFF8E7] mb-8 leading-relaxed font-bold">
          Tu sonido transforma la pelicula. Una experiencia audiovisual interactiva disenada para todas las personas.
        </p>
        {autenticado ? (
          <Link to="/biblioteca">
            <BotonAccesible variante="primario">IR A LA BIBLIOTECA</BotonAccesible>
          </Link>
        ) : (
          <Link to="/registro">
            <BotonAccesible variante="primario">COMENZAR EXPERIENCIA</BotonAccesible>
          </Link>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-16">
        <div className="p-8 rounded-lg text-center border-2 border-black shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <p className="text-5xl mb-4 font-bold text-[#FF4582]" style={{ textShadow: '3px 3px 0px #000000' }} aria-hidden="true">1</p>
          <h3 className="text-xl font-bold mb-2 text-[#FFE156]">ELIGE UNA PELICULA</h3>
          <p className="text-[#FFF8E7] font-bold">Selecciona de nuestra biblioteca o sube el tuyo.</p>
        </div>
        <div className="p-8 rounded-lg text-center border-2 border-black shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <p className="text-5xl mb-4 font-bold text-[#4DE8FF]" style={{ textShadow: '3px 3px 0px #000000' }} aria-hidden="true">2</p>
          <h3 className="text-xl font-bold mb-2 text-[#FFE156]">TOCA INSTRUMENTOS</h3>
          <p className="text-[#FFF8E7] font-bold">Mira como el video se transforma con tu sonido.</p>
        </div>
        <div className="p-8 rounded-lg text-center border-2 border-black shadow-[6px_6px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
          <p className="text-5xl mb-4 font-bold text-[#00D4AA]" style={{ textShadow: '3px 3px 0px #000000' }} aria-hidden="true">3</p>
          <h3 className="text-xl font-bold mb-2 text-[#FFE156]">DALE TU FINAL</h3>
          <p className="text-[#FFF8E7] font-bold">Tu decides como cierra. Guarda tu creacion.</p>
        </div>
      </section>
    </div>
  );
}
