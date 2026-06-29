import { Link } from 'react-router-dom';
import BotonAccesible from '../components/ui/BotonAccesible';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F0F0F0]">
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-3xl font-bold text-[#6BB5FF]">Cine Accesible</h1>
        <nav className="flex gap-4" aria-label="Navegacion principal">
          <Link to="/login" className="text-[#B0B0B0] hover:text-[#F0F0F0] text-lg py-2 px-4">
            Iniciar sesion
          </Link>
          <Link to="/registro" className="text-[#6BB5FF] hover:text-[#5AA4EE] text-lg py-2 px-4">
            Registrarse
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-8 py-24 gap-12">
        <section className="text-center max-w-2xl">
          <h2 className="text-5xl font-bold mb-6">Toca, mira, crea.</h2>
          <p className="text-xl text-[#B0B0B0] mb-8 leading-relaxed">
            Tu sonido transforma la pelicula. Una experiencia audiovisual interactiva
            disenada para todas las personas.
          </p>
          <Link to="/registro">
            <BotonAccesible variante="primario">
              Comenzar experiencia
            </BotonAccesible>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-16">
          <div className="bg-[#2A2A2A] p-8 rounded-lg text-center">
            <p className="text-4xl mb-4" aria-hidden="true">1</p>
            <h3 className="text-xl font-bold mb-2">Elige una pelicula</h3>
            <p className="text-[#B0B0B0]">Selecciona de nuestra biblioteca o sube el tuyo.</p>
          </div>
          <div className="bg-[#2A2A2A] p-8 rounded-lg text-center">
            <p className="text-4xl mb-4" aria-hidden="true">2</p>
            <h3 className="text-xl font-bold mb-2">Toca instrumentos</h3>
            <p className="text-[#B0B0B0]">Mira como el video se transforma con tu sonido.</p>
          </div>
          <div className="bg-[#2A2A2A] p-8 rounded-lg text-center">
            <p className="text-4xl mb-4" aria-hidden="true">3</p>
            <h3 className="text-xl font-bold mb-2">Dale tu final</h3>
            <p className="text-[#B0B0B0]">Tu decides como cierra. Guarda tu creacion.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
