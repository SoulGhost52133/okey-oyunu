import type { OkeyTile } from '../lib/supabase';
import { getColorEmoji } from '../lib/okeyGame';

interface TileProps {
  tile: OkeyTile;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  hidden?: boolean;
}

export default function Tile({ 
  tile, 
  onClick, 
  selected = false, 
  disabled = false,
  small = false,
  hidden = false 
}: TileProps) {
  const bgColor = {
    red: 'bg-gradient-to-br from-red-400 to-red-600',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
    black: 'bg-gradient-to-br from-gray-700 to-gray-900',
    yellow: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
  }[tile.color];

  const sizeClasses = small 
    ? 'w-10 h-14 text-sm' 
    : 'w-14 h-20 text-lg md:w-16 md:h-24 md:text-xl';

  if (hidden) {
    return (
      <div
        className={`${sizeClasses} rounded-lg shadow-lg border-2 border-white/20 
          bg-gradient-to-br from-amber-700 to-amber-900
          flex items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          transition-all duration-200`}
        onClick={disabled ? undefined : onClick}
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-600/50 flex items-center justify-center">
          <span className="text-amber-200 text-xs md:text-sm">🎴</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} ${bgColor} rounded-lg shadow-lg border-2 
        ${selected ? 'border-amber-300 ring-2 ring-amber-400 scale-110 -translate-y-2' : 'border-white/30'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        flex flex-col items-center justify-center
        transition-all duration-200 relative overflow-hidden`}
      onClick={disabled ? undefined : onClick}
    >
      {/* Okey indicator */}
      {(tile.is_okey || tile.is_fake_okey) && (
        <div className="absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
          <span className="text-xs">⭐</span>
        </div>
      )}
      
      {/* Value */}
      <span className="text-white font-bold drop-shadow-md">
        {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
      </span>
      
      {/* Color emoji */}
      <span className="text-white/90 mt-1">{getColorEmoji(tile.color)}</span>
      
      {/* Fake okey label */}
      {tile.is_fake_okey && (
        <span className="absolute bottom-1 text-[8px] md:text-[10px] text-white/80 font-medium">
          SAHTE
        </span>
      )}
    </div>
  );
}
