import React, { useState } from 'react';
import type { GameState, StartRule, GameMode, BoardTheme } from '../types/backgammon';
import { RotateCcw, Lightbulb, Settings, Trophy } from 'lucide-react';

interface ControlsProps {
  gameState: GameState;
  onUndoMove: () => void;
  onGetHint: () => void;
  onOfferDouble: () => void;
  onRespondDouble: (accept: boolean) => void;
  onNewGame: (config: {
    startRule: StartRule;
    gameMode: GameMode;
    boardTheme: BoardTheme;
  }) => void;
  pipWhite: number;
  pipBlack: number;
  showSettings: boolean;
  onCloseSettings: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  gameState,
  onUndoMove,
  onGetHint,
  onOfferDouble,
  onRespondDouble,
  onNewGame,
  pipWhite,
  pipBlack,
  showSettings,
  onCloseSettings,
}) => {
  const {
    currentTurn,
    turnPhase,
    turnHistory,
    gameMode,
    startRule,
    boardTheme,
    doublingCube,
    winner,
    winType,
  } = gameState;

  const [selectedStartRule, setSelectedStartRule] = useState<StartRule>(startRule);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(gameMode);
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>(boardTheme);

  const isAITurn = gameMode === 'ai' && currentTurn === 'black';

  const handleStartNewGame = () => {
    onNewGame({
      startRule: selectedStartRule,
      gameMode: selectedGameMode,
      boardTheme: selectedTheme,
    });
    onCloseSettings();
  };

  return (
    <div className="w-full max-w-[1180px] flex flex-col gap-2.5">
      {/* Secondary action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 rounded-[13px] bg-white/[0.03] border border-[#c9a24a]/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="w-3 h-3 rounded-full border border-[#a9822f]" style={{ background: 'radial-gradient(circle at 35% 30%,#fdf6e8,#e0c894 70%)' }} />
            <span className="text-[#d8c096]">Hvit pip: {pipWhite}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="w-3 h-3 rounded-full border border-[#050506]" style={{ background: 'radial-gradient(circle at 35% 30%,#4a4a52,#0a0a0c 70%)' }} />
            <span className="text-[#8fa9d6]">Svart pip: {pipBlack}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUndoMove}
            disabled={turnHistory.length === 0 || isAITurn}
            className="px-3 py-2 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-[#f3e9d8] font-bold text-xs flex items-center gap-1.5 border border-[#c9a24a]/25 cursor-pointer"
            title="Angre siste trekk"
          >
            <RotateCcw className="w-4 h-4" /> Angre
          </button>

          <button
            onClick={onGetHint}
            disabled={turnPhase !== 'move' || isAITurn}
            className="px-3 py-2 rounded-[10px] bg-[#e8cd85]/15 hover:bg-[#e8cd85]/25 disabled:opacity-40 text-[#e8cd85] font-bold text-xs flex items-center gap-1.5 border border-[#e8cd85]/35 cursor-pointer"
            title="Få et anbefalt trekk"
          >
            <Lightbulb className="w-4 h-4" /> Hint
          </button>

          <button
            onClick={onOfferDouble}
            disabled={turnPhase !== 'roll' || doublingCube.offered || isAITurn}
            className="px-3 py-2 rounded-[10px] bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 disabled:opacity-40 text-[#93c5fd] font-bold text-xs flex items-center gap-1.5 border border-[#3b82f6]/35 cursor-pointer"
            title="Doble innsatsen"
          >
            Doble ({doublingCube.value}x)
          </button>
        </div>
      </div>

      {/* Doubling Offer Modal */}
      {doublingCube.offered && doublingCube.offeredBy !== currentTurn && (
        <div className="fixed inset-0 bg-[rgba(10,5,2,.72)] flex items-center justify-center p-4 z-[300]">
          <div className="bg-gradient-to-br from-[#2a1710] to-[#1a0d05] border border-[#3b82f6]/40 p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-modal-in">
            <div className="w-12 h-12 rounded-full bg-[#3b82f6]/20 text-[#93c5fd] flex items-center justify-center font-black text-xl border border-[#3b82f6]/40">
              {doublingCube.value * 2}x
            </div>
            <h3 className="text-xl font-bold text-[#f3e9d8] m-0">
              {doublingCube.offeredBy === 'white' ? 'Hvit' : 'Svart'} tilbyr dobling!
            </h3>
            <p className="text-sm text-[#d8c8ac] m-0">
              Innsatsen økes til {doublingCube.value * 2}x. Godtar du eller gir du opp turen?
            </p>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => onRespondDouble(true)}
                className="flex-1 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#60a5fa] text-white font-bold text-sm cursor-pointer"
              >
                Godta ({doublingCube.value * 2}x)
              </button>
              <button
                onClick={() => onRespondDouble(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#e2574c] hover:bg-[#ec7a70] text-white font-bold text-sm cursor-pointer"
              >
                Gi opp turen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings / New Game Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-[rgba(10,5,2,.72)] flex items-center justify-center p-4 z-[300]">
          <div className="bg-[#1a0d05] border border-[#c9a24a]/40 p-6 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-5 animate-modal-in">
            <div className="flex items-center justify-between border-b border-[#c9a24a]/20 pb-3">
              <h3 className="text-xl font-bold text-[#f3e9d8] flex items-center gap-2 m-0">
                <Settings className="w-5 h-5 text-[#e8cd85]" /> Nytt Spill &amp; Innstillinger
              </h3>
              <button
                onClick={onCloseSettings}
                className="text-[#b8a488] hover:text-[#f3e9d8] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#e8cd85] uppercase tracking-wider">
                Start-konfigurasjon (Regel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStartRule('inne')}
                  className={`p-3 rounded-xl border text-left cursor-pointer ${
                    selectedStartRule === 'inne'
                      ? 'bg-[#e8cd85]/15 border-[#e8cd85]/50 text-[#e8cd85]'
                      : 'bg-white/[0.03] border-[#c9a24a]/20 text-[#b8a488]'
                  }`}
                >
                  <div className="font-bold text-sm">Begynne Inne</div>
                  <div className="text-[11px] opacity-80 mt-1">Standard backgammon med 15 brikker plassert på brettet.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStartRule('ute')}
                  className={`p-3 rounded-xl border text-left cursor-pointer ${
                    selectedStartRule === 'ute'
                      ? 'bg-[#e8cd85]/15 border-[#e8cd85]/50 text-[#e8cd85]'
                      : 'bg-white/[0.03] border-[#c9a24a]/20 text-[#b8a488]'
                  }`}
                >
                  <div className="font-bold text-sm">Begynne Ute</div>
                  <div className="text-[11px] opacity-80 mt-1">Alle 15 brikker starter i reserve utenfor brettet.</div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#e8cd85] uppercase tracking-wider">Spillemodus</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGameMode('pvp')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm cursor-pointer ${
                    selectedGameMode === 'pvp'
                      ? 'bg-[#e8cd85]/15 border-[#e8cd85]/50 text-[#e8cd85]'
                      : 'bg-white/[0.03] border-[#c9a24a]/20 text-[#b8a488]'
                  }`}
                >
                  👥 1 mot 1 (Pass &amp; Play)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGameMode('ai')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm cursor-pointer ${
                    selectedGameMode === 'ai'
                      ? 'bg-[#e8cd85]/15 border-[#e8cd85]/50 text-[#e8cd85]'
                      : 'bg-white/[0.03] border-[#c9a24a]/20 text-[#b8a488]'
                  }`}
                >
                  👧 Mot Linnea
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#e8cd85] uppercase tracking-wider">Brett-Tema</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mahogany', 'leather', 'cyber'] as BoardTheme[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`py-2 rounded-lg border text-xs font-bold capitalize cursor-pointer ${
                      selectedTheme === theme
                        ? 'bg-[#e8cd85]/15 border-[#e8cd85]/50 text-[#e8cd85]'
                        : 'bg-white/[0.03] border-[#c9a24a]/20 text-[#b8a488]'
                    }`}
                  >
                    {theme === 'mahogany' ? '🪵 Mahogni' : theme === 'leather' ? '🖤 Skinn' : '⚡ Cyber'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartNewGame}
              className="mt-2 py-3 rounded-xl bg-gradient-to-br from-[#e8cd85] to-[#8a6a24] text-[#2a1710] font-extrabold text-base cursor-pointer"
            >
              Start Nytt Spill
            </button>
          </div>
        </div>
      )}

      {/* Winner Screen Modal */}
      {winner && (
        <div className="fixed inset-0 bg-[rgba(10,5,2,.72)] flex items-center justify-center p-4 z-[300]">
          <div className="relative bg-gradient-to-br from-[#2a1710] to-[#1a0d05] border border-[#c9a24a]/40 p-9 rounded-[20px] max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-3 animate-modal-in">
            <Trophy className="w-11 h-11 text-[#e8cd85]" />
            <h2 className="text-[28px] m-0 text-[#e8cd85]">
              {winner === 'white' ? 'Hvit vinner!' : `${gameMode === 'ai' ? 'Linnea' : 'Svart'} vinner!`}
            </h2>
            <p className="text-[13px] text-[#b8a488] m-0 uppercase tracking-wider">
              {winType === 'backgammon'
                ? '🔥 Backgammon-seier (3x poeng)'
                : winType === 'gammon'
                ? '⚡ Gammon-seier (2x poeng)'
                : 'Standard seier (1x poeng)'}
            </p>

            <button
              onClick={() => onNewGame({ startRule, gameMode, boardTheme })}
              className="mt-3 py-3 px-7 rounded-xl bg-gradient-to-br from-[#e8cd85] to-[#8a6a24] text-[#2a1710] font-extrabold text-sm cursor-pointer"
            >
              Nytt parti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
