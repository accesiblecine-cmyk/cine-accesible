import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InputAccesible from '../components/ui/InputAccesible';
import BotonAccesible from '../components/ui/BotonAccesible';
import { registrar } from '../utils/api';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  useEffect(() => {
    if (form.nombre && form.nombre.length < 2) {
      setErrores(prev => ({ ...prev, nombre: 'Minimo 2 caracteres.' }));
    } else if (form.nombre && form.nombre.length >= 2) {
      setErrores(prev => { const n = { ...prev }; delete n.nombre; return n; });
    }
  }, [form.nombre]);

  useEffect(() => {
    if (form.email && !form.email.includes('@')) {
      setErrores(prev => ({ ...prev, email: 'El formato del correo no es valido.' }));
    } else if (form.email && form.email.includes('@')) {
      setErrores(prev => { const n = { ...prev }; delete n.email; return n; });
    }
  }, [form.email]);

  useEffect(() => {
    if (form.password && form.password.length < 6) {
      setErrores(prev => ({ ...prev, password: 'Minimo 6 caracteres.' }));
    } else if (form.password && form.password.length >= 6) {
      setErrores(prev => { const n = { ...prev }; delete n.password; return n; });
    }
  }, [form.password]);

  useEffect(() => {
    if (form.confirmar && form.password !== form.confirmar) {
      setErrores(prev => ({ ...prev, confirmar: 'Las contrasenas no coinciden.' }));
    } else if (form.confirmar && form.password === form.confirmar) {
      setErrores(prev => { const n = { ...prev }; delete n.confirmar; return n; });
    }
  }, [form.confirmar, form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorServidor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errores).length > 0) return;
    setCargando(true);
    try { await registrar(form.nombre, form.email, form.password); window.location.href = '/biblioteca'; }
    catch (error) { setErrorServidor(error.message); }
    finally { setCargando(false); }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="p-10 rounded-lg w-full max-w-md border-2 border-black shadow-[8px_8px_0px_#000000]" style={{ backgroundColor: '#1A3A5C' }}>
        <h1 className="text-4xl font-bold text-[#FFE156] mb-8 text-center" style={{ textShadow: '3px 3px 0px #000000' }}>
          CREAR CUENTA
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <InputAccesible label="NOMBRE" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} autoComplete="name" />
          <InputAccesible label="CORREO ELECTRONICO" tipo="email" name="email" value={form.email} onChange={handleChange} error={errores.email} autoComplete="email" />
          <InputAccesible label="CONTRASENA" tipo="password" name="password" value={form.password} onChange={handleChange} error={errores.password} autoComplete="new-password" />
          <InputAccesible label="CONFIRMAR CONTRASENA" tipo="password" name="confirmar" value={form.confirmar} onChange={handleChange} error={errores.confirmar} autoComplete="new-password" />
          {errorServidor && <p className="text-[#E0254F] text-sm font-bold text-center animate-pulse" role="alert">{errorServidor}</p>}
          <BotonAccesible variante="primario" tipo="submit" className="w-full">{cargando ? 'CREANDO...' : 'CREAR CUENTA'}</BotonAccesible>
        </form>
        <p className="mt-6 text-center text-[#FFF8E7] font-bold">
          YA TIENES CUENTA? <Link to="/login" className="text-[#4DE8FF] hover:text-[#FFE156] hover:underline transition-colors" style={{ textShadow: '2px 2px 0px #000000' }}>INICIA SESION AQUI</Link>
        </p>
      </div>
    </div>
  );
}
