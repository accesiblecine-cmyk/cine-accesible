import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useNarrador from '../../hooks/useNarrador';

export default function NarradorGlobal() {
  const location = useLocation();
  const { narrar, narradorActivo } = useNarrador();

  useEffect(() => {
    if (!narradorActivo) return;

    const timeout = setTimeout(() => {
      switch (location.pathname) {
        case '/':
          narrar('Bienvenido a Cine Accesible. Toca, mira, crea. Tu sonido transforma la pelicula. Usa el menu superior para iniciar sesion o registrarte.');
          break;
        case '/login':
          narrar('Iniciar sesion. Ingresa tu correo electronico y contrasena para acceder a tu cuenta.');
          break;
        case '/registro':
          narrar('Crear cuenta. Completa el formulario con tu nombre, correo electronico y contrasena para registrarte en Cine Accesible.');
          break;
        case '/biblioteca':
          narrar('Biblioteca de peliculas. Aqui puedes elegir una pelicula para empezar a crear. Hay 4 videos disponibles. Usa el tabulador para navegar entre las opciones.');
          break;
        default:
          if (location.pathname.includes('/editor/') && !location.pathname.includes('/cierre')) {
            narrar('Editor de pelicula. Aqui puedes tocar instrumentos y ver como el video se transforma con tu sonido. Los instrumentos estan en el panel derecho.');
          } else if (location.pathname.includes('/cierre')) {
            narrar('Pantalla de cierre. La pelicula ha terminado. Aqui puedes elegir como quieres que termine tu creacion.');
          }
          break;
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname, narradorActivo]);

  useEffect(() => {
    if (!narradorActivo) return;

    const handleFocus = (e) => {
      const elemento = e.target;
      let texto = '';

      if (elemento.getAttribute('aria-label')) {
        texto = elemento.getAttribute('aria-label');
      } else if (elemento.tagName === 'INPUT' && elemento.labels?.length > 0) {
        texto = elemento.labels[0].textContent + '. ' + (elemento.value || 'vacio');
      } else if (elemento.tagName === 'BUTTON' || elemento.tagName === 'A') {
        texto = elemento.textContent?.trim() || 'Elemento interactivo';
      }

      if (texto && texto.length > 2) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-MX';
        utterance.rate = 1.1;
        utterance.volume = 0.6;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [narradorActivo]);

  return null;
}
