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
          ${small ? 'w-8 h-12 md:w-10 md:h-14' : 'w-11 h-16 md:w-13 md:h-18'} 
          rounded-sm shadow-2xl
          cursor-pointer
          transform transition-all duration-150
          ${isDragging ? 'scale-110 z-50 opacity-90' : 'hover:scale-105 hover:-translate-y-1'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          relative overflow-hidden
        `}
        style={{
          background: 'linear-gradient(145deg, #d97706 0%, #b45309 25%, #92400e 50%, #78350f 75%, #451a03 100%)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3)',
          border: '1px solid #a16207',
        }}
        onClick={disabled ? undefined : onClick}
      >
        {/* Intricate back pattern */}
        <div className="absolute inset-1.5 opacity-30" style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 60%),
            repeating-linear-gradient(45deg, rgba(124, 45, 18, 0.5) 0px, rgba(124, 45, 18, 0.5) 1px, transparent 1px, transparent 3px),
            repeating-linear-gradient(-45deg, rgba(124, 45, 18, 0.5) 0px, rgba(124, 45, 18, 0.5) 1px, transparent 1px, transparent 3px)
          `,
          borderRadius: '4px',
        }}></div>
        
        {/* Center ornate circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-500/60 via-amber-600/50 to-amber-800/60 border-2 border-amber-400/70 flex items-center justify-center shadow-2xl" style={{
            boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.5), 0 2px 6px rgba(251, 191, 36, 0.4), 0 0 0 1px rgba(255,255,255,0.2)',
          }}>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-700/50 border border-amber-400/40 flex items-center justify-center" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}>
              <span className="text-amber-200 text-sm md:text-base opacity-90">🎴</span>
            </div>
          </div>
        </div>
        
        {/* Four corner decorations */}
        {[
          { pos: 'top-1.5 left-1.5', size: 'w-2.5 h-2.5' },
          { pos: 'top-1.5 right-1.5', size: 'w-2.5 h-2.5' },
          { pos: 'bottom-1.5 left-1.5', size: 'w-2.5 h-2.5' },
          { pos: 'bottom-1.5 right-1.5', size: 'w-2.5 h-2.5' }
        ].map((corner, i) => (
          <div 
            key={i} 
            className={`absolute ${corner.pos} ${corner.size} rounded-full bg-gradient-to-br from-amber-400 to-amber-700 shadow-md border border-amber-300/50`}
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.2)',
            }}
          ></div>
        ))}
      </div>
    );
  }

  // EXACT real Okey tile colors
  const tileColors = {
    red: { 
      face: '#fef2f2',
      primary: '#dc2626', 
      dark: '#991b1b',
      border: '#b91c1c',
      name: 'Kırmızı' 
    },
    blue: { 
      face: '#eff6ff', 
      primary: '#1d4ed8', 
      dark: '#1e40af',
      border: '#1e40af',
      name: 'Mavi' 
    },
    black: { 
      face: '#fafafa', 
      primary: '#1f2937', 
      dark: '#111827',
      border: '#374151',
      name: 'Siyah' 
    },
    yellow: { 
      face: '#fefce8', 
      primary: '#ca8a04', 
      dark: '#854d0e',
      border: '#a16207',
      name: 'Sarı' 
    },
  };

  const colors = tileColors[tile.color];

  return (
    <div
      className={`
        ${small ? 'w-8 h-12 md:w-10 md:h-14 text-sm' : 'w-11 h-16 md:w-13 md:h-18 text-base'} 
        rounded-sm
        cursor-pointer
        transform transition-all duration-150
        ${isDragging ? 'scale-125 z-50 shadow-2xl' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : inHand ? 'hover:scale-110 hover:-translate-y-3' : 'hover:scale-105'}
        relative overflow-hidden
        shadow-xl
        select-none
      `}
      style={{
        background: `linear-gradient(180deg, ${colors.face} 0%, #ffffff 40%, ${colors.face} 100%)`,
        border: `3px solid ${colors.border}`,
        boxShadow: selected 
          ? `0 0 0 3px rgba(251, 191, 36, 0.7), 0 12px 35px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,1)`
          : isDrawn
          ? `0 0 0 3px rgba(34, 197, 94, 0.7), 0 12px 35px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,1)`
          : `0 5px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.08)`,
        borderRadius: '6px',
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
        <div className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl z-20 animate-pulse" style={{
          boxShadow: '0 0 25px rgba(251, 191, 36, 1), 0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.5)',
          border: '2px solid white',
        }}>
          <span className="text-xl drop-shadow-md">⭐</span>
        </div>
      )}
      
      {/* Top-left value - EXACT Okey font style */}
      <div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 font-black" style={{
        color: colors.primary,
        fontSize: small ? '13px' : '16px',
        fontFamily: 'Arial Black, Impact, sans-serif',
        textShadow: '0 1px 1px rgba(255,255,255,1), 0 2px 3px rgba(0,0,0,0.15)',
        letterSpacing: '-0.5px',
      }}>
        {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
      </div>
      
      {/* Top-right color circle - EXACT like real Okey */}
      <div className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-md" style={{
        backgroundColor: colors.primary,
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.3)',
      }}>
        <div className="w-full h-full rounded-full" style={{
          background: `radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.5) 0%, transparent 50%), ${colors.primary}`,
        }}></div>
      </div>
      
      {/* Center large value - EXACT Okey style */}
      <div className="absolute inset-0 flex items-center justify-center pt-3">
        <span className="font-black" style={{
          color: colors.primary,
          fontSize: small ? '24px' : '34px',
          fontFamily: 'Arial Black, Impact, sans-serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.9)',
          letterSpacing: '-1px',
        }}>
          {tile.value === 1 ? '1' : tile.value === 11 ? 'J' : tile.value === 12 ? 'Q' : tile.value === 13 ? 'K' : tile.value}
        </span>
      </div>
      
      {/* Bottom dots - EXACT like real Okey tiles */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(Math.min(tile.value, 5))].map((_, i) => (
          <div 
            key={i} 
            className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border border-black/15"
            style={{ 
              backgroundColor: colors.primary,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.6)',
              background: `radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.4) 0%, transparent 50%), ${colors.primary}`,
            }}
          />
        ))}
      </div>
      
      {/* Fake okey label */}
      {tile.is_fake_okey && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] md:text-[8px] text-red-900 font-black bg-red-300 px-2 py-0.5 rounded border-2 border-red-500" style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          textShadow: '0 1px 1px rgba(255,255,255,0.6)',
        }}>
          SAHTE
        </div>
      )}
      
      {/* Realistic glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none rounded-t-sm"></div>
      
      {/* Subtle ivory texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      }}></div>
    </div>
  );
}
