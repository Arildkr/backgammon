import React, { useState } from 'react';
import type { GameState, StartRule, GameMode, AIDifficulty, BoardTheme } from '../types/backgammon';
import { Dice } from './Dice';
import { RotateCcw, Lightbulb, Settings, Trophy } from 'lucide-react';

interface ControlsProps {
  gameState: GameState;
  onRollDice: () => void;
  onUndoMove: () => void;
  onGetHint: () => void;
  onOfferDouble: () => void;
  onRespondDouble: (accept: boolean) => void;
  onNewGame: (config: {
    startRule: StartRule;
    gameMode: GameMode;
    aiDifficulty: AIDifficulty;
    boardTheme: BoardTheme;
  }) => void;
  pipWhite: number;
  pipBlack: number;
}

export const Controls: React.FC<ControlsProps> = ({
  gameState,
  onRollDice,
  onUndoMove,
  onGetHint,
  onOfferDouble,
  onRespondDouble,
  onNewGame,
  pipWhite,
  pipBlack,
}) => {
  const {
    currentTurn,
    dice,
    remainingDice,
    isRolling,
    turnPhase,
    turnHistory,
    gameMode,
    aiDifficulty,
    startRule,
    boardTheme,
    doublingCube,
    winner,
    winType,
  } = gameState;

  const [showSettings, setShowSettings] = useState(false);
  const [selectedStartRule, setSelectedStartRule] = useState<StartRule>(startRule);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(gameMode);
  const [selectedAIDifficulty, setSelectedAIDifficulty] = useState<AIDifficulty>(aiDifficulty);
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>(boardTheme);

  const isAITurn = gameMode === 'ai' && currentTurn === 'black';

  const handleStartNewGame = () => {
    onNewGame({
      startRule: selectedStartRule,
      gameMode: selectedGameMode,
      aiDifficulty: selectedAIDifficulty,
      boardTheme: selectedTheme,
    });
    setShowSettings(false);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 mt-4 select-none">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Player Turn Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full animate-ping ${
              currentTurn === 'white' ? 'bg-amber-300 shadow-amber-300/50' : 'bg-slate-400 shadow-slate-400/50'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Nåværende Tur</span>
            <span className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
              {currentTurn === 'white' ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
                  Hvit Spiller
                </>
              ) : (
                <>
                  <span className="inline-block w-3 h-3 rounded-full bg-slate-800 border border-slate-600" />
                  {gameMode === 'ai' ? `Datamaskin (${aiDifficulty.toUpperCase()})` : 'Svart Spiller'}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Dice Area */}
        <div className="flex items-center gap-3">
          <Dice
            dice={dice}
            remainingDice={remainingDice}
            isRolling={isRolling}
            onRoll={onRollDice}
            canRoll={turnPhase === 'roll' && !isAITurn}
          />
        </div>

        {/* Buttons (Undo, Hint, Settings) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndoMove}
            disabled={turnHistory.length === 0 || isAITurn}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Angre siste trekk"
          >
            <RotateCcw className="w-4 h-4" /> Angre
          </button>

          <button
            onClick={onGetHint}
            disabled={turnPhase !== 'move' || isAITurn}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 text-amber-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border border-amber-500/40 transition-all cursor-pointer"
            title="Få et anbefalt trekk"
          >
            <Lightbulb className="w-4 h-4" /> Hint
          </button>

          <button
            onClick={onOfferDouble}
            disabled={turnPhase !== 'roll' || doublingCube.offered || isAITurn}
            className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 text-purple-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border border-purple-500/40 transition-all cursor-pointer"
            title="Doble innsatsen"
          >
            Doble ({doublingCube.value}x)
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Innstillinger og nytt spill"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pip Count & Advantage Meter */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-xs font-semibold text-slate-300">Hvit sin Pip Count:</span>
          </div>
          <span className="text-base font-black text-amber-300">{pipWhite}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600" />
            <span className="text-xs font-semibold text-slate-300">Svart sin Pip Count:</span>
          </div>
          <span className="text-base font-black text-slate-100">{pipBlack}</span>
        </div>
      </div>

      {/* Doubling Offer Modal */}
      {doublingCube.offered && doublingCube.offeredBy !== currentTurn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/50 p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl border border-purple-500/40">
              {doublingCube.value * 2}x
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              {doublingCube.offeredBy === 'white' ? 'Hvit' : 'Svart'} tilbyr dobling!
            </h3>
            <p className="text-sm text-slate-300">
              Innsatsen økes til {doublingCube.value * 2}x. Godtar du eller gir du opp turen?
            </p>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => onRespondDouble(true)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg cursor-pointer"
              >
                Godta ({doublingCube.value * 2}x)
              </button>
              <button
                onClick={() => onRespondDouble(false)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg cursor-pointer"
              >
                Gi opp turen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings / New Game Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Nytt Spill & Innstillinger
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Start Rule Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Start-konfigurasjon (Regel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStartRule('inne')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStartRule === 'inne'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm">Begynne Inne</div>
                  <div className="text-[11px] opacity-80 mt-1">Standard backgammon med 15 brikker plasert på brettet.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStartRule('ute')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStartRule === 'ute'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm">Begynne Ute</div>
                  <div className="text-[11px] opacity-80 mt-1">Alle 15 brikker starter i reserve utenfor brettet.</div>
                </button>
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Spillemodus
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGameMode('pvp')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                    selectedGameMode === 'pvp'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  👥 1 mot 1 (Pass & Play)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGameMode('ai')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                    selectedGameMode === 'ai'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  🤖 Mot Datamaskin
                </button>
              </div>
            </div>

            {/* AI Difficulty */}
            {selectedGameMode === 'ai' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Vanskelighetsgrad (AI)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'master'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedAIDifficulty(diff)}
                      className={`py-2 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                        selectedAIDifficulty === diff
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400'
                      }`}
                    >
                      {diff === 'easy' ? 'Enkel' : diff === 'medium' ? 'Medium' : 'Mester'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Brett-Tema
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mahogany', 'leather', 'cyber'] as BoardTheme[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`py-2 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                      selectedTheme === theme
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    {theme === 'mahogany' ? '🪵 Mahogni' : theme === 'leather' ? '🖤 Skinn' : '⚡ Cyber'}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartNewGame}
              className="mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Start Nytt Spill
            </button>
          </div>
        </div>
      )}

      {/* Winner Screen Modal */}
      {winner && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-400 shadow-lg animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-amber-300">
                {winner === 'white' ? 'Hvit Spiller Vant!' : 'Svart Spiller Vant!'}
              </h2>
              <p className="text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                {winType === 'backgammon' ? '🔥 BACKGAMMON SEIER (3x Poeng)!' : winType === 'gammon' ? '⚡ GAMMON SEIER (2x Poeng)!' : 'Standard Seier (1x Poeng)'}
              </p>
            </div>

            <button
              onClick={() => onNewGame({ startRule, gameMode, aiDifficulty, boardTheme })}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Spill Igjen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
