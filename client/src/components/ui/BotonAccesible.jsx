export default function BotonAccesible({
  children,
  onClick,
  variante = 'primario',
  tipo = 'button',
  className = '',
  ...props
}) {
  const base = 'font-bold py-4 px-8 border-2 border-black transition-all duration-200 shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] focus:outline focus:outline-3 focus:outline-[#FFE156]';
  const variantes = {
    primario: 'bg-[#FF6B3D] text-[#FFF8E7] hover:bg-[#E0552E]',
    secundario: 'bg-[#00D4AA] text-[#1A3A5C] hover:bg-[#00B894]',
    peligro: 'bg-[#E0254F] text-[#FFF8E7] hover:bg-[#C01E42]',
  };

  return (
    <button
      type={tipo}
      onClick={onClick}
      className={base + ' ' + variantes[variante] + ' ' + className}
      style={{ minWidth: '160px', minHeight: '56px' }}
      {...props}
    >
      {children}
    </button>
  );
}
