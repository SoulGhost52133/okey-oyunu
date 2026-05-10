import { useState, useEffect, useCallback } from 'react';
import type { OkeyTile, GamePlayer } from '../lib/supabase';
import { createDeck, shuffleDeck, dealTiles, determineOkeyTile } from '../lib/okeyGame';
import RealisticTile from './RealisticTile';
import { Users, Trophy, RotateCcw, Send, LogOut, Sparkles, Clock, CheckCircle, Hand } from 'lucide-react';

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
  const [gameRound, setGameRound] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [okeyCallCount, setOkeyCallCount] = useState<number>(0);
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null);
  const [dragOverDiscard, setDragOverDiscard] = useState<boolean>(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setIsProcessing(true);
    const newDeck = shuffleDeck(createDeck());
    const hands = dealTiles(newDeck, 0);
    
    const indicator = newDeck[56];
    const okey = determineOkeyTile(indicator);
    
    setDeck(newDeck.slice(57));
    setIndicatorTile(indicator);
    setOkeyTile(okey);
    setDiscardPile([]);
    setDrawnTile(null);
    setSelectedTile(null);
    setDraggedTileIndex(null);
    
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
    setOkeyCallCount(0);
    setMessage('🎲 Hazır olunca "Hazırım" butonuna tıkla!');
    setShowReadyModal(true);
    setIsProcessing(false);
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
      setMessage('🎮 Oyun başladı! Sıra sende.');
    } else {
      setMessage('⏳ Diğer oyuncular hazırlanıyor...');
      setTimeout(() => handleSimulateOtherPlayers(), 1500);
    }
  };

  const handleSimulateOtherPlayers = () => {
    const updatedPlayers = players.map(p => ({ ...p, is_ready: true }));
    setPlayers(updatedPlayers);
    setGameState('playing');
    setMessage('🎮 Oyun başladı! Sıra sende.');
  };

  const handleTileClick = useCallback((index: number) => {
    if (gameState !== 'playing') {
      showMessage('⚠️ Oyun henüz başlamadı!', 'warning');
      return;
    }
    if (isProcessing) {
      showMessage('⏳ Lütfen bekleyin...', 'warning');
      return;
    }
    if (currentPlayer !== myPlayerIndex) {
      showMessage('⏳ Sıra diğer oyuncuda...', 'warning');
      return;
    }
    if (drawnTile && selectedTile === null) {
      showMessage('⚠️ Önce çektiğin taşı kullan veya at!', 'warning');
      return;
    }
    
    setSelectedTile(selectedTile === index ? null : index);
  }, [gameState, isProcessing, currentPlayer, myPlayerIndex, drawnTile, selectedTile]);

  const handleDiscard = useCallback(() => {
    if (selectedTile === null && !drawnTile) {
      showMessage('⚠️ Atmak için bir taş seç!', 'warning');
      return;
    }
    if (currentPlayer !== myPlayerIndex) {
      showMessage('⏳ Sıra sende değil!', 'warning');
      return;
    }
    if (isProcessing) {
      showMessage('⏳ Lütfen bekleyin...', 'warning');
      return;
    }
    
    setIsProcessing(true);
    
    if (drawnTile) {
      setDiscardPile(prev => [...prev, drawnTile]);
      setDrawnTile(null);
    } else {
      const tileToDiscard = myHand[selectedTile!];
      const newHand = myHand.filter((_, i) => i !== selectedTile);
      setMyHand(newHand);
      setDiscardPile(prev => [...prev, tileToDiscard]);
      
      const updatedPlayers = players.map((p, i) => 
        i === myPlayerIndex ? { ...p, tiles: newHand } : p
      );
      setPlayers(updatedPlayers);
    }
    
    setSelectedTile(null);
    setDraggedTileIndex(null);
    
    const nextPlayer = (currentPlayer + 1) % 4;
    setCurrentPlayer(nextPlayer);
    showMessage(`🔄 ${players[nextPlayer].username} oynuyor...`, 'info');
    
    setTimeout(() => {
      simulateOtherPlayers(nextPlayer);
    }, 1000);
  }, [selectedTile, drawnTile, currentPlayer, myPlayerIndex, isProcessing, myHand, players]);

  const handleDraw = useCallback(() => {
    if (currentPlayer !== myPlayerIndex) {
      showMessage('⏳ Sıra sende değil!', 'warning');
      return;
    }
    if (isProcessing) {
      showMessage('⏳ Lütfen bekleyin...', 'warning');
      return;
    }
    if (drawnTile) {
      showMessage('⚠️ Zaten taş çektin!', 'warning');
      return;
    }
    if (deck.length === 0) {
      showMessage('⚠️ Taş kalmadı!', 'error');
      return;
    }
    
    setIsProcessing(true);
    const drawnTile = deck[0];
    const newDeck = deck.slice(1);
    
    setDrawnTile(drawnTile);
    setDeck(newDeck);
    showMessage('🎴 Taş çektin! Kullanmak için seç veya at.', 'success');
    setIsProcessing(false);
  }, [currentPlayer, myPlayerIndex, isProcessing, drawnTile, deck.length]);

  const handleUseDrawnTile = useCallback(() => {
    if (!drawnTile) return;
    
    const newHand = [...myHand, drawnTile];
    setMyHand(newHand);
    setDrawnTile(null);
    
    const updatedPlayers = players.map((p, i) => 
      i === myPlayerIndex ? { ...p, tiles: newHand } : p
    );
    setPlayers(updatedPlayers);
    
    showMessage('✋ Taşı eline aldın. Şimdi bir taş at.', 'info');
  }, [drawnTile, myHand, myPlayerIndex, players]);

  const handleDiscardDrawnTile = useCallback(() => {
    if (!drawnTile) return;
    
    setDiscardPile(prev => [...prev, drawnTile]);
    setDrawnTile(null);
    
    const nextPlayer = (currentPlayer + 1) % 4;
    setCurrentPlayer(nextPlayer);
    showMessage(`🔄 ${players[nextPlayer].username} oynuyor...`, 'info');
    
    setTimeout(() => simulateOtherPlayers(nextPlayer), 1000);
  }, [drawnTile, currentPlayer, players]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((index: number) => {
    if (gameState !== 'playing' || currentPlayer !== myPlayerIndex || isProcessing || drawnTile) {
      return;
    }
    setDraggedTileIndex(index);
    setSelectedTile(index);
  }, [gameState, currentPlayer, myPlayerIndex, isProcessing, drawnTile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTileIndex !== null) {
      setDragOverDiscard(true);
    }
  }, [draggedTileIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverDiscard(false);
  }, []);

  const handleDrop = useCallback(() => {
    if (draggedTileIndex !== null && currentPlayer === myPlayerIndex && !isProcessing) {
      handleDiscard();
    }
    setDragOverDiscard(false);
    setDraggedTileIndex(null);
  }, [draggedTileIndex, currentPlayer, myPlayerIndex, isProcessing, handleDiscard]);

  const simulateOtherPlayers = useCallback((startingPlayer: number) => {
    let currentPlayerIdx = startingPlayer;
    let turnCount = 0;
    const maxTurns = 3;
    
    const simulateTurn = () => {
      if (currentPlayerIdx === myPlayerIndex || turnCount >= maxTurns) {
        setCurrentPlayer(myPlayerIndex);
        showMessage('🎯 Sıra sende!', 'success');
        setIsProcessing(false);
        return;
      }
      
      setCurrentPlayer(currentPlayerIdx);
      showMessage(`🔄 ${players[currentPlayerIdx].username} oynuyor...`, 'info');
      setIsProcessing(true);
      
      setTimeout(() => {
        const player = players[currentPlayerIdx];
        if (player.tiles.length < 14 && deck.length > 0) {
          const drawnTile = deck[0];
          const newTiles = [...player.tiles, drawnTile];
          const randomIndex = Math.floor(Math.random() * newTiles.length);
          const discardedTile = newTiles[randomIndex];
          const finalTiles = newTiles.filter((_, i) => i !== randomIndex);
          
          const updatedPlayers = players.map((p, i) => 
            i === currentPlayerIdx ? { ...p, tiles: finalTiles } : p
          );
          setPlayers(updatedPlayers);
          setDiscardPile(prev => [...prev, discardedTile]);
          setDeck(prev => prev.slice(1));
        }
        
        currentPlayerIdx = (currentPlayerIdx + 1) % 4;
        turnCount++;
        
        if (currentPlayerIdx !== myPlayerIndex && turnCount < maxTurns) {
          simulateTurn();
        } else {
          setCurrentPlayer(myPlayerIndex);
          showMessage('🎯 Sıra sende!', 'success');
          setIsProcessing(false);
        }
      }, 1200);
    };
    
    simulateTurn();
  }, [myPlayerIndex, players, deck.length]);

  const showMessage = useCallback((msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    setMessage(`${icons[type]} ${msg}`);
  }, []);

  const handleOkeyCall = useCallback(() => {
    if (currentPlayer !== myPlayerIndex) {
      showMessage('⏳ Sıra sende değil!', 'warning');
      return;
    }
    setShowOkeyModal(true);
  }, [currentPlayer, myPlayerIndex, showMessage]);

  const confirmOkey = useCallback(() => {
    const valueCounts: Record<string, number> = {};
    const fullHand = drawnTile ? [...myHand, drawnTile] : myHand;
    
    fullHand.forEach(tile => {
      const key = `${tile.color}-${tile.value}`;
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    });
    
    const pairs = Object.values(valueCounts).filter(count => count >= 2).length;
    const totalTiles = fullHand.length;
    
    if (pairs >= 10 && totalTiles === 14) {
      setGameState('finished');
      showMessage('🎉 TEBRİKLER! OKEY! 🎉', 'success');
      setShowOkeyModal(false);
      setOkeyCallCount(prev => prev + 1);
    } else {
      showMessage(`❌ Okey için 10 çift lazım! Sendeki çift: ${pairs}`, 'error');
      setShowOkeyModal(false);
      setOkeyCallCount(prev => prev + 1);
      
      if (okeyCallCount >= 2) {
        showMessage('⚠️ Çok fazla yanlış OKEY çağrısı!', 'warning');
      }
    }
  }, [drawnTile, myHand, okeyCallCount, showMessage]);

  const handleNewGame = useCallback(() => {
    setGameRound(prev => prev + 1);
    initializeGame();
  }, []);

  const getTileCount = useCallback((playerIndex: number) => {
    if (playerIndex === myPlayerIndex) {
      return myHand.length + (drawnTile ? 1 : 0);
    }
    return players[playerIndex]?.tiles.length || 13;
  }, [myPlayerIndex, myHand, drawnTile, players]);

  const canDiscard = currentPlayer === myPlayerIndex && !isProcessing && (selectedTile !== null || drawnTile !== null || draggedTileIndex !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950 p-2 md:p-4 overflow-hidden relative select-none">
      {/* Realistic table felt with wood border effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Wood border frame */}
        <div className="absolute inset-0 border-[20px] md:border-[30px]" style={{
          borderImage: 'linear-gradient(135deg, #78350f, #451a03, #78350f, #92400e) 1',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
        }}></div>
        {/* Felt texture */}
        <div className="absolute inset-[20px] md:inset-[30px]" style={{
          background: `
            radial-gradient(ellipse at center, rgba(6, 78, 59, 0.95) 0%, rgba(6, 95, 70, 0.98) 50%, rgba(6, 78, 59, 0.95) 100%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 6px),
            radial-gradient(circle at 25% 35%, rgba(255,255,255,0.04) 0%, transparent 40%),
            radial-gradient(circle at 75% 65%, rgba(255,255,255,0.04) 0%, transparent 40%)
          `,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6)',
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto mb-3">
        <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl rounded-2xl p-3 md:p-4 border-2 border-amber-500/50 shadow-2xl" style={{
          boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-amber-300">
              <span className="text-2xl">🎴</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-amber-400 tracking-wide drop-shadow-lg">OKEY</h1>
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span>Round {gameRound}</span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewGame}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white rounded-xl transition-all text-sm font-semibold shadow-lg hover:shadow-emerald-500/40 border border-emerald-400/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Yeni Oyun</span>
            </button>
            <button
              onClick={onLeaveGame}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white rounded-xl transition-all text-sm font-semibold shadow-lg hover:shadow-red-500/40 border border-red-400/30"
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
              className={`bg-black/50 backdrop-blur-md rounded-xl p-2 md:p-3 border-2 transition-all duration-300 ${
                currentPlayer === index + 1 
                  ? 'border-amber-400 shadow-lg shadow-amber-400/50 scale-105' 
                  : 'border-amber-500/30 hover:border-amber-500/50'
              }`}
              style={{
                boxShadow: currentPlayer === index + 1 
                  ? '0 10px 30px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white/20">
                    {player.username[0]}
                  </div>
                  <span className="text-white font-semibold text-xs md:text-sm drop-shadow-md">{player.username}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/25 px-2.5 py-1 rounded-full border border-amber-500/40">
                  <span className="text-amber-400 font-bold text-xs md:text-sm">{getTileCount(index + 1)}</span>
                  <span className="text-amber-200 text-xs">🀄</span>
                </div>
              </div>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {player.tiles.slice(0, 4).map((tile) => (
                  <RealisticTile key={tile.id} tile={tile} small hidden />
                ))}
                {player.tiles.length > 4 && (
                  <div className="w-8 h-12 md:w-10 md:h-14 bg-black/60 rounded-md flex items-center justify-center text-white/70 text-xs font-bold border border-white/20 shadow-lg">
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
          <div 
            className="bg-black/50 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-amber-500/40 flex flex-col items-center justify-center gap-3 shadow-xl"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2 font-semibold drop-shadow-md">Çekme Taşı</p>
              <div className="relative">
                <RealisticTile 
                  tile={deck[0] || { id: 'empty', color: 'red', value: 1, is_okey: false, is_fake_okey: false }} 
                  hidden
                  disabled={deck.length === 0 || currentPlayer !== myPlayerIndex || isProcessing || drawnTile !== null}
                  onClick={handleDraw}
                />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-amber-200 text-xs font-bold whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {deck.length} kaldı
                </div>
                {currentPlayer === myPlayerIndex && deck.length > 0 && !drawnTile && !isProcessing && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">
                    <span className="text-white text-sm">👆</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2 font-semibold drop-shadow-md flex items-center justify-center gap-1">
                <Hand className="w-3 h-3" />
                Atılan Taşlar
              </p>
              <div className={`flex gap-1 flex-wrap justify-center min-h-[60px] max-w-[150px] transition-all duration-200 ${
                dragOverDiscard ? 'bg-green-500/30 rounded-lg scale-105' : ''
              }`} style={{
                ...(dragOverDiscard ? { boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' } : {}),
              }}>
                {discardPile.slice(-4).map((tile) => (
                  <RealisticTile key={tile.id} tile={tile} small />
                ))}
                {discardPile.length === 0 && (
                  <div className="text-white/40 text-xs flex items-center italic">Boş</div>
                )}
              </div>
            </div>
          </div>

          {/* Indicator & Okey Info */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-amber-500/40 flex flex-col items-center justify-center gap-3 shadow-xl" style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2 font-semibold drop-shadow-md">Gösterge</p>
              {indicatorTile && <RealisticTile tile={indicatorTile} />}
            </div>
            
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-2 font-semibold flex items-center justify-center gap-1">
                <span className="text-amber-400 drop-shadow-md">OKEY</span>
                <span>⭐</span>
              </p>
              {okeyTile && (
                <div className="relative inline-block">
                  <RealisticTile tile={okeyTile} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl border-2 border-white" style={{
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.9)',
                  }}>
                    <span className="text-base">⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-amber-500/40 shadow-xl" style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-amber-400 drop-shadow-md" />
              <h3 className="text-amber-400 font-bold text-sm md:text-base drop-shadow-md">Oyun Durumu</h3>
            </div>
            
            <div className="space-y-2">
              <div className="bg-amber-500/15 rounded-lg p-2.5 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <p className="text-amber-200 text-xs font-semibold">Sıra</p>
                </div>
                <p className="text-white font-bold text-sm drop-shadow-md">{players[currentPlayer]?.username}</p>
              </div>
              
              <div className={`rounded-lg p-2.5 border ${
                message.includes('✅') || message.includes('🎉') ? 'bg-green-500/20 border-green-500/40' :
                message.includes('⚠️') || message.includes('❌') ? 'bg-red-500/20 border-red-500/40' :
                'bg-emerald-500/20 border-emerald-500/40'
              }`}>
                <p className="text-white text-sm font-medium drop-shadow-md">{message}</p>
              </div>
              
              <button
                onClick={handleOkeyCall}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex || isProcessing}
                className="w-full py-2.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-amber-400 hover:via-orange-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg hover:shadow-amber-500/40 border border-amber-400/30"
              >
                🎉 OKEY!
              </button>
            </div>
          </div>
        </div>

        {/* Drawn Tile Area */}
        {drawnTile && (
          <div className="relative z-10 mb-3">
            <div className="bg-gradient-to-r from-green-600/40 to-emerald-600/40 backdrop-blur-md rounded-xl p-4 border-2 border-green-400/60 shadow-2xl animate-pulse" style={{
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-green-200 text-xs mb-2 font-semibold flex items-center justify-center gap-1 drop-shadow-md">
                    <CheckCircle className="w-3 h-3" />
                    Çektiğin Taş
                  </p>
                  <RealisticTile tile={drawnTile} isDrawn />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUseDrawnTile}
                    className="px-5 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-lg transition-all text-sm shadow-lg border border-emerald-400/30"
                  >
                    ✋ Eli Al
                  </button>
                  <button
                    onClick={handleDiscardDrawnTile}
                    className="px-5 py-2.5 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold rounded-lg transition-all text-sm shadow-lg border border-red-400/30"
                  >
                    🗑️ At
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Hand */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl p-4 border-2 border-amber-500/50 shadow-2xl" style={{
          boxShadow: '0 10px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-amber-300">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-amber-400 font-bold text-base md:text-lg drop-shadow-md">Senin Elin</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-amber-500/25 px-3 py-1.5 rounded-full border border-amber-500/40">
                <Trophy className="w-4 h-4 text-amber-400 drop-shadow-md" />
                <span className="text-amber-200 text-sm font-bold drop-shadow-md">{getTileCount(myPlayerIndex)} taş</span>
              </div>
              {currentPlayer === myPlayerIndex && (
                <div className="flex items-center gap-2 bg-green-500/25 px-3 py-1.5 rounded-full border border-green-500/40 animate-pulse">
                  <Sparkles className="w-4 h-4 text-green-400 drop-shadow-md" />
                  <span className="text-green-200 text-sm font-bold drop-shadow-md">Sıra Sende</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center min-h-[100px] pb-3">
            {myHand.map((tile, index) => (
              <RealisticTile
                key={tile.id}
                tile={tile}
                selected={selectedTile === index}
                onClick={() => handleTileClick(index)}
                disabled={gameState !== 'playing' || currentPlayer !== myPlayerIndex || isProcessing || drawnTile !== null}
                inHand={true}
                isDragging={draggedTileIndex === index}
              />
            ))}
          </div>
          
          {canDiscard && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={handleDiscard}
                disabled={!canDiscard}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-b from-red-500 via-pink-600 to-red-700 text-white font-bold rounded-xl hover:from-red-400 hover:via-pink-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/30"
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 rounded-3xl p-8 max-w-md w-full border-2 border-amber-500/60 shadow-2xl" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce border-4 border-amber-300">
                <span className="text-5xl">🎴</span>
              </div>
              <h2 className="text-3xl font-black text-amber-400 mb-3 drop-shadow-lg">Oyuna Hazır mısın?</h2>
              <p className="text-emerald-200 text-sm drop-shadow-md">Diğer oyuncular da hazır olduğunda oyun başlayacak.</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleReady}
                className="w-full py-4 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 text-white font-black rounded-xl hover:from-amber-400 hover:via-orange-400 hover:to-red-400 transition-all shadow-xl hover:shadow-amber-500/40 text-lg border border-amber-400/30"
              >
                ✅ Hazırım!
              </button>
              
              <button
                onClick={handleSimulateOtherPlayers}
                className="w-full py-4 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-all border border-white/30 backdrop-blur-sm"
              >
                🤖 Diğer Oyuncuları Simüle Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OKEY Confirmation Modal */}
      {showOkeyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 rounded-3xl p-8 max-w-md w-full border-2 border-amber-500/60 shadow-2xl text-center" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-amber-400 mb-3 drop-shadow-lg">OKEY Çağır!</h2>
            <p className="text-emerald-200 text-sm mb-6 drop-shadow-md">
              En az 10 çift taşın varsa OKEY diyebilirsin. Emin misin?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={confirmOkey}
                className="w-full py-4 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 text-white font-black rounded-xl hover:from-amber-400 hover:via-orange-400 hover:to-red-400 transition-all shadow-xl hover:shadow-amber-500/40 text-lg border border-amber-400/30"
              >
                🎉 EVET, OKEY!
              </button>
              
              <button
                onClick={() => setShowOkeyModal(false)}
                className="w-full py-4 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-all border border-white/30 backdrop-blur-sm"
              >
                ❌ Hayır, Bekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Finished Modal */}
      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 rounded-3xl p-8 max-w-md w-full border-2 border-amber-500/60 shadow-2xl text-center" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div className="text-9xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl font-black text-amber-400 mb-3 drop-shadow-lg">OKEY!</h2>
            <p className="text-emerald-200 mb-6 text-lg drop-shadow-md">{message}</p>
            
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="flex-1 py-4 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 text-white font-black rounded-xl hover:from-amber-400 hover:via-orange-400 hover:to-red-400 transition-all shadow-xl hover:shadow-amber-500/40 text-lg border border-amber-400/30"
              >
                🔄 Yeni Oyun
              </button>
              <button
                onClick={onLeaveGame}
                className="flex-1 py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black rounded-xl transition-all shadow-xl text-lg border border-red-400/30"
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
