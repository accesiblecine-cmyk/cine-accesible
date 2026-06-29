import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputAccesible from '../components/ui/InputAccesible';
import BotonAccesible from '../components/ui/BotonAccesible';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
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
    if (form.nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!form.email.includes('@')) {
      nuevosErrores.email = 'El formato del correo no es valido. Debe contener un arroba (@).';
    }
    if (form.password.length < 6) {
      nuevosErrores.password = 'La contrasena debe tener al menos 6 caracteres.';
    }
    if (form.password !== form.confirmar) {
      nuevosErrores.confirmar = 'Las contrasenas no coinciden.';
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
          Crear cuenta
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <InputAccesible
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errores.nombre}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <InputAccesible
            label="Confirmar contrasena"
            tipo="password"
            name="confirmar"
            value={form.confirmar}
            onChange={handleChange}
            error={errores.confirmar}
            autoComplete="new-password"
          />
          <BotonAccesible variante="primario" tipo="submit" className="w-full">
            Crear cuenta
          </BotonAccesible>
        </form>
        <p className="mt-6 text-center text-[#B0B0B0]">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#6BB5FF] hover:underline">
            Inicia sesion aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
