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

export async function obtenerProyecto(videoId) {
  const token = obtenerToken();
  const res = await fetch(API_URL + '/proyectos?videoId=' + videoId, {
    headers: { Authorization: 'Bearer ' + token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data.length > 0 ? data[0] : null;
}

export async function guardarProyecto({ videoId, timestampVideo, configuracion, historial, proyectoId }) {
  const token = obtenerToken();
  const body = JSON.stringify({ videoId, timestampVideo, configuracion, historial });

  if (proyectoId) {
    const res = await fetch(API_URL + '/proyectos/' + proyectoId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);
    return data;
  } else {
    const res = await fetch(API_URL + '/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);
    return data;
  }
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
