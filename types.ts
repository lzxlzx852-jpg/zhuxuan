
export interface CharacterPair {
  id: string;
  result: string;
  parts: [string, string];
  solved: boolean;
}

export interface GameLevel {
  levelNumber: number;
  grade: string;
  pairs: CharacterPair[];
  poemTitle: string;
  poemAuthor: string;
  fullLine: string;
  meaning: string;
  fullPoem: string[]; // 每行诗为一个字符串数组项
}

export interface GameState {
  currentLevel: number;
  selectedPart: { id: string; content: string; pairId: string } | null;
  solvedCount: number;
  gameStatus: 'playing' | 'level-complete' | 'game-over' | 'start';
  hintEnabled: boolean;
}
