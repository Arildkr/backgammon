import React from 'react';
import { Dices } from 'lucide-react';

interface DiceProps {
  dice: number[];
  remainingDice: number[];
  isRolling: boolean;
  onRoll?: () => void;
  canRoll?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  dice,
  remainingDice,
  isRolling,
  onRoll,
  canRoll = false,
}) => {
  const getDieStatus = (value: number, index: number) => {
    const remainingCount = remainingDice.filter((d) => d === value).length;
    const sameValuesBefore = dice.slice(0, index).filter((d) => d === value).length;
    return sameValuesBefore < remainingCount;
  };

  const renderDots = (value: number) => {
    const dotPositions: { [key: number]: number[] } = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const activeIndices = dotPositions[value] || [];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 w-full h-full items-center justify-items-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
              activeIndices.includes(i)
                ? 'bg-slate-950 shadow-inner scale-100'
                : 'bg-transparent scale-0'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4 py-2 select-none">
      {canRoll ? (
        <button
          onClick={onRoll}
          disabled={isRolling}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base flex items-center gap-2.5 border border-amber-300 cursor-pointer animate-pulse"
        >
          <Dices className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
          <span>TRILL TERNINGER</span>
        </button>
      ) : dice.length > 0 ? (
        <div className="flex items-center gap-3 bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
          {dice.map((val, idx) => {
            const isAvailable = getDieStatus(val, idx);
            return (
              <div key={idx} className="relative group">
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-xl transition-all duration-500 flex items-center justify-center ${
                    isRolling
                      ? 'animate-[spin_0.4s_linear_infinite] scale-110 rotate-45'
                      : isAvailable
                      ? 'scale-100 opacity-100 shadow-amber-500/20 hover:scale-105'
                      : 'scale-90 opacity-40 grayscale'
                  }`}
                  style={{
                    boxShadow: isAvailable
                      ? '0 10px 25px -5px rgba(245, 158, 11, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)'
                      : 'none',
                  }}
                >
                  {renderDots(val)}

                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 rounded-2xl backdrop-blur-[1px]">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Brukt
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-semibold px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
          Venter på neste tur...
        </div>
      )}
    </div>
  );
};
