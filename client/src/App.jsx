import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Biblioteca from './pages/Biblioteca';
import Editor from './pages/Editor';
import Cierre from './pages/Cierre';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/editor/:id/cierre" element={<Cierre />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
