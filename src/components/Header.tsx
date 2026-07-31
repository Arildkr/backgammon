import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw, Settings } from 'lucide-react';
import type { GameMode } from '../types/backgammon';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  gameMode: GameMode;
  onToggleGameMode: () => void;
  onQuickReset: () => void;
  onOpenSettings: () => void;
  stats: { whiteWins: number; blackWins: number };
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  gameMode,
  onToggleGameMode,
  onQuickReset,
  onOpenSettings,
  stats,
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <header className="w-full max-w-[1180px] flex flex-wrap items-center justify-between gap-3 px-1">
      {/* Logo + Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#e8cd85] to-[#8a6a24] grid grid-cols-2 gap-[5px] p-[7px] shadow-[0_8px_16px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.5)] shrink-0">
          <div className="rounded-full bg-[#2a1710]" />
          <div />
          <div />
          <div className="rounded-full bg-[#2a1710]" />
        </div>
        <div>
          <h1 className="text-[24px] leading-tight m-0">Backgammon med Linnea</h1>
          <p className="mt-0.5 text-xs text-[#b8a488]">Klikk eller dra brikkene for å flytte</p>
        </div>
      </div>

      {/* Controls cluster */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-[13px] py-2 rounded-[11px] bg-white/[0.04] border border-[#c9a24a]/25 text-xs font-bold">
          <span className="text-[#e8cd85]">Hvit {stats.whiteWins}</span>
          <span className="text-[#665842]">–</span>
          <span className="text-[#cfe0ff]">Svart {stats.blackWins}</span>
        </div>

        <button
          onClick={onToggleGameMode}
          className={`h-[38px] px-3.5 rounded-[11px] border border-[#c9a24a]/30 text-[#f3e9d8] text-xs font-bold cursor-pointer transition-colors ${
            gameMode === 'ai' ? 'bg-[#e8cd85]/15' : 'bg-white/[0.04]'
          }`}
        >
          {gameMode === 'ai' ? 'Spiller mot Linnea' : 'Spiller vs Spiller'}
        </button>

        <button
          onClick={() => setShowRules(true)}
          className="w-[38px] h-[38px] rounded-[11px] bg-white/[0.04] border border-[#c9a24a]/25 text-[#e8cd85] text-[15px] cursor-pointer flex items-center justify-center"
          title="Regler"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        <button
          onClick={onToggleSound}
          className="w-[38px] h-[38px] rounded-[11px] bg-white/[0.04] border border-[#c9a24a]/25 text-[#e8cd85] text-[15px] cursor-pointer flex items-center justify-center"
          title={soundEnabled ? 'Lyd på' : 'Lyd av'}
        >
          {soundEnabled ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px] opacity-60" />}
        </button>

        <button
          onClick={onQuickReset}
          className="w-[38px] h-[38px] rounded-[11px] bg-white/[0.04] border border-[#c9a24a]/25 text-[#e8cd85] text-[15px] cursor-pointer flex items-center justify-center"
          title="Start nytt parti"
        >
          <RotateCcw className="w-[17px] h-[17px]" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-[38px] h-[38px] rounded-[11px] bg-white/[0.04] border border-[#c9a24a]/25 text-[#e8cd85] text-[15px] cursor-pointer flex items-center justify-center"
          title="Innstillinger og nytt spill"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div
          onClick={() => setShowRules(false)}
          className="fixed inset-0 z-[300] bg-[rgba(10,5,2,0.7)] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[480px] w-full bg-[#1a0d05] border border-[#c9a24a]/40 rounded-[18px] p-7 animate-modal-in"
          >
            <h3 className="mt-0 mb-2.5 text-[#e8cd85]">Kort regeloversikt</h3>
            <p className="text-[13px] leading-relaxed text-[#d8c8ac] mb-3.5">
              Hvit flytter fra felt 24 mot felt 1. Svart flytter fra felt 1 mot felt 24. Kast to
              terninger, klikk en brikke for å se mulige trekk (grønne prikker), klikk målfeltet
              — eller dra brikken direkte. Slår du en enslig brikke havner den på baren og må inn
              igjen før andre trekk er lov. Alle 15 brikker må være i hjemmefeltet før du kan bære
              dem ut.
            </p>
            <button
              onClick={() => setShowRules(false)}
              className="py-2.5 px-4.5 rounded-[10px] bg-[#e8cd85]/15 border border-[#e8cd85]/40 text-[#e8cd85] font-bold text-[12.5px] cursor-pointer"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
