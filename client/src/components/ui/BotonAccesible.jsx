export default function BotonAccesible({
  children,
  onClick,
  variante = 'primario',
  tipo = 'button',
  className = '',
  ...props
}) {
  const base = 'font-bold py-4 px-8 rounded-lg transition-colors duration-300 focus:outline focus:outline-3 focus:outline-[#FFB347]';
  const variantes = {
    primario: 'bg-[#6BB5FF] text-[#1A1A1A] hover:bg-[#5AA4EE]',
    secundario: 'bg-[#2A2A2A] text-[#F0F0F0] border border-[#404040] hover:bg-[#3A3A3A]',
    peligro: 'bg-[#E57373] text-[#1A1A1A] hover:bg-[#D56262]',
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
