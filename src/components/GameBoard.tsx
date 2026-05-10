import { useState, useEffect } from 'react';
import type { OkeyTile, GamePlayer } from '../lib/supabase';
import { createDeck, shuffleDeck, dealTiles, determineOkeyTile } from '../lib/okeyGame';
import Tile from './Tile';
import { Users, Trophy, RotateCcw, Send, LogOut } from 'lucide-react';

interface GameBoardProps {
  user: { id: string; email: string };
  onLeaveGame: () => void;
}

export default function GameBoard({ user, onLeaveGame }: GameBoardProps) {
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

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const hands = dealTiles(newDeck, 0);
    
    // Set indicator tile (shown to all players)
    const indicator = newDeck[56]; // Random position for indicator
    const okey = determineOkeyTile(indicator);
    
    setDeck(newDeck.slice(57)); // Remaining deck
    setIndicatorTile(indicator);
    setOkeyTile(okey);
    
    // Create player objects
    const newPlayers: GamePlayer[] = [
      { user_id: 'player-1', username: 'Sen', tiles: hands[0], score: 0, is_ready: false },
      { user_id: 'player-2', username: 'Oyuncu 2', tiles: hands[1], score: 0, is_ready: false },
      { user_id: 'player-3', username: 'Oyuncu 3', tiles: hands[2], score: 0, is_ready: false },
      { user_id: 'player-4', username: 'Oyuncu 4', tiles: hands[3], score: 0, is_ready: false },
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
    
    // Update player tiles
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, tiles: newHand } : p
    );
    setPlayers(updatedPlayers);
    
    // Move to next player
    const nextPlayer = (currentPlayer + 1) % 4;
    setCurrentPlayer(nextPlayer);
    setMessage(`Sıra ${players[nextPlayer].username}`);
    
    // Simulate other players drawing and discarding
    setTimeout(() => {
      simulateOtherPlayers(nextPlayer);
    }, 1000);
  };

  const handleDraw = () => {
    if (currentPlayer !== myPlayerIndex || deck.length === 0) return;
    
    const drawnTile = deck[0];
    const newDeck = deck.slice(1);
    const newHand = [...myHand, drawnTile];
    
    setDeck(newDeck);
    setMyHand(newHand);
    
    // Update player tiles
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, tiles: newHand } : p
    );
    setPlayers(updatedPlayers);
    
    setMessage('Bir taş çektin. Şimdi bir taş at.');
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
      
      // Simulate draw and discard
      setTimeout(() => {
        const player = players[currentPlayerIdx];
        if (player.tiles.length < 14) {
          // Draw a tile
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
    // Check if player can call okey (has 10 pairs + 1 tile)
    const valueCounts: Record<string, number> = {};
    myHand.forEach(tile => {
      const key = `${tile.color}-${tile.value}`;
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    });
    
    const pairs = Object.values(valueCounts).filter(count => count >= 2).length;
    
    if (pairs >= 10) {
      setGameState('finished');
      setMessage('🎉 TEBRİKLER! OKEY! 🎉');
    } else {
      setMessage('Okey çağırmak için en az 10 çift taşın olmalı!');
    }
  };

  const handleNewGame = () => {
    setGameState('waiting');
    setDiscardPile([]);
    setSelectedTile(null);
    setMessage('Yeni oyun başlıyor...');
    setTimeout(() => {
      initializeGame();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🎴</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Okey Oyunu</h1>
              <p className="text-emerald-200 text-sm">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewGame}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Yeni Oyun
            </button>
            <button
              onClick={onLeaveGame}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-7xl mx-auto">
        {/* Top Players (Opponents) */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {players.slice(1, 4).map((player, index) => (
            <div
              key={player.user_id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 transition-all ${
                currentPlayer === index + 1 
                  ? 'border-amber-400 shadow-lg shadow-amber-400/20' 
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.username[0]}
                  </div>
                  <span className="text-white font-medium">{player.username}</span>
                </div>
                <span className="text-emerald-300 text-sm">{player.tiles.length} taş</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {player.tiles.slice(0, 5).map((tile) => (
                  <Tile key={tile.id} tile={tile} small hidden />
                ))}
                {player.tiles.length > 5 && (
                  <span className="text-white/50 text-sm self-center">+{player.tiles.length - 5}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Center Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Deck & Discard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-emerald-200 text-sm mb-2">Çekme Taşı</p>
              <div className="relative">
                <Tile 
                  tile={deck[0] || { id: 'empty', color: 'red', value: 1, is_okey: false, is_fake_okey: false }} 
                  hidden
                  disabled={deck.length === 0 || currentPlayer !== myPlayerIndex}
                  onClick={handleDraw}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
                  {deck.length} kaldı
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-emerald-200 text-sm mb-2">Atılan Taşlar</p>
              <div className="flex gap-1 flex-wrap justify-center min-h-[80px]">
                {discardPile.slice(-5).map((tile) => (
                  <Tile key={tile.id} tile={tile} small />
                ))}
              </div>
            </div>
          </div>

          {/* Indicator & Okey Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-emerald-200 text-sm mb-2">Gösterge Taşı</p>
              {indicatorTile && <Tile tile={indicatorTile} />}
            </div>
            
            <div className="text-center">
              <p className="text-emerald-200 text-sm mb-2">OKEY Taşı</p>
              {okeyTile && (
                <div className="relative">
                  <Tile tile={okeyTile} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-sm">⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-300" />
              <h3 className="text-white font-bold">Oyun Durumu</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-200 text-sm">Sıra</p>
                <p className="text-white font-bold">{players[currentPlayer]?.username}</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-200 text-sm">Mesaj</p>
                <p className="text-white">{message}</p>
              </div>
              
              <button
                onClick={handleOkeyCall}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                🎉 OKEY!
              </button>
            </div>
          </div>
        </div>

        {/* My Hand */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-white font-bold">Senin Sıra</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-emerald-200">{myHand.length} taş</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center min-h-[120px]">
            {myHand.map((tile, index) => (
              <Tile
                key={tile.id}
                tile={tile}
                selected={selectedTile === index}
                onClick={() => handleTileClick(index)}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex}
              />
            ))}
          </div>
          
          {selectedTile !== null && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎴</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Oyuna Hazır mısın?</h2>
              <p className="text-emerald-200">Diğer oyuncular da hazır olduğunda oyun başlayacak.</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleReady}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg"
              >
                ✅ Hazırım!
              </button>
              
              <button
                onClick={handleSimulateOtherPlayers}
                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
              >
                🤖 Diğer Oyuncuları Simüle Et (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Finished Modal */}
      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">OKEY!</h2>
            <p className="text-emerald-200 mb-6">{message}</p>
            
            <button
              onClick={handleNewGame}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg"
            >
              🔄 Yeni Oyun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
