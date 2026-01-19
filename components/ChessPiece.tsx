
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
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-24 h-24 text-5xl'
  };

  const borderColor = color === 'red' ? 'border-red-800' : 'border-neutral-800';
  const textColor = color === 'red' ? 'text-red-800' : 'text-neutral-900';
  
  let bgColor = 'bg-[#eec285]';
  if (isSelected) {
    bgColor = 'bg-amber-100 scale-110 shadow-lg ring-4 ring-red-900/20';
  } else if (isHinted) {
    bgColor = 'bg-amber-300 scale-105 shadow-md animate-pulse';
  }

  if (isSolved) return <div className={`${sizeClasses[size]}`} />;

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
        active:scale-95
        m-2
      `}
    >
      <div className={`absolute inset-1 rounded-full border border-opacity-30 ${borderColor}`} />
      <span className="relative z-10 font-bold">{content}</span>
    </button>
  );
};

export default ChessPiece;
