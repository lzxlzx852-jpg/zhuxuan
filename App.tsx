
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GAME_LEVELS } from './constants';
import { GameState, CharacterPair } from './types';
import ChessPiece from './components/ChessPiece';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    selectedPart: null,
    solvedCount: 0,
    gameStatus: 'start',
    hintEnabled: true,
  });

  const [levelPairs, setLevelPairs] = useState<CharacterPair[]>([]);
  const [leftParts, setLeftParts] = useState<{ id: string; content: string; pairId: string }[]>([]);
  const [rightParts, setRightParts] = useState<{ id: string; content: string; pairId: string }[]>([]);
  const [showFullPoem, setShowFullPoem] = useState(false);

  // Programmatic Sound Effect: Chess Clack (Wooden feedback)
  const playChessClickSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
      
      setTimeout(() => {
        if (audioCtx.state !== 'closed') audioCtx.close();
      }, 200);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, []);

  // Programmatic Sound Effect: Button Pop (UI feedback)
  const playButtonSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
      
      setTimeout(() => {
        if (audioCtx.state !== 'closed') audioCtx.close();
      }, 200);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, []);

  // Programmatic Sound Effect: Level Complete Chime
  const playLevelCompleteSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playNote(392, now, 0.4);
      playNote(523, now + 0.15, 0.6);
      
      setTimeout(() => {
        if (audioCtx.state !== 'closed') audioCtx.close();
      }, 1000);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'level-complete') {
      const currentLevelData = GAME_LEVELS.find(l => l.levelNumber === gameState.currentLevel);
      if (currentLevelData) {
        const pairs = currentLevelData.pairs.map(p => ({ ...p, solved: false }));
        setLevelPairs(pairs);
        const leftPool = pairs.map(p => ({ id: `${p.id}-0`, content: p.parts[0], pairId: p.id }));
        const rightPool = pairs.map(p => ({ id: `${p.id}-1`, content: p.parts[1], pairId: p.id }));
        setLeftParts(leftPool.sort(() => Math.random() - 0.5));
        setRightParts(rightPool.sort(() => Math.random() - 0.5));
        if (gameState.gameStatus === 'playing' && gameState.solvedCount === 0) {
          setGameState(prev => ({ ...prev, selectedPart: null }));
        }
      }
    }
  }, [gameState.currentLevel, gameState.gameStatus]);

  const handlePartClick = useCallback((id: string, content: string, pairId: string) => {
    playChessClickSound();
    if (gameState.selectedPart === null) {
      setGameState(prev => ({ ...prev, selectedPart: { id, content, pairId } }));
    } else {
      const first = gameState.selectedPart;
      const second = { id, content, pairId };
      if (first.id === second.id) {
        setGameState(prev => ({ ...prev, selectedPart: null }));
        return;
      }
      if (first.pairId === second.pairId) {
        setLevelPairs(prev => prev.map(p => p.id === first.pairId ? { ...p, solved: true } : p));
        const isLevelDone = (gameState.solvedCount + 1) === levelPairs.length;
        if (isLevelDone) playLevelCompleteSound();
        setGameState(prev => ({
          ...prev,
          selectedPart: null,
          solvedCount: prev.solvedCount + 1,
          gameStatus: isLevelDone ? 'level-complete' : 'playing'
        }));
      } else {
        setGameState(prev => ({ ...prev, selectedPart: null }));
      }
    }
  }, [gameState.selectedPart, gameState.solvedCount, levelPairs.length, playChessClickSound, playLevelCompleteSound]);

  const toggleHint = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, hintEnabled: !prev.hintEnabled }));
  };

  const handleBackToStart = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, gameStatus: 'start', selectedPart: null, solvedCount: 0 }));
  };

  const currentLevelInfo = useMemo(() => GAME_LEVELS.find(l => l.levelNumber === gameState.currentLevel), [gameState.currentLevel]);
  const totalLevels = GAME_LEVELS.length;
  const previewResult = useMemo(() => {
    if (!gameState.selectedPart || !gameState.hintEnabled) return null;
    const pair = levelPairs.find(p => p.id === gameState.selectedPart!.pairId);
    return pair ? pair.result : null;
  }, [gameState.selectedPart, levelPairs, gameState.hintEnabled]);

  const nextLevel = () => {
    playButtonSound();
    setShowFullPoem(false);
    if (gameState.currentLevel < totalLevels) {
      setGameState(prev => ({ ...prev, currentLevel: prev.currentLevel + 1, gameStatus: 'playing', solvedCount: 0 }));
    } else {
      setGameState(prev => ({ ...prev, gameStatus: 'game-over' }));
    }
  };

  const startGame = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, currentLevel: 1, selectedPart: null, solvedCount: 0, gameStatus: 'playing' }));
  };

  const handleShowFullPoem = () => {
    playButtonSound();
    setShowFullPoem(true);
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Responsive Header Container */}
      <div className="w-full max-w-4xl flex flex-col items-center z-20">
        <div className="w-full flex justify-between items-end mb-4 sm:mb-2">
          {/* Back Button Container */}
          {gameState.gameStatus !== 'start' ? (
            <div className="relative group">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-red-900/60 font-serif mb-0.5 uppercase tracking-widest pl-1">退出挑战</span>
                <button 
                  onClick={handleBackToStart}
                  className="px-3 py-1 bg-amber-50 border border-red-900/40 rounded shadow-sm text-xs font-bold text-red-900/80 font-serif flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span>↩</span> 返回
                </button>
              </div>
              <div className="absolute left-0 top-full mt-2 w-32 p-2 bg-amber-50 border border-red-900/20 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 text-[10px] text-neutral-600 font-serif hidden sm:block">
                返回主菜单，进度将不保存。
              </div>
            </div>
          ) : <div className="w-16" />}

          {/* Title */}
          <h1 className="text-xl sm:text-4xl md:text-5xl text-red-900 font-bold tracking-widest drop-shadow-sm text-center mb-0 sm:mb-1 flex-1 px-2">
            汉字偏旁组字闯关
          </h1>

          {/* Smart Toggle Container */}
          {gameState.gameStatus === 'playing' ? (
            <div className="relative group">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-red-900/60 font-serif mb-0.5 uppercase tracking-widest pr-1">智能助手</span>
                <div 
                  onClick={toggleHint}
                  className="w-14 h-6 sm:w-20 sm:h-8 bg-amber-50 border border-red-900/40 rounded shadow-inner cursor-pointer relative overflow-hidden flex items-center"
                >
                  <div className="absolute inset-0 flex pointer-events-none">
                    <div className="flex-1 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-neutral-400">关</div>
                    <div className="flex-1 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-neutral-400">开</div>
                  </div>
                  <div 
                    className={`absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] transition-all duration-300 rounded shadow-sm flex items-center justify-center text-[10px] sm:text-xs font-bold z-10 ${
                      gameState.hintEnabled ? 'left-[calc(50%+2px)] bg-red-800 text-amber-50' : 'left-[2px] bg-neutral-600 text-white'
                    }`}
                  >
                    {gameState.hintEnabled ? '开' : '关'}
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-amber-50 border border-red-900/20 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 text-[10px] sm:text-xs text-neutral-700 leading-relaxed font-serif hidden sm:block">
                <div className="font-bold text-red-900 mb-1 border-b border-red-900/10 pb-1">💡 智能助手说明</div>
                开启后将提供匹配高亮与汉字预览。
              </div>
            </div>
          ) : <div className="w-14 sm:w-20" />}
        </div>

        {/* Progress Bar */}
        {gameState.gameStatus !== 'start' && gameState.gameStatus !== 'game-over' && (
          <div className="w-full bg-amber-100 h-4 sm:h-6 rounded-full border border-red-900/30 overflow-hidden relative shadow-inner mb-4">
            <div 
              className="bg-red-800 h-full transition-all duration-700 ease-out" 
              style={{ width: `${(gameState.solvedCount / (levelPairs.length || 1)) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-red-950 uppercase tracking-widest">
               进度 {gameState.solvedCount} / {levelPairs.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-6xl flex flex-col justify-center items-center overflow-y-auto">
        {gameState.gameStatus === 'start' && (
          <div className="text-center p-8 sm:p-12 bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl relative max-w-sm sm:max-w-none">
            <p className="text-xl sm:text-2xl text-neutral-800 mb-8 font-serif leading-relaxed">
              古诗蕴义 · 偏旁传情<br/>
              <span className="text-sm sm:text-lg opacity-60 italic">寻找契合部首，共赏经典篇章</span>
            </p>
            <button 
              onClick={startGame}
              className="bg-red-900 text-amber-50 px-10 py-3 sm:px-16 sm:py-4 rounded-full text-xl sm:text-2xl font-bold hover:bg-red-800 shadow-xl transition-all active:scale-95"
            >
              入阵挑战
            </button>
          </div>
        )}

        {gameState.gameStatus === 'playing' && (
          <div className="w-full h-full flex flex-col">
            <div className="text-center mb-4 sm:mb-6">
               <span className="text-red-900 font-serif border-b-2 border-red-900/40 pb-1 text-base sm:text-xl px-4">
                  《{currentLevelInfo?.poemTitle}》· {currentLevelInfo?.poemAuthor}
               </span>
            </div>

            <div className="flex flex-wrap justify-center mb-4 sm:mb-6 gap-2 sm:gap-3">
              {levelPairs.map(p => (
                <div key={p.id} className={`w-10 h-10 sm:w-14 sm:h-14 rounded-md flex items-center justify-center text-xl sm:text-3xl transition-all duration-500 ${p.solved ? 'bg-red-900 text-amber-100 shadow-lg scale-105 sm:scale-110 border-2 border-amber-400' : 'bg-black/5 text-transparent border-2 border-dashed border-red-900/20'}`}>
                  {p.solved ? p.result : ''}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col md:flex-row w-full gap-2 sm:gap-4 relative overflow-hidden">
              <div className="flex-1 bg-black/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col items-center border border-black/10 relative overflow-y-auto">
                <div className="absolute top-0 left-0 bg-neutral-800 text-amber-50 px-2 py-0.5 sm:px-4 sm:py-1 rounded-br-lg text-[10px] sm:text-sm font-bold tracking-widest z-10">偏旁</div>
                <div className="flex flex-wrap justify-center content-center py-4">
                  {leftParts.map(part => {
                    const isSolved = levelPairs.find(p => p.id === part.pairId)?.solved;
                    const isSelected = gameState.selectedPart?.id === part.id;
                    const isHinted = gameState.hintEnabled && gameState.selectedPart !== null && !gameState.selectedPart.id.endsWith('-0') && gameState.selectedPart.pairId === part.pairId;
                    return (
                      <ChessPiece key={part.id} content={part.content} onClick={() => handlePartClick(part.id, part.content, part.pairId)} isSelected={isSelected} isHinted={isHinted} isSolved={isSolved} color="black" size="md" />
                    );
                  })}
                </div>
              </div>

              <div className="flex md:flex-col items-center justify-center px-1 py-1 md:px-4">
                 <div className="w-full h-px md:w-px md:h-full bg-red-900/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f4e4bc] px-2 py-1 md:py-8 text-red-900 font-bold text-[10px] sm:text-xl tracking-widest opacity-40 uppercase whitespace-nowrap">
                      <span className="hidden md:block" style={{ writingMode: 'vertical-rl' }}>楚河汉界</span>
                      <span className="md:hidden">楚河 汉界</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 bg-red-900/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col items-center border border-red-900/10 relative overflow-y-auto">
                <div className="absolute top-0 right-0 bg-red-900 text-amber-50 px-2 py-0.5 sm:px-4 sm:py-1 rounded-bl-lg text-[10px] sm:text-sm font-bold tracking-widest z-10">部首/余部</div>
                <div className="flex flex-wrap justify-center content-center py-4">
                  {rightParts.map(part => {
                    const isSolved = levelPairs.find(p => p.id === part.pairId)?.solved;
                    const isSelected = gameState.selectedPart?.id === part.id;
                    const isHinted = gameState.hintEnabled && gameState.selectedPart !== null && !gameState.selectedPart.id.endsWith('-1') && gameState.selectedPart.pairId === part.pairId;
                    return (
                      <ChessPiece key={part.id} content={part.content} onClick={() => handlePartClick(part.id, part.content, part.pairId)} isSelected={isSelected} isHinted={isHinted} isSolved={isSolved} color="red" size="md" />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'level-complete' && (
          <div className="w-full max-w-2xl bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl p-6 sm:p-8 animate-in zoom-in duration-500 relative">
             <div className="text-center mb-4 sm:mb-6">
                <span className="text-sm sm:text-lg text-red-900 font-serif opacity-70">通关赏析</span>
                <h2 className="text-2xl sm:text-4xl text-neutral-900 font-bold my-2 sm:my-4 font-serif">《{currentLevelInfo?.poemTitle}》</h2>
                <div className="bg-white/50 p-4 sm:p-6 rounded-xl border border-red-900/10 mb-4 sm:mb-6 shadow-inner">
                   <p className="text-xl sm:text-3xl text-red-900 font-bold mb-2 sm:mb-4 tracking-widest">
                      {currentLevelInfo?.fullLine}
                   </p>
                   <hr className="border-red-900/10 my-2 sm:my-4" />
                   <p className="text-sm sm:text-lg text-neutral-700 leading-relaxed text-left">
                      <strong className="text-red-900">释义：</strong>{currentLevelInfo?.meaning}
                   </p>
                </div>
             </div>
             <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <button 
                  onClick={handleShowFullPoem}
                  className="bg-amber-100 text-red-900 border border-red-900 px-6 py-2 rounded-full text-base sm:text-xl font-bold hover:bg-amber-200 active:scale-95 transition-all"
                >
                  查看完整诗词
                </button>
                <button 
                  onClick={nextLevel}
                  className="bg-red-900 text-amber-50 px-8 py-2 rounded-full text-lg sm:text-2xl font-bold hover:bg-red-800 shadow-xl active:scale-95 transition-all"
                >
                  下一关
                </button>
             </div>
          </div>
        )}

        {gameState.gameStatus === 'game-over' && (
          <div className="text-center p-8 sm:p-12 bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl text-red-900 font-bold mb-4 sm:mb-6">金榜题名</h2>
            <p className="text-lg sm:text-2xl mb-8 sm:mb-10 font-serif">您已通关全部小学古诗名句关卡！</p>
            <button onClick={startGame} className="bg-red-900 text-amber-50 px-12 py-3 rounded-full text-xl sm:text-2xl font-bold">温故知新</button>
          </div>
        )}
      </div>

      {/* Level Indicator */}
      {gameState.gameStatus !== 'start' && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 pointer-events-none z-30">
          <div className="bg-red-900/20 backdrop-blur-md border border-red-900/30 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-right duration-500">
            <span className="text-red-900 font-serif font-bold tracking-widest">
              <span className="text-lg sm:text-xl">{gameState.currentLevel}</span>
              <span className="mx-0.5 sm:mx-1 opacity-40">/</span>
              <span className="text-xs sm:text-sm opacity-60">{totalLevels}</span>
              <span className="ml-0.5 sm:ml-1 text-xs">关</span>
            </span>
          </div>
        </div>
      )}

      {/* Full Poem Modal */}
      {showFullPoem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-amber-50 w-full max-w-lg rounded-xl border-2 sm:border-4 border-red-900 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-500 max-h-[90vh] flex flex-col">
              <div className="bg-red-900 p-3 sm:p-4 text-amber-50 flex justify-between items-center shrink-0">
                 <span className="text-lg sm:text-xl font-bold tracking-widest">诗词全篇</span>
                 <button onClick={() => setShowFullPoem(false)} className="text-2xl font-bold p-1">×</button>
              </div>
              <div className="p-6 sm:p-8 text-center font-serif overflow-y-auto">
                 <h3 className="text-2xl sm:text-3xl text-neutral-900 font-bold mb-1 sm:mb-2">《{currentLevelInfo?.poemTitle}》</h3>
                 <p className="text-base sm:text-lg text-red-900 mb-6 sm:mb-8 tracking-widest">{currentLevelInfo?.poemAuthor}</p>
                 <div className="space-y-3 sm:space-y-4 text-xl sm:text-2xl text-neutral-800 tracking-wider">
                    {currentLevelInfo?.fullPoem.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                 </div>
              </div>
              <div className="p-4 flex justify-center border-t border-red-900/10 shrink-0">
                 <button onClick={() => setShowFullPoem(false)} className="bg-red-900 text-amber-50 px-10 py-2 rounded-full font-bold active:scale-95">返回</button>
              </div>
           </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="w-full max-w-2xl bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col items-center border border-white/50 shadow-sm mt-2 shrink-0">
        <div className="text-neutral-500 text-[8px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-3 opacity-60">组合预测</div>
        <div className="flex items-center gap-3 sm:gap-6 h-12 sm:h-20">
          {gameState.selectedPart ? (
            <div className="flex items-center animate-in zoom-in duration-200">
              <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center text-xl sm:text-3xl font-bold shadow-md ${gameState.selectedPart.id.endsWith('-0') ? 'bg-neutral-800 text-amber-50 border-neutral-900' : 'bg-red-900 text-amber-50 border-red-950'}`}>
                {gameState.selectedPart.content}
              </div>
              <span className="mx-2 sm:mx-4 text-2xl sm:text-4xl text-red-900 font-light">+</span>
              <div className="w-10 h-10 sm:w-16 sm:h-16 border border-dashed border-red-900/30 rounded-full flex items-center justify-center text-red-900/20 text-xl">
                ?
              </div>
              
              {gameState.hintEnabled && (
                <>
                  <span className="mx-2 sm:mx-4 text-2xl sm:text-4xl text-red-900">=</span>
                  <div className="relative">
                     <div className="w-10 h-10 sm:w-16 sm:h-16 bg-red-800/20 text-red-900/40 rounded-lg flex items-center justify-center text-2xl sm:text-4xl font-bold border border-red-900/10 animate-pulse">
                        {previewResult}
                     </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-neutral-400 text-xs sm:text-base font-serif italic">指选棋子，合气成文</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
