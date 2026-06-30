const API_URL = 'https://cine-accesible-api.onrender.com/api';

export async function registrar(nombre, email, password) {
  const res = await fetch(API_URL + '/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data;
}

export async function login(email, password) {
  const res = await fetch(API_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data;
}

export async function obtenerVideos() {
  const res = await fetch(API_URL + '/videos');
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data;
}

export async function obtenerVideo(id) {
  const res = await fetch(API_URL + '/videos/' + id);
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data;
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function obtenerUsuario() {
  const u = localStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}

export function estaAutenticado() {
  return !!obtenerToken();
}
