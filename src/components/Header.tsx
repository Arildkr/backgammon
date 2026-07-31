import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Dices } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  stats: { whiteWins: number; blackWins: number };
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  stats,
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <header className="w-full max-w-5xl flex items-center justify-between py-4 px-2 select-none">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Dices className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-200">
            Norsk Backgammon
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Støtter Spiller vs AI, Begynne Ute / Inne & 3D Kast
          </p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-3">
        {/* Win stats */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
          <span>Stilling:</span>
          <span className="text-amber-300">Hvit {stats.whiteWins}</span>
          <span>-</span>
          <span className="text-slate-100">Svart {stats.blackWins}</span>
        </div>

        {/* Rules button */}
        <button
          onClick={() => setShowRules(true)}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
          title="Regler & Forklaring"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
          title={soundEnabled ? 'Lyd på' : 'Lyd av'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 opacity-50" />}
        </button>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-amber-300">Backgammon Regler & Regeltilpassinger</h3>
              <button
                onClick={() => setShowRules(false)}
                className="text-slate-400 hover:text-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm text-slate-300 leading-relaxed">
              <h4 className="font-bold text-amber-400">1. Begynne Inne vs Begynne Ute</h4>
              <p>
                - <strong>Begynne Inne (Standard):</strong> Hver spiller starter med sine 15 brikker fordelt på brettet. Hvit beveger seg fra felt 24 ned mot felt 1. Svart beveger seg fra felt 1 opp mot felt 24.
              </p>
              <p>
                - <strong>Begynne Ute (Trikktrakk-variant):</strong> Alle 15 brikker starter i reserven utenfor brettet. Spillerne må trille terningene og flytte sine brikker inn på brettet underveis i spillet!
              </p>

              <h4 className="font-bold text-amber-400 mt-2">2. Flytting & Slåing (Blotting)</h4>
              <p>
                - Terningene bestemmer hvor mange felt du kan flytte. Doble terningkast gir deg 4 trekk!
              </p>
              <p>
                - Land på motstanderens enkeltbrikke (blot) for å slå den ut til BAR (midtfeltet). Brikker på BAR må flyttes inn i spillet igjen før andre brikker kan flyttes.
              </p>

              <h4 className="font-bold text-amber-400 mt-2">3. Utbearing ("Bear Off")</h4>
              <p>
                - Når alle dine 15 brikker er samlet i ditt eget indre felt (felt 1-6 for Hvit, felt 19-24 for Svart), kan du begynne å ta brikkene ut av brettet. Første spiller som får ut alle sine 15 brikker vinner!
              </p>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
            >
              Skjønner!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
