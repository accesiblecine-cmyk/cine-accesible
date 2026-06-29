import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputAccesible from '../components/ui/InputAccesible';
import BotonAccesible from '../components/ui/BotonAccesible';
import { registrar } from '../utils/api';
import useAccesibilidadStore from '../store/useAccesibilidadStore';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const colores = useAccesibilidadStore((s) => s.colores);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: '' });
    setErrorServidor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (form.nombre.length < 2) nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres.';
    if (!form.email.includes('@')) nuevosErrores.email = 'El formato del correo no es valido. Debe contener un arroba (@).';
    if (form.password.length < 6) nuevosErrores.password = 'La contrasena debe tener al menos 6 caracteres.';
    if (form.password !== form.confirmar) nuevosErrores.confirmar = 'Las contrasenas no coinciden.';
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    setCargando(true);
    try { await registrar(form.nombre, form.email, form.password); window.location.href = '/biblioteca'; }
    catch (error) { setErrorServidor(error.message); }
    finally { setCargando(false); }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="p-10 rounded-lg w-full max-w-md border-2 border-black shadow-[8px_8px_0px_#000000]" style={{ backgroundColor: colores.surface }}>
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: colores.accent4, textShadow: '3px 3px 0px #000000' }}>CREAR CUENTA</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <InputAccesible label="NOMBRE" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} autoComplete="name" />
          <InputAccesible label="CORREO ELECTRONICO" tipo="email" name="email" value={form.email} onChange={handleChange} error={errores.email} autoComplete="email" />
          <InputAccesible label="CONTRASENA" tipo="password" name="password" value={form.password} onChange={handleChange} error={errores.password} autoComplete="new-password" />
          <InputAccesible label="CONFIRMAR CONTRASENA" tipo="password" name="confirmar" value={form.confirmar} onChange={handleChange} error={errores.confirmar} autoComplete="new-password" />
          {errorServidor && <p className="text-sm font-bold text-center" style={{ color: colores.error }} role="alert">{errorServidor}</p>}
          <BotonAccesible variante="primario" tipo="submit" className="w-full">{cargando ? 'CREANDO...' : 'CREAR CUENTA'}</BotonAccesible>
        </form>
        <p className="mt-6 text-center font-bold" style={{ color: colores.text }}>
          YA TIENES CUENTA? <Link to="/login" className="hover:underline" style={{ color: colores.accent5, textShadow: '2px 2px 0px #000000' }}>INICIA SESION AQUI</Link>
        </p>
      </div>
    </div>
  );
}
