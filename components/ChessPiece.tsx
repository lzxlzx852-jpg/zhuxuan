
import React from 'react';

interface ChessPieceProps {
  content: string;
  onClick: () => void;
  isSelected?: boolean;
  isHinted?: boolean;
  isSolved?: boolean;
  color?: 'red' | 'black';
  size?: 'sm' | 'md' | 'lg';
}

const ChessPiece: React.FC<ChessPieceProps> = ({ 
  content, 
  onClick, 
  isSelected = false, 
  isHinted = false,
  isSolved = false,
  color = 'black',
  size = 'md'
}) => {
  // Mobile responsive sizes
  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl',
    md: 'w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl'
  };

  const borderColor = color === 'red' ? 'border-red-800' : 'border-neutral-800';
  const textColor = color === 'red' ? 'text-red-800' : 'text-neutral-900';
  
  let bgColor = 'bg-[#eec285]';
  if (isSelected) {
    bgColor = 'bg-amber-100 scale-110 shadow-lg ring-4 ring-red-900/20';
  } else if (isHinted) {
    bgColor = 'bg-amber-300 scale-105 shadow-md animate-pulse';
  }

  if (isSolved) return <div className={`${sizeClasses[size]} m-1 sm:m-2`} />;

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${borderColor} 
        ${textColor}
        ${bgColor}
        chinese-chess-piece
        relative
        rounded-full 
        border-2
        flex items-center justify-center 
        transition-all duration-300
        active:scale-90
        m-1 sm:m-2
        touch-manipulation
      `}
    >
      <div className={`absolute inset-1 rounded-full border border-opacity-30 ${borderColor}`} />
      <span className="relative z-10 font-bold select-none">{content}</span>
    </button>
  );
};

export default ChessPiece;
