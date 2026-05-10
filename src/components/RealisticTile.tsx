import type { OkeyTile } from '../lib/supabase';

interface TileProps {
  tile: OkeyTile;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  hidden?: boolean;
  inHand?: boolean;
}

export default function RealisticTile({ 
  tile, 
  onClick, 
  selected = false, 
  disabled = false,
  small = false,
  hidden = false,
  inHand = false
}: TileProps) {
  if (hidden) {
    return (
      <div
        className={`
          ${small ? 'w-9 h-13' : 'w-12 h-17 md:w-14 md:h-20'} 
          rounded-md shadow-xl
          bg-gradient-to-br from-amber-800 via-amber-900 to-yellow-950
          border-2 border-amber-700
          flex items-center justify-center
          cursor-pointer
          transform transition-all duration-200
          hover:scale-105 hover:shadow-2xl
          relative overflow-hidden
        `}
        onClick={disabled ? undefined : onClick}
        style={{
          background: 'linear-gradient(135deg, #d97706 0%, #92400e 50%, #78350f 100%)',
        }}
      >
        {/* Back pattern */}
        <div className="absolute inset-1 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 4px)',
          }}></div>
        </div>
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-600/30 border-2 border-amber-500/50 flex items-center justify-center">
          <span className="text-amber-300 text-xs">🎴</span>
        </div>
      </div>
    );
  }

  // Gerçek Okey taşı renkleri
  const tileColors = {
    red: {
      bg: 'from-red-50 via-red-100 to-red-200',
      border: 'border-red-300',
      text: 'text-red-700',
      glow: 'shadow-red-200',
      realColor: '#dc2626'
    },
    blue: {
      bg: 'from-blue-50 via-blue-100 to-blue-200',
      border: 'border-blue-300',
      text: 'text-blue-700',
      glow: 'shadow-blue-200',
      realColor: '#2563eb'
    },
    black: {
      bg: 'from-gray-100 via-gray-200 to-gray-300',
      border: 'border-gray-400',
      text: 'text-gray-800',
      glow: 'shadow-gray-200',
      realColor: '#1f2937'
    },
    yellow: {
      bg: 'from-yellow-50 via-yellow-100 to-yellow-200',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      glow: 'shadow-yellow-200',
      realColor: '#eab308'
    },
  };

  const colors = tileColors[tile.color];

  return (
    <div
      className={`
        ${small ? 'w-9 h-13 text-sm' : 'w-12 h-17 md:w-14 md:h-20 text-base'} 
        rounded-lg shadow-lg
        bg-gradient-to-br ${colors.bg}
        border-2 ${colors.border}
        ${selected ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 -translate-y-3' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${inHand ? 'hover:scale-105 hover:-translate-y-2' : ''}
        flex flex-col items-center justify-center
        transition-all duration-200
        relative overflow-hidden
        ${colors.glow}
      `}
      onClick={disabled ? undefined : onClick}
      style={{
        background: `linear-gradient(135deg, #fefefe 0%, ${colors.realColor}22 50%, ${colors.realColor}44 100%)`,
        boxShadow: selected 
          ? '0 10px 40px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)' 
          : '0 4px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)',
      }}
    >
      {/* Okey/Sahte Okey indicator */}
      {(tile.is_okey || tile.is_fake_okey) && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse" style={{
          boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
        }}>
          <span className="text-xs">⭐</span>
        </div>
      )}
      
      {/* Value with realistic styling */}
      <div className={`font-bold ${colors.text} drop-shadow-md`} style={{
        fontSize: small ? '14px' : '18px',
        fontFamily: 'Georgia, serif',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>
        {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
      </div>
      
      {/* Color indicator dots */}
      <div className="flex gap-1 mt-1">
        {[...Array(Math.min(tile.value, 4))].map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{ backgroundColor: colors.realColor }}
          />
        ))}
      </div>
      
      {/* Fake okey label */}
      {tile.is_fake_okey && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-red-600 font-bold bg-red-100 px-1 rounded">
          SAHTE
        </div>
      )}
      
      {/* Shine effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
    </div>
  );
}
