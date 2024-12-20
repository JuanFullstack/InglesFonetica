// Componente de botón con efecto 3D
import React from 'react';

interface StyledButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({
  active,
  onClick,
  children,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        transform transition-all duration-200
        ${active ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1'}
        px-4 py-2 rounded-lg
        shadow-[0_4px_0_rgb(0,0,0,0.2)]
        active:shadow-[0_0_0_rgb(0,0,0,0.2)]
        active:translate-y-1
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default StyledButton;