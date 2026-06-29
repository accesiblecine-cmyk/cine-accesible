import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputAccesible from '../components/ui/InputAccesible';
import BotonAccesible from '../components/ui/BotonAccesible';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!form.email.includes('@')) {
      nuevosErrores.email = 'El formato del correo no es valido. Debe contener un arroba (@).';
    }
    if (form.password.length < 6) {
      nuevosErrores.password = 'La contrasena debe tener al menos 6 caracteres.';
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    window.location.href = '/biblioteca';
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F0F0F0] flex items-center justify-center px-4">
      <div className="bg-[#2A2A2A] p-10 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#6BB5FF] mb-8 text-center">
          Iniciar sesion
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <InputAccesible
            label="Correo electronico"
            tipo="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errores.email}
            autoComplete="email"
          />
          <InputAccesible
            label="Contrasena"
            tipo="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errores.password}
            autoComplete="current-password"
          />
          <BotonAccesible variante="primario" tipo="submit" className="w-full">
            Entrar
          </BotonAccesible>
        </form>
        <p className="mt-6 text-center text-[#B0B0B0]">
          No tienes cuenta?{' '}
          <Link to="/registro" className="text-[#6BB5FF] hover:underline">
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
