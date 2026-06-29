import { useState } from 'react';

export default function InputAccesible({ label, tipo = 'text', name, value, onChange, error = '', ...props }) {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const errorId = name + '-error';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[#FFE156] text-lg font-bold">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={tipo === 'password' && mostrarPassword ? 'text' : tipo}
          value={value}
          onChange={onChange}
          className="w-full border-2 border-black rounded-lg px-4 py-3 text-lg font-bold focus:outline focus:outline-3 focus:outline-[#FFE156] shadow-[3px_3px_0px_#000000]"
          style={{ backgroundColor: '#1A3A5C', color: '#FFF8E7' }}
          aria-invalid={error ? true : false}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {tipo === 'password' && (
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4DE8FF] hover:text-[#FFE156] text-sm font-bold"
            aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            {mostrarPassword ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-[#E0254F] text-sm font-bold" role="alert">{error}</p>
      )}
    </div>
  );
}
