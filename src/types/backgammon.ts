export type Player = 'white' | 'black';

export type StartRule = 'inne' | 'ute'; // 'inne' = standard position, 'ute' = all 15 checkers start in off-board reserve

export type GameMode = 'pvp' | 'ai';

export type AIDifficulty = 'easy' | 'medium' | 'master';

export type BoardTheme = 'mahogany' | 'leather' | 'cyber';

export interface Move {
  from: number | 'bar' | 'reserve'; // 1-24, or 'bar', or 'reserve'
  to: number | 'off'; // 1-24, or 'off'
  dieValue: number;
  hit?: boolean;
}

export interface DoublingState {
  value: number; // 1, 2, 4, 8, 16, 32, 64
  owner: Player | 'center';
  offered: boolean;
  offeredBy?: Player;
}

export interface GameState {
  points: { [pointIndex: number]: Player[] }; // 1 to 24. Array of Player tags ('white' | 'black')
  bar: { white: number; black: number };
  off: { white: number; black: number };
  reserve: { white: number; black: number }; // Checkers waiting to enter in 'ute' start mode
  
  startRule: StartRule;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  boardTheme: BoardTheme;
  
  currentTurn: Player;
  dice: number[]; // e.g. [3, 5] or [6, 6, 6, 6]
  remainingDice: number[]; // Die values still available to use this turn
  isRolling: boolean;
  
  turnPhase: 'roll' | 'move' | 'turn_end' | 'game_over';
  selectedOrigin: number | 'bar' | 'reserve' | null;
  validMoves: Move[];
  
  turnHistory: Array<{
    points: { [pointIndex: number]: Player[] };
    bar: { white: number; black: number };
    off: { white: number; black: number };
    reserve: { white: number; black: number };
    remainingDice: number[];
    movesMade: Move[];
  }>;
  
  doublingCube: DoublingState;
  winner: Player | null;
  winType: 'normal' | 'gammon' | 'backgammon' | null;
  
  soundEnabled: boolean;
  stats: { whiteWins: number; blackWins: number };
}
