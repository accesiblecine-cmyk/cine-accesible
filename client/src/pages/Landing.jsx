import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';
import { estaAutenticado } from '../utils/api';
import useAccesibilidadStore from '../store/useAccesibilidadStore';

export default function Landing() {
  const autenticado = estaAutenticado();
  const colores = useAccesibilidadStore((s) => s.colores);

  const tarjetaStyle = { backgroundColor: colores.surface, border: '2px solid #000000', boxShadow: '6px 6px 0px #000000' };

  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 gap-12">
      <section className="text-center max-w-2xl">
        <h2 className="text-6xl font-bold mb-6" style={{ color: colores.accent4, textShadow: '4px 4px 0px #000000' }}>
          TOCA, MIRA, CREA.
        </h2>
        <p className="text-xl mb-8 leading-relaxed font-bold" style={{ color: colores.text }}>
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
        <div className="p-8 rounded-lg text-center" style={tarjetaStyle}>
          <p className="text-5xl mb-4 font-bold" style={{ color: colores.accent3, textShadow: '3px 3px 0px #000000' }} aria-hidden="true">1</p>
          <h3 className="text-xl font-bold mb-2" style={{ color: colores.accent4 }}>ELIGE UNA PELICULA</h3>
          <p className="font-bold" style={{ color: colores.text }}>Selecciona de nuestra biblioteca o sube el tuyo.</p>
        </div>
        <div className="p-8 rounded-lg text-center" style={tarjetaStyle}>
          <p className="text-5xl mb-4 font-bold" style={{ color: colores.accent5, textShadow: '3px 3px 0px #000000' }} aria-hidden="true">2</p>
          <h3 className="text-xl font-bold mb-2" style={{ color: colores.accent4 }}>TOCA INSTRUMENTOS</h3>
          <p className="font-bold" style={{ color: colores.text }}>Mira como el video se transforma con tu sonido.</p>
        </div>
        <div className="p-8 rounded-lg text-center" style={tarjetaStyle}>
          <p className="text-5xl mb-4 font-bold" style={{ color: colores.accent2, textShadow: '3px 3px 0px #000000' }} aria-hidden="true">3</p>
          <h3 className="text-xl font-bold mb-2" style={{ color: colores.accent4 }}>DALE TU FINAL</h3>
          <p className="font-bold" style={{ color: colores.text }}>Tu decides como cierra. Guarda tu creacion.</p>
        </div>
      </section>
    </div>
  );
}
