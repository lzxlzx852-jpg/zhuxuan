
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

  // Initialize level
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
        // Match!
        setLevelPairs(prev => prev.map(p => p.id === first.pairId ? { ...p, solved: true } : p));
        setGameState(prev => {
          const newSolvedCount = prev.solvedCount + 1;
          const isLevelDone = newSolvedCount === levelPairs.length;
          return {
            ...prev,
            selectedPart: null,
            solvedCount: newSolvedCount,
            gameStatus: isLevelDone ? 'level-complete' : 'playing'
          };
        });
      } else {
        // Wrong match
        setGameState(prev => ({ ...prev, selectedPart: null }));
      }
    }
  }, [gameState.selectedPart, levelPairs.length]);

  const toggleHint = () => {
    setGameState(prev => ({ ...prev, hintEnabled: !prev.hintEnabled }));
  };

  const handleBackToStart = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'start',
      selectedPart: null,
      solvedCount: 0
    }));
  };

  const currentLevelInfo = useMemo(() => 
    GAME_LEVELS.find(l => l.levelNumber === gameState.currentLevel), 
  [gameState.currentLevel]);

  const totalLevels = GAME_LEVELS.length;

  const previewResult = useMemo(() => {
    if (!gameState.selectedPart || !gameState.hintEnabled) return null;
    const pair = levelPairs.find(p => p.id === gameState.selectedPart!.pairId);
    return pair ? pair.result : null;
  }, [gameState.selectedPart, levelPairs, gameState.hintEnabled]);

  const nextLevel = () => {
    setShowFullPoem(false);
    if (gameState.currentLevel < totalLevels) {
      setGameState(prev => ({ 
        ...prev, 
        currentLevel: prev.currentLevel + 1, 
        gameStatus: 'playing',
        solvedCount: 0
      }));
    } else {
      setGameState(prev => ({ ...prev, gameStatus: 'game-over' }));
    }
  };

  const startGame = () => {
    setGameState({
      ...gameState,
      currentLevel: 1,
      selectedPart: null,
      solvedCount: 0,
      gameStatus: 'playing'
    });
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center justify-between p-4 md:p-8 relative">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col items-center relative">
        {/* Back Button - Parallel to Smart Toggle, positioned left */}
        {gameState.gameStatus !== 'start' && (
          <div className="absolute left-0 top-1/2 -translate-y-[calc(50%+20px)] group z-20">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-red-900/60 font-serif mb-1 uppercase tracking-widest pl-1">退出挑战</span>
              <button 
                onClick={handleBackToStart}
                className="w-20 h-8 bg-amber-50 border-2 border-red-900/40 rounded shadow-inner cursor-pointer flex items-center justify-center transition-all hover:border-red-900/80 hover:bg-amber-100 group-active:scale-95"
              >
                <span className="text-xs font-bold text-red-900/80 font-serif flex items-center gap-1">
                  <span className="text-sm">↩</span> 返回
                </span>
              </button>
            </div>
            {/* Tooltip for Back Button */}
            <div className="absolute left-0 top-full mt-3 w-40 p-2 bg-amber-50 border-2 border-red-900/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 pointer-events-none z-50 text-[10px] text-neutral-600 font-serif">
              返回主菜单，进度将不会保存。
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl text-red-900 mb-2 font-bold tracking-widest drop-shadow-sm">
          汉字偏旁组字闯关
        </h1>
        
        {/* Horizontal Sliding Switch In a Box - Positioned slightly higher */}
        {gameState.gameStatus === 'playing' && (
          <div className="absolute right-0 top-1/2 -translate-y-[calc(50%+20px)] group z-20">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-red-900/60 font-serif mb-1 uppercase tracking-widest pr-1">智能助手</span>
              <div 
                onClick={toggleHint}
                className="w-20 h-8 bg-amber-50 border-2 border-red-900/40 rounded shadow-inner cursor-pointer relative overflow-hidden transition-all hover:border-red-900/80 flex items-center"
              >
                {/* Labels Layer */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 flex items-center justify-center text-xs font-bold text-neutral-400">关</div>
                  <div className="flex-1 flex items-center justify-center text-xs font-bold text-neutral-400">开</div>
                </div>
                
                {/* Sliding Thumb Box */}
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] transition-all duration-300 ease-in-out rounded shadow-sm flex items-center justify-center text-xs font-bold ${
                    gameState.hintEnabled 
                      ? 'left-[calc(50%+2px)] bg-red-800 text-amber-50' 
                      : 'left-[2px] bg-neutral-600 text-white'
                  }`}
                >
                  {gameState.hintEnabled ? '开' : '关'}
                </div>
                
                {/* Subtle frame glare */}
                <div className="absolute inset-0 pointer-events-none border-t border-white/40 border-l border-white/20" />
              </div>
            </div>
            
            {/* Hover Tooltip Description */}
            <div className="absolute right-0 top-full mt-3 w-60 p-4 bg-amber-50 border-2 border-red-900/20 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 pointer-events-none z-50 text-xs text-neutral-700 leading-relaxed font-serif animate-in fade-in slide-in-from-top-1">
              <div className="font-bold text-red-900 mb-1 border-b border-red-900/10 pb-1 flex items-center gap-1">
                <span className="text-sm">💡</span> 智能助手说明
              </div>
              开启后，当您选择一个偏旁时：
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>系统将<span className="text-red-800 font-bold">高亮</span>另一侧可匹配的棋子</li>
                <li>底部预览区将展示即将组成的<span className="text-red-800 font-bold">目标汉字</span></li>
              </ul>
              <div className="mt-3 text-[10px] opacity-50 text-center italic border-t border-red-900/5 pt-1">点击滑块框可切换开关状态</div>
            </div>
          </div>
        )}

        {gameState.gameStatus !== 'start' && gameState.gameStatus !== 'game-over' && (
          <div className="w-full bg-amber-100 h-6 rounded-full border border-red-900/30 overflow-hidden relative shadow-inner mt-2">
            <div 
              className="bg-red-800 h-full transition-all duration-700 ease-out" 
              style={{ width: `${(gameState.solvedCount / (levelPairs.length || 1)) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-950 uppercase tracking-widest">
               进度 {gameState.solvedCount} / {levelPairs.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-6xl flex flex-col justify-center items-center my-4 overflow-hidden">
        {gameState.gameStatus === 'start' && (
          <div className="text-center p-12 bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl relative">
            <p className="text-2xl text-neutral-800 mb-8 font-serif leading-relaxed">
              古诗蕴义 · 偏旁传情<br/>
              <span className="text-lg opacity-60 italic">寻找契合部首，共赏经典篇章</span>
            </p>
            <button 
              onClick={startGame}
              className="bg-red-900 text-amber-50 px-16 py-4 rounded-full text-2xl font-bold hover:bg-red-800 shadow-xl transition-all"
            >
              入阵挑战
            </button>
          </div>
        )}

        {gameState.gameStatus === 'playing' && (
          <div className="w-full h-full flex flex-col">
            <div className="text-center mb-6">
               <span className="text-red-900 font-serif border-b-2 border-red-900/40 pb-1 text-xl px-4">
                  《{currentLevelInfo?.poemTitle}》· {currentLevelInfo?.poemAuthor}
               </span>
            </div>

            <div className="flex flex-wrap justify-center mb-6 gap-3">
              {levelPairs.map(p => (
                <div key={p.id} className={`w-14 h-14 rounded-md flex items-center justify-center text-3xl transition-all duration-500 ${p.solved ? 'bg-red-900 text-amber-100 shadow-lg scale-110 border-2 border-amber-400' : 'bg-black/5 text-transparent border-2 border-dashed border-red-900/20'}`}>
                  {p.solved ? p.result : ''}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col md:flex-row w-full gap-4 relative">
              {/* Left Pool */}
              <div className="flex-1 bg-black/5 rounded-2xl p-4 flex flex-col items-center border border-black/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-neutral-800 text-amber-50 px-4 py-1 rounded-br-lg text-sm font-bold tracking-widest z-10">偏旁</div>
                <div className="flex flex-wrap justify-center content-center h-full">
                  {leftParts.map(part => {
                    const isSolved = levelPairs.find(p => p.id === part.pairId)?.solved;
                    const isSelected = gameState.selectedPart?.id === part.id;
                    const isHinted = gameState.hintEnabled && 
                                     gameState.selectedPart !== null && 
                                     !gameState.selectedPart.id.endsWith('-0') && 
                                     gameState.selectedPart.pairId === part.pairId;
                    return (
                      <ChessPiece
                        key={part.id}
                        content={part.content}
                        onClick={() => handlePartClick(part.id, part.content, part.pairId)}
                        isSelected={isSelected}
                        isHinted={isHinted}
                        isSolved={isSolved}
                        color="black"
                        size="md"
                      />
                    );
                  })}
                </div>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center px-4">
                 <div className="w-px h-full bg-red-900/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f4e4bc] py-8 text-red-900 font-bold vertical-text text-xl tracking-[1em] opacity-40" style={{ writingMode: 'vertical-rl' }}>
                      楚河汉界
                    </div>
                 </div>
              </div>

              {/* Right Pool */}
              <div className="flex-1 bg-red-900/5 rounded-2xl p-4 flex flex-col items-center border border-red-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-900 text-amber-50 px-4 py-1 rounded-bl-lg text-sm font-bold tracking-widest z-10">部首/余部</div>
                <div className="flex flex-wrap justify-center content-center h-full">
                  {rightParts.map(part => {
                    const isSolved = levelPairs.find(p => p.id === part.pairId)?.solved;
                    const isSelected = gameState.selectedPart?.id === part.id;
                    const isHinted = gameState.hintEnabled && 
                                     gameState.selectedPart !== null && 
                                     !gameState.selectedPart.id.endsWith('-1') && 
                                     gameState.selectedPart.pairId === part.pairId;
                    return (
                      <ChessPiece
                        key={part.id}
                        content={part.content}
                        onClick={() => handlePartClick(part.id, part.content, part.pairId)}
                        isSelected={isSelected}
                        isHinted={isHinted}
                        isSolved={isSolved}
                        color="red"
                        size="md"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'level-complete' && (
          <div className="w-full max-w-2xl bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl p-8 animate-in zoom-in duration-500 relative">
             <div className="absolute top-0 left-0 w-full h-4 bg-red-900" />
             <div className="text-center mb-6">
                <span className="text-lg text-red-900 font-serif opacity-70">通关赏析</span>
                <h2 className="text-4xl text-neutral-900 font-bold my-4 font-serif">《{currentLevelInfo?.poemTitle}》</h2>
                <div className="bg-white/50 p-6 rounded-xl border border-red-900/10 mb-6 shadow-inner">
                   <p className="text-3xl text-red-900 font-bold mb-4 tracking-widest">
                      {currentLevelInfo?.fullLine}
                   </p>
                   <hr className="border-red-900/10 my-4" />
                   <p className="text-lg text-neutral-700 leading-relaxed text-left">
                      <strong className="text-red-900">释义：</strong>{currentLevelInfo?.meaning}
                   </p>
                </div>
             </div>
             <div className="flex flex-col md:flex-row justify-center gap-4">
                <button 
                  onClick={() => setShowFullPoem(true)}
                  className="bg-amber-100 text-red-900 border-2 border-red-900 px-8 py-3 rounded-full text-xl font-bold hover:bg-amber-200 transition-all active:scale-95"
                >
                  查看完整诗词
                </button>
                <button 
                  onClick={nextLevel}
                  className="bg-red-900 text-amber-50 px-12 py-3 rounded-full text-2xl font-bold hover:bg-red-800 shadow-xl transition-all active:scale-95"
                >
                  下一关
                </button>
             </div>
          </div>
        )}

        {gameState.gameStatus === 'game-over' && (
          <div className="text-center p-12 bg-amber-50 rounded-2xl border-4 border-red-900 shadow-2xl">
            <h2 className="text-5xl text-red-900 font-bold mb-6">金榜题名</h2>
            <p className="text-2xl mb-10 font-serif">您已通关全部小学古诗名句关卡！</p>
            <button onClick={startGame} className="bg-red-900 text-amber-50 px-16 py-4 rounded-full text-2xl font-bold">温故知新</button>
          </div>
        )}
      </div>

      {/* Level Indicator - Bottom Right */}
      {gameState.gameStatus !== 'start' && (
        <div className="fixed bottom-6 right-8 pointer-events-none">
          <div className="bg-red-900/10 backdrop-blur-sm border border-red-900/20 px-4 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-right duration-500">
            <span className="text-red-900 font-serif font-bold tracking-widest">
              <span className="text-xl">{gameState.currentLevel}</span>
              <span className="mx-1 opacity-40">/</span>
              <span className="text-sm opacity-60">{totalLevels}</span>
              <span className="ml-1 text-sm">关</span>
            </span>
          </div>
        </div>
      )}

      {/* Full Poem Modal */}
      {showFullPoem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-amber-50 w-full max-w-lg rounded-xl border-4 border-red-900 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom duration-500">
              <div className="bg-red-900 p-4 text-amber-50 flex justify-between items-center">
                 <span className="text-xl font-bold tracking-widest">诗词全篇</span>
                 <button onClick={() => setShowFullPoem(false)} className="text-2xl font-bold">×</button>
              </div>
              <div className="p-8 text-center font-serif">
                 <h3 className="text-3xl text-neutral-900 font-bold mb-2">《{currentLevelInfo?.poemTitle}》</h3>
                 <p className="text-lg text-red-900 mb-8 tracking-widest">{currentLevelInfo?.poemAuthor}</p>
                 <div className="space-y-4 text-2xl text-neutral-800 tracking-wider">
                    {currentLevelInfo?.fullPoem.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                 </div>
              </div>
              <div className="p-6 flex justify-center border-t border-red-900/10">
                 <button onClick={() => setShowFullPoem(false)} className="bg-red-900 text-amber-50 px-12 py-2 rounded-full font-bold">返回</button>
              </div>
           </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="w-full max-w-2xl bg-white/30 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center border border-white/50 shadow-sm">
        <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-3 opacity-60">组合预测</div>
        <div className="flex items-center gap-6 h-20">
          {gameState.selectedPart ? (
            <div className="flex items-center animate-in zoom-in duration-200">
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl font-bold shadow-md ${gameState.selectedPart.id.endsWith('-0') ? 'bg-neutral-800 text-amber-50 border-neutral-900' : 'bg-red-900 text-amber-50 border-red-950'}`}>
                {gameState.selectedPart.content}
              </div>
              <span className="mx-4 text-4xl text-red-900 font-light">+</span>
              <div className="w-16 h-16 border-2 border-dashed border-red-900/30 rounded-full flex items-center justify-center text-red-900/20 text-2xl">
                ?
              </div>
              
              {gameState.hintEnabled && (
                <>
                  <span className="mx-4 text-4xl text-red-900">=</span>
                  <div className="relative group">
                     <div className="w-16 h-16 bg-red-800/20 text-red-900/40 rounded-lg flex items-center justify-center text-4xl font-bold border-2 border-red-900/10 animate-pulse">
                        {previewResult}
                     </div>
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap bg-red-900 text-amber-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        目标汉字
                     </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-neutral-400 font-serif italic">指选棋子，合气成文</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
