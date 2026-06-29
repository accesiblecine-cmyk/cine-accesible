import { Navigate } from 'react-router-dom';
import { estaAutenticado } from '../../utils/api';

export default function RutaProtegida({ children }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
