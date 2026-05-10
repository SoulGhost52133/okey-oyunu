import { useState, useEffect } from 'react';
import type { OkeyTile, GamePlayer } from '../lib/supabase';
import { createDeck, shuffleDeck, dealTiles, determineOkeyTile } from '../lib/okeyGame';
import RealisticTile from './RealisticTile';
import { Users, Trophy, RotateCcw, Send, LogOut, Sparkles } from 'lucide-react';

interface GameBoardProps {
  user: { id: string; email: string };
  onLeaveGame: () => void;
}

export default function RealisticGameBoard({ user, onLeaveGame }: GameBoardProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [myHand, setMyHand] = useState<OkeyTile[]>([]);
  const [deck, setDeck] = useState<OkeyTile[]>([]);
  const [discardPile, setDiscardPile] = useState<OkeyTile[]>([]);
  const [okeyTile, setOkeyTile] = useState<OkeyTile | null>(null);
  const [indicatorTile, setIndicatorTile] = useState<OkeyTile | null>(null);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(0);
  const [message, setMessage] = useState<string>('Oyun başlıyor...');
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [drawnTile, setDrawnTile] = useState<OkeyTile | null>(null);
  const [showOkeyModal, setShowOkeyModal] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const hands = dealTiles(newDeck, 0);
    
    // Set indicator tile (shown to all players)
    const indicator = newDeck[56];
    const okey = determineOkeyTile(indicator);
    
    setDeck(newDeck.slice(57));
    setIndicatorTile(indicator);
    setOkeyTile(okey);
    
    const newPlayers: GamePlayer[] = [
      { user_id: 'player-1', username: 'Sen', tiles: hands[0], score: 0, is_ready: false },
      { user_id: 'player-2', username: 'Sağdaki Oyuncu', tiles: hands[1], score: 0, is_ready: false },
      { user_id: 'player-3', username: 'Karşıdaki Oyuncu', tiles: hands[2], score: 0, is_ready: false },
      { user_id: 'player-4', username: 'Soldaki Oyuncu', tiles: hands[3], score: 0, is_ready: false },
    ];
    
    setPlayers(newPlayers);
    setMyHand(hands[0]);
    setMyPlayerIndex(0);
    setCurrentPlayer(0);
    setShowReadyModal(true);
  };

  const handleReady = () => {
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, is_ready: true } : p
    );
    setPlayers(updatedPlayers);
    setShowReadyModal(false);
    
    const allReady = updatedPlayers.every(p => p.is_ready);
    
    if (allReady) {
      setGameState('playing');
      setMessage('Oyun başladı! Sıra sende.');
    } else {
      setMessage('Diğer oyuncular bekleniyor...');
    }
  };

  const handleSimulateOtherPlayers = () => {
    const updatedPlayers = players.map(p => ({ ...p, is_ready: true }));
    setPlayers(updatedPlayers);
    setGameState('playing');
    setMessage('Oyun başladı! Sıra sende.');
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (currentPlayer !== myPlayerIndex) {
      setMessage('Sıra diğer oyuncuda...');
      return;
    }
    
    setSelectedTile(selectedTile === index ? null : index);
  };

  const handleDiscard = () => {
    if (selectedTile === null || currentPlayer !== myPlayerIndex) return;
    
    const tileToDiscard = myHand[selectedTile];
    const newHand = myHand.filter((_, i) => i !== selectedTile);
    
    setMyHand(newHand);
    setDiscardPile([...discardPile, tileToDiscard]);
    setSelectedTile(null);
    
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, tiles: newHand } : p
    );
    setPlayers(updatedPlayers);
    
    const nextPlayer = (currentPlayer + 1) % 4;
    setCurrentPlayer(nextPlayer);
    setMessage(`${players[nextPlayer].username} oynuyor...`);
    
    setTimeout(() => {
      simulateOtherPlayers(nextPlayer);
    }, 1000);
  };

  const handleDraw = () => {
    if (currentPlayer !== myPlayerIndex || deck.length === 0) return;
    
    const drawnTile = deck[0];
    const newDeck = deck.slice(1);
    
    setDrawnTile(drawnTile);
    setDeck(newDeck);
    setMessage('Taş çektin. Atmak için seç veya OKEY de!');
  };

  const handleUseDrawnTile = () => {
    if (!drawnTile) return;
    
    const newHand = [...myHand, drawnTile];
    setMyHand(newHand);
    setDrawnTile(null);
    
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, tiles: newHand } : p
    );
    setPlayers(updatedPlayers);
    
    setMessage('Taşı eline aldın. Şimdi bir taş at.');
  };

  const simulateOtherPlayers = (startingPlayer: number) => {
    let currentPlayerIdx = startingPlayer;
    
    const simulateTurn = () => {
      if (currentPlayerIdx === myPlayerIndex) {
        setCurrentPlayer(myPlayerIndex);
        setMessage('Sıra sende!');
        return;
      }
      
      setCurrentPlayer(currentPlayerIdx);
      setMessage(`${players[currentPlayerIdx].username} oynuyor...`);
      
      setTimeout(() => {
        const player = players[currentPlayerIdx];
        if (player.tiles.length < 14) {
          const drawnTile = deck[0] || { 
            id: 'simulated', 
            color: 'red' as const, 
            value: Math.floor(Math.random() * 13) + 1,
            is_okey: false,
            is_fake_okey: false
          };
          
          const newTiles = [...player.tiles, drawnTile];
          const discardedTile = newTiles[Math.floor(Math.random() * newTiles.length)];
          const finalTiles = newTiles.filter(t => t !== discardedTile);
          
          const updatedPlayers = players.map((p, i) => 
            i === currentPlayerIdx ? { ...p, tiles: finalTiles } : p
          );
          setPlayers(updatedPlayers);
          setDiscardPile(prev => [...prev, discardedTile]);
        }
        
        currentPlayerIdx = (currentPlayerIdx + 1) % 4;
        if (currentPlayerIdx !== myPlayerIndex) {
          simulateTurn();
        } else {
          setCurrentPlayer(myPlayerIndex);
          setMessage('Sıra sende!');
        }
      }, 800);
    };
    
    simulateTurn();
  };

  const handleOkeyCall = () => {
    setShowOkeyModal(true);
  };

  const confirmOkey = () => {
    const valueCounts: Record<string, number> = {};
    myHand.forEach(tile => {
      const key = `${tile.color}-${tile.value}`;
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    });
    
    const pairs = Object.values(valueCounts).filter(count => count >= 2).length;
    
    if (pairs >= 10) {
      setGameState('finished');
      setMessage('🎉 TEBRİKLER! OKEY! 🎉');
      setShowOkeyModal(false);
    } else {
      setMessage('Okey çağırmak için en az 10 çift taşın olmalı!');
      setShowOkeyModal(false);
    }
  };

  const handleNewGame = () => {
    setGameState('waiting');
    setDiscardPile([]);
    setSelectedTile(null);
    setDrawnTile(null);
    setMessage('Yeni oyun başlıyor...');
    setTimeout(() => {
      initializeGame();
    }, 1000);
  };

  const getTileCount = (playerIndex: number) => {
    if (playerIndex === myPlayerIndex) return myHand.length + (drawnTile ? 1 : 0);
    return players[playerIndex]?.tiles.length || 13;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 p-2 md:p-4 overflow-hidden">
      {/* Okey Table Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse at center, rgba(6, 78, 59, 0.8) 0%, rgba(6, 95, 70, 0.9) 100%),
          repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 10px)
        `,
      }}></div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto mb-3">
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-3 border border-amber-500/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🎴</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-amber-400">OKEY</h1>
              <p className="text-emerald-200 text-xs">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewGame}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Yeni Oyun</span>
            </button>
            <button
              onClick={onLeaveGame}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Table */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Players */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3">
          {players.slice(1, 4).map((player, index) => (
            <div
              key={player.user_id}
              className={`bg-black/30 backdrop-blur-md rounded-xl p-2 md:p-3 border-2 transition-all ${
                currentPlayer === index + 1 
                  ? 'border-amber-400 shadow-lg shadow-amber-400/30' 
                  : 'border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {player.username[0]}
                  </div>
                  <span className="text-white font-medium text-xs md:text-sm">{player.username}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                  <span className="text-amber-400 text-xs md:text-sm">{getTileCount(index + 1)}</span>
                  <span className="text-amber-200 text-xs">🀄</span>
                </div>
              </div>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {player.tiles.slice(0, 4).map((tile) => (
                  <RealisticTile key={tile.id} tile={tile} small hidden />
                ))}
                {player.tiles.length > 4 && (
                  <div className="w-9 h-13 bg-black/40 rounded-md flex items-center justify-center text-white/50 text-xs">
                    +{player.tiles.length - 4}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Center Table Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Deck & Discard */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 md:p-4 border border-amber-500/30 flex flex-col items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2">Çekme Taşı</p>
              <div className="relative">
                <RealisticTile 
                  tile={deck[0] || { id: 'empty', color: 'red', value: 1, is_okey: false, is_fake_okey: false }} 
                  hidden
                  disabled={deck.length === 0 || currentPlayer !== myPlayerIndex}
                  onClick={handleDraw}
                />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-amber-200 text-xs whitespace-nowrap">
                  {deck.length} kaldı
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2">Atılan Taşlar</p>
              <div className="flex gap-1 flex-wrap justify-center min-h-[60px] max-w-[150px]">
                {discardPile.slice(-4).map((tile) => (
                  <RealisticTile key={tile.id} tile={tile} small />
                ))}
              </div>
            </div>
          </div>

          {/* Indicator & Okey Info */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 md:p-4 border border-amber-500/30 flex flex-col items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2">Gösterge</p>
              {indicatorTile && <RealisticTile tile={indicatorTile} />}
            </div>
            
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2">OKEY</p>
              {okeyTile && (
                <div className="relative inline-block">
                  <RealisticTile tile={okeyTile} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-sm">⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 md:p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-amber-400 font-bold text-sm md:text-base">Oyun Durumu</h3>
            </div>
            
            <div className="space-y-2">
              <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                <p className="text-amber-200 text-xs">Sıra</p>
                <p className="text-white font-bold text-sm">{players[currentPlayer]?.username}</p>
              </div>
              
              <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                <p className="text-emerald-200 text-xs">Mesaj</p>
                <p className="text-white text-sm">{message}</p>
              </div>
              
              <button
                onClick={handleOkeyCall}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg"
              >
                🎉 OKEY!
              </button>
            </div>
          </div>
        </div>

        {/* Drawn Tile Area */}
        {drawnTile && (
          <div className="relative z-10 mb-3">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-amber-400 shadow-lg shadow-amber-400/20">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-amber-200 text-xs mb-2">Çektiğin Taş</p>
                  <RealisticTile tile={drawnTile} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleUseDrawnTile();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all text-sm"
                  >
                    Eli Al
                  </button>
                  <button
                    onClick={() => {
                      setDiscardPile([...discardPile, drawnTile]);
                      setDrawnTile(null);
                      const nextPlayer = (currentPlayer + 1) % 4;
                      setCurrentPlayer(nextPlayer);
                      setMessage(`${players[nextPlayer].username} oynuyor...`);
                      setTimeout(() => simulateOtherPlayers(nextPlayer), 1000);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm"
                  >
                    At
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Hand */}
        <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-amber-500/30 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-amber-400 font-bold text-sm md:text-base">Senin Elin</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 text-sm">{myHand.length + (drawnTile ? 1 : 0)} taş</span>
              </div>
              {currentPlayer === myPlayerIndex && (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full animate-pulse">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 text-sm">Sıra Sende</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center min-h-[100px] pb-2">
            {myHand.map((tile, index) => (
              <RealisticTile
                key={tile.id}
                tile={tile}
                selected={selectedTile === index}
                onClick={() => handleTileClick(index)}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex}
                inHand={true}
              />
            ))}
          </div>
          
          {selectedTile !== null && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-500 hover:to-pink-500 transition-all shadow-lg"
              >
                <Send className="w-5 h-5" />
                Taşı At
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ready Modal */}
      {showReadyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-amber-500/50 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-4xl">🎴</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Oyuna Hazır mısın?</h2>
              <p className="text-emerald-200 text-sm">Diğer oyuncular da hazır olduğunda oyun başlayacak.</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleReady}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              >
                ✅ Hazırım!
              </button>
              
              <button
                onClick={handleSimulateOtherPlayers}
                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                🤖 Diğer Oyuncuları Simüle Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OKEY Confirmation Modal */}
      {showOkeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-amber-500/50 shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">OKEY Çağır!</h2>
            <p className="text-emerald-200 text-sm mb-6">
              En az 10 çift taşın varsa OKEY diyebilirsin. Emin misin?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={confirmOkey}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              >
                🎉 EVET, OKEY!
              </button>
              
              <button
                onClick={() => setShowOkeyModal(false)}
                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                ❌ Hayır, Bekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Finished Modal */}
      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-amber-500/50 shadow-2xl text-center">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-amber-400 mb-2">OKEY!</h2>
            <p className="text-emerald-200 mb-6">{message}</p>
            
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              >
                🔄 Yeni Oyun
              </button>
              <button
                onClick={onLeaveGame}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
