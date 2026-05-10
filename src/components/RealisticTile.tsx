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
  isDragging?: boolean;
}

export default function RealisticTile({ 
  tile, 
  onClick, 
  selected = false, 
  disabled = false,
  small = false,
  hidden = false,
  inHand = false,
  isDrawn = false,
  isDragging = false
}: TileProps) {
  if (hidden) {
    return (
      <div
        className={`
          ${small ? 'w-7 h-11 md:w-9 md:h-14' : 'w-10 h-15 md:w-12 md:h-17'} 
          rounded-md shadow-2xl
          cursor-pointer
          transform transition-all duration-200
          ${isDragging ? 'scale-110 z-50' : 'hover:scale-105'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          relative overflow-hidden
        `}
        style={{
          background: 'linear-gradient(145deg, #c2410c 0%, #7c2d12 30%, #431407 70%, #1a0a02 100%)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.4)',
          border: '1px solid #9a3412',
        }}
        onClick={disabled ? undefined : onClick}
      >
        {/* Ornate pattern */}
        <div className="absolute inset-2 opacity-25" style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 70%),
            repeating-linear-gradient(45deg, rgba(124, 45, 18, 0.4) 0px, rgba(124, 45, 18, 0.4) 1px, transparent 1px, transparent 4px),
            repeating-linear-gradient(-45deg, rgba(124, 45, 18, 0.4) 0px, rgba(124, 45, 18, 0.4) 1px, transparent 1px, transparent 4px)
          `,
          borderRadius: '4px',
        }}></div>
        
        {/* Center medallion */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-amber-600/50 to-amber-800/50 border-2 border-amber-500/60 flex items-center justify-center shadow-inner" style={{
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(251, 191, 36, 0.3)',
          }}>
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-700/40 border border-amber-400/30 flex items-center justify-center">
              <span className="text-amber-200 text-xs md:text-sm opacity-80">🎴</span>
            </div>
          </div>
        </div>
        
        {/* Corner rosettes */}
        {[
          'top-1 left-1', 'top-1 right-1', 
          'bottom-1 left-1', 'bottom-1 right-1'
        ].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-md border border-amber-400/40`}></div>
        ))}
      </div>
    );
  }

  const tileColors = {
    red: { 
      primary: '#dc2626', 
      secondary: '#991b1b',
      light: '#fef2f2', 
      gradient: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 30%, #fee2e2 70%, #fecaca 100%)',
      border: '#b91c1c',
      name: 'Kırmızı' 
    },
    blue: { 
      primary: '#2563eb', 
      secondary: '#1e40af',
      light: '#eff6ff', 
      gradient: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 30%, #dbeafe 70%, #bfdbfe 100%)',
      border: '#1d4ed8',
      name: 'Mavi' 
    },
    black: { 
      primary: '#1f2937', 
      secondary: '#111827',
      light: '#f9fafb', 
      gradient: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 30%, #e5e7eb 70%, #d1d5db 100%)',
      border: '#374151',
      name: 'Siyah' 
    },
    yellow: { 
      primary: '#ca8a04', 
      secondary: '#854d0e',
      light: '#fefce8', 
      gradient: 'linear-gradient(180deg, #fefce8 0%, #ffffff 30%, #fef9c3 70%, #fef08a 100%)',
      border: '#a16207',
      name: 'Sarı' 
    },
  };

  const colors = tileColors[tile.color];

  return (
    <div
      className={`
        ${small ? 'w-7 h-11 md:w-9 md:h-14 text-sm' : 'w-10 h-15 md:w-12 md:h-17 text-base'} 
        rounded-md
        cursor-pointer
        transform transition-all duration-200
        ${isDragging ? 'scale-125 z-50 shadow-2xl' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : inHand ? 'hover:scale-110 hover:-translate-y-4' : 'hover:scale-105'}
        relative overflow-hidden
        shadow-xl
        select-none
      `}
      style={{
        background: colors.gradient,
        border: `3px solid ${colors.border}`,
        boxShadow: selected 
          ? `0 0 0 3px rgba(251, 191, 36, 0.6), 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.9)`
          : isDrawn
          ? `0 0 0 3px rgba(34, 197, 94, 0.6), 0 10px 30px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.9)`
          : `0 4px 12px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.08)`,
        borderRadius: '8px',
      }}
      onClick={disabled ? undefined : onClick}
      draggable={!disabled && inHand}
      onDragStart={(e) => {
        if (!disabled && inHand && onClick) {
          e.dataTransfer.setData('text/plain', 'tile');
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => onClick(), 0);
        }
      }}
    >
      {/* OKEY/Sahte indicator */}
      {(tile.is_okey || tile.is_fake_okey) && (
        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl z-20 animate-pulse" style={{
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.9), 0 4px 10px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
          border: '2px solid white',
        }}>
          <span className="text-lg drop-shadow-md">⭐</span>
        </div>
      )}
      
      {/* Top-left value */}
      <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 font-black" style={{
        color: colors.primary,
        fontSize: small ? '12px' : '15px',
        fontFamily: 'Arial Black, Impact, sans-serif',
        textShadow: '0 1px 1px rgba(255,255,255,0.9), 0 2px 3px rgba(0,0,0,0.2)',
        letterSpacing: '-0.5px',
      }}>
        {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
      </div>
      
      {/* Top-right color circle */}
      <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 rounded-full shadow-md border-2 border-white/80" style={{
        backgroundColor: colors.primary,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2)',
      }}>
        <div className="w-full h-full rounded-full" style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%), ${colors.primary}`,
        }}></div>
      </div>
      
      {/* Center large value */}
      <div className="absolute inset-0 flex items-center justify-center pt-2">
        <span className="font-black" style={{
          color: colors.primary,
          fontSize: small ? '22px' : '32px',
          fontFamily: 'Arial Black, Impact, sans-serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(255,255,255,0.8)',
          letterSpacing: '-1px',
        }}>
          {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
        </span>
      </div>
      
      {/* Bottom dots */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[...Array(Math.min(tile.value, 5))].map((_, i) => (
          <div 
            key={i} 
            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm border border-black/20"
            style={{ 
              backgroundColor: colors.primary,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.5)',
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%), ${colors.primary}`,
            }}
          />
        ))}
      </div>
      
      {/* Fake okey label */}
      {tile.is_fake_okey && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-red-800 font-black bg-red-300 px-2 py-0.5 rounded border-2 border-red-500" style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          textShadow: '0 1px 1px rgba(255,255,255,0.5)',
        }}>
          SAHTE
        </div>
      )}
      
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none rounded-t-md"></div>
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      }}></div>
    </div>
  );
}
