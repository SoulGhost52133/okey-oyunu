import type { OkeyTile } from '../lib/supabase';

interface TileProps {
  tile: OkeyTile;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  hidden?: boolean;
  inHand?: boolean;
  isDrawn?: boolean;
}

export default function RealisticTile({ 
  tile, 
  onClick, 
  selected = false, 
  disabled = false,
  small = false,
  hidden = false,
  inHand = false,
  isDrawn = false
}: TileProps) {
  if (hidden) {
    return (
      <div
        className={`
          ${small ? 'w-8 h-12 md:w-10 md:h-14' : 'w-11 h-16 md:w-13 md:h-19'} 
          rounded-lg shadow-2xl
          cursor-pointer
          transform transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1'}
          relative overflow-hidden
        `}
        style={{
          background: 'linear-gradient(135deg, #d97706 0%, #92400e 40%, #78350f 70%, #451a03 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
          border: '2px solid #b45309',
        }}
        onClick={disabled ? undefined : onClick}
      >
        {/* Pattern */}
        <div className="absolute inset-1.5 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #78350f 0px, #78350f 1px, transparent 1px, transparent 3px)',
          borderRadius: '6px',
        }}></div>
        
        {/* Center ornament */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-500/40 to-amber-700/40 border-2 border-amber-400/50 flex items-center justify-center shadow-lg">
            <span className="text-amber-200 text-xs md:text-sm">🎴</span>
          </div>
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-600/50"></div>
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600/50"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-amber-600/50"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-600/50"></div>
      </div>
    );
  }

  const tileColors = {
    red: { primary: '#dc2626', light: '#fecaca', dark: '#991b1b', name: 'Kırmızı' },
    blue: { primary: '#2563eb', light: '#dbeafe', dark: '#1e40af', name: 'Mavi' },
    black: { primary: '#1f2937', light: '#e5e7eb', dark: '#111827', name: 'Siyah' },
    yellow: { primary: '#eab308', light: '#fef9c3', dark: '#854d0e', name: 'Sarı' },
  };

  const colors = tileColors[tile.color];

  return (
    <div
      className={`
        ${small ? 'w-8 h-12 md:w-10 md:h-14 text-sm' : 'w-11 h-16 md:w-13 md:h-19 text-base'} 
        rounded-lg 
        cursor-pointer
        transform transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
        ${inHand ? 'hover:scale-110 hover:-translate-y-3' : ''}
        ${isDrawn ? 'ring-4 ring-green-400 ring-offset-2 animate-pulse' : ''}
        relative overflow-hidden
        shadow-xl
      `}
      style={{
        background: `linear-gradient(180deg, ${colors.light} 0%, #ffffff 50%, ${colors.light} 100%)`,
        border: `3px solid ${colors.primary}`,
        boxShadow: selected 
          ? `0 0 0 4px rgba(251, 191, 36, 0.5), 0 10px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)`
          : `0 4px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)`,
        borderRadius: '12px',
      }}
      onClick={disabled ? undefined : onClick}
    >
      {/* OKEY/Sahte indicator */}
      {(tile.is_okey || tile.is_fake_okey) && (
        <div className="absolute -top-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl z-20 animate-bounce" style={{
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 4px 10px rgba(0,0,0,0.3)',
        }}>
          <span className="text-lg">⭐</span>
        </div>
      )}
      
      {/* Value - Large and clear */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 font-bold" style={{
        color: colors.primary,
        fontSize: small ? '14px' : '18px',
        fontFamily: 'Arial Black, sans-serif',
        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
      }}>
        {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
      </div>
      
      {/* Color indicator - Right side */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 w-4 h-4 md:w-5 md:h-5 rounded-full shadow-inner" style={{
        backgroundColor: colors.primary,
        border: '2px solid rgba(255,255,255,0.8)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
      }}></div>
      
      {/* Center value - Large */}
      <div className="absolute inset-0 flex items-center justify-center pt-4">
        <span className="font-bold" style={{
          color: colors.primary,
          fontSize: small ? '20px' : '28px',
          fontFamily: 'Arial Black, sans-serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
        </span>
      </div>
      
      {/* Dots showing value */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {[...Array(Math.min(tile.value, 5))].map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shadow-sm"
            style={{ 
              backgroundColor: colors.primary,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>
      
      {/* Fake okey label */}
      {tile.is_fake_okey && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-red-700 font-bold bg-red-200 px-1.5 py-0.5 rounded border border-red-400" style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}>
          SAHTE
        </div>
      )}
      
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-lg"></div>
    </div>
  );
}
