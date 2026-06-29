import { useState } from 'react';

export default function InputAccesible({
  label,
  tipo = 'text',
  name,
  value,
  onChange,
  error = '',
  ...props
}) {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const errorId = name + '-error';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[#F0F0F0] text-lg font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={tipo === 'password' && mostrarPassword ? 'text' : tipo}
          value={value}
          onChange={onChange}
          className="w-full bg-[#2A2A2A] text-[#F0F0F0] border border-[#404040] rounded-lg px-4 py-3 text-lg focus:outline focus:outline-2 focus:outline-[#6BB5FF]"
          aria-invalid={error ? true : false}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {tipo === 'password' && (
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#F0F0F0] text-sm"
            aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            {mostrarPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-[#E57373] text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
