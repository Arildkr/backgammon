import React from 'react';
import type { Player } from '../types/backgammon';

interface TurnLegendProps {
  currentTurn: Player;
  gameOver: boolean;
}

export const TurnLegend: React.FC<TurnLegendProps> = ({ currentTurn, gameOver }) => {
  const active = !gameOver;

  return (
    <div className="w-full max-w-[1180px] flex flex-wrap gap-2.5 mb-2">
      <div
        className={`flex-1 min-w-[230px] flex items-center gap-2.5 py-2.5 px-4 rounded-[13px] bg-white/[0.03] border border-[#3b82f6]/30 ${
          active && currentTurn === 'black' ? 'animate-turn-glow' : ''
        }`}
      >
        <span
          className="w-[15px] h-[15px] rounded-full border-2 border-[#050506] shrink-0"
          style={{ background: 'radial-gradient(circle at 35% 30%, #4a4a52, #0a0a0c 70%)' }}
        />
        <span className="text-[12.5px] text-[#cfe0ff] font-bold">Svart</span>
        <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#8fa9d6]">
          <span className="bg-[#3b82f6]/20 border border-[#3b82f6]/40 py-0.5 px-2 rounded-[7px]">1</span>
          <span className="tracking-[-3px] text-[#5b7bb8] font-black">›››</span>
          <span className="bg-[#3b82f6]/20 border border-[#3b82f6]/40 py-0.5 px-2 rounded-[7px]">24</span>
        </span>
        <span className="ml-auto text-[11px] font-bold text-[#8fa9d6] bg-[#3b82f6]/10 border border-[#3b82f6]/30 py-[3px] px-2 rounded-lg">
          Hjem 19–24
        </span>
      </div>

      <div
        className={`flex-1 min-w-[230px] flex items-center gap-2.5 py-2.5 px-4 rounded-[13px] bg-white/[0.03] border border-[#c9a24a]/30 ${
          active && currentTurn === 'white' ? 'animate-turn-glow' : ''
        }`}
      >
        <span
          className="w-[15px] h-[15px] rounded-full border-2 border-[#a9822f] shrink-0"
          style={{ background: 'radial-gradient(circle at 35% 30%, #fdf6e8, #e0c894 70%)' }}
        />
        <span className="text-[12.5px] text-[#f3e0a8] font-bold">Hvit</span>
        <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#d8c096]">
          <span className="bg-[#c9a24a]/20 border border-[#c9a24a]/40 py-0.5 px-2 rounded-[7px]">24</span>
          <span className="tracking-[-3px] text-[#c9a24a] font-black">›››</span>
          <span className="bg-[#c9a24a]/20 border border-[#c9a24a]/40 py-0.5 px-2 rounded-[7px]">1</span>
        </span>
        <span className="ml-auto text-[11px] font-bold text-[#e8cd85] bg-[#c9a24a]/[0.13] border border-[#c9a24a]/30 py-[3px] px-2 rounded-lg">
          Hjem 1–6
        </span>
      </div>
    </div>
  );
};
