import React from 'react';
import type { Player, GameMode, AIDifficulty } from '../types/backgammon';

interface DiceBarProps {
  currentTurn: Player;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  gameOver: boolean;
  dice: number[];
  remainingDice: number[];
  isRolling: boolean;
  onRoll: () => void;
  canRoll: boolean;
}

const DOT_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const Die: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  const active = DOT_POSITIONS[value] || [];
  return (
    <div
      className={`w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#fdf6e8] to-[#e0c894] border-2 border-[#a9822f] grid grid-cols-3 grid-rows-3 p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.4)] ${
        rolling ? 'animate-dice-shake' : ''
      }`}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="self-center justify-self-center w-[7px] h-[7px] rounded-full"
          style={{ background: active.includes(i) ? '#3d2410' : 'transparent' }}
        />
      ))}
    </div>
  );
};

export const DiceBar: React.FC<DiceBarProps> = ({
  currentTurn,
  gameMode,
  aiDifficulty,
  gameOver,
  dice,
  remainingDice,
  isRolling,
  onRoll,
  canRoll,
}) => {
  const turnText = gameOver
    ? 'Partiet er over'
    : (currentTurn === 'white' ? 'Hvit sin tur' : 'Svart sin tur') +
      (currentTurn === 'black' && gameMode === 'ai' ? ` (AI ${aiDifficulty} tenker…)` : '');
  const turnLabelColor = currentTurn === 'white' ? '#f3e0a8' : '#93c5fd';

  const rollDisabled = !canRoll || isRolling || gameOver;
  const rollLabel = isRolling ? 'Kaster…' : remainingDice.length > 0 ? 'Trekk gjenstår' : 'Kast terninger';
  const displayDice = isRolling && dice.length === 0 ? [1, 1] : dice;

  return (
    <div className="w-full max-w-[1180px] flex items-center justify-center gap-4 mb-2.5 py-2.5 px-4.5 rounded-[14px] bg-white/[0.03] border border-[#c9a24a]/20 flex-wrap">
      <div className="text-[13px] font-bold min-w-[150px]" style={{ color: turnLabelColor }}>
        {turnText}
      </div>

      <div className="flex gap-2">
        {displayDice.map((d, i) => (
          <Die key={i} value={d} rolling={isRolling} />
        ))}
      </div>

      <div className="flex gap-1.5">
        {remainingDice.map((r, i) => (
          <div
            key={i}
            className="w-[22px] h-[22px] rounded-md bg-[#e8cd85]/15 border border-[#e8cd85]/40 flex items-center justify-center text-[11px] font-extrabold text-[#e8cd85]"
          >
            {r}
          </div>
        ))}
      </div>

      <button
        onClick={onRoll}
        disabled={rollDisabled}
        className="h-[42px] px-5 rounded-[11px] border-none text-[13px] font-extrabold text-[#2a1710]"
        style={{
          background: rollDisabled ? 'rgba(232,205,133,.35)' : 'linear-gradient(155deg,#e8cd85,#8a6a24)',
          cursor: rollDisabled ? 'default' : 'pointer',
          opacity: rollDisabled ? 0.55 : 1,
        }}
      >
        {rollLabel}
      </button>
    </div>
  );
};
