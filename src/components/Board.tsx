import React from 'react';
import type { GameState, Player } from '../types/backgammon';

interface BoardProps {
  gameState: GameState;
  onPointClick: (pointIndex: number) => void;
  onBarClick: (player: Player) => void;
  onReserveClick: (player: Player) => void;
  onOffClick: () => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  onPointClick,
  onBarClick,
  onReserveClick,
  onOffClick,
}) => {
  const {
    points,
    bar,
    off,
    reserve,
    currentTurn,
    selectedOrigin,
    validMoves,
    boardTheme,
    startRule,
  } = gameState;

  // Theme styling definitions
  const themeStyles = {
    mahogany: {
      boardBg: 'bg-[#2a1708] border-[#4a2b13]',
      feltBg: 'bg-[#1a2e22]', // Classic deep green felt
      woodFrame: 'border-[#5c3417] bg-[#3a1e0b]',
      pointLight: 'fill-[#d9ab7e]',
      pointDark: 'fill-[#6b3e26]',
      text: 'text-amber-200/90',
    },
    leather: {
      boardBg: 'bg-[#18181b] border-[#27272a]',
      feltBg: 'bg-[#0f172a]',
      woodFrame: 'border-[#3f3f46] bg-[#18181b]',
      pointLight: 'fill-[#94a3b8]',
      pointDark: 'fill-[#334155]',
      text: 'text-slate-300',
    },
    cyber: {
      boardBg: 'bg-[#090d16] border-[#1e293b]',
      feltBg: 'bg-[#050b14]',
      woodFrame: 'border-[#0284c7] bg-[#0c1425]',
      pointLight: 'fill-[#0284c7]',
      pointDark: 'fill-[#1e1b4b]',
      text: 'text-cyan-300',
    },
  }[boardTheme];

  const isSelected = (origin: number | 'bar' | 'reserve') => selectedOrigin === origin;

  // Get move target details if target
  const getTargetMove = (to: number | 'off') => {
    if (selectedOrigin === null) return null;
    return validMoves.find((m) => m.from === selectedOrigin && m.to === to) || null;
  };

  const renderCheckers = (checkers: Player[]) => {
    if (!checkers || checkers.length === 0) return null;

    const count = checkers.length;
    const player = checkers[0];
    const isWhite = player === 'white';

    return (
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="relative flex flex-col items-center">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full shadow-lg border-2 transition-all transform ${
                isWhite
                  ? 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-amber-300 shadow-amber-950/40 text-amber-950'
                  : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-slate-700 shadow-slate-950/80 text-amber-100'
              } ${i > 0 ? '-mt-4 sm:-mt-5 md:-mt-6' : ''}`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center border ${
                  isWhite ? 'border-amber-200/60' : 'border-slate-800/80'
                }`}
              >
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border ${
                    isWhite ? 'border-amber-400/40 bg-amber-200/50' : 'border-slate-700 bg-slate-800/50'
                  }`}
                />
              </div>
            </div>
          ))}

          {count > 5 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow-lg border border-amber-300">
              +{count - 5}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPointTriangle = (pointIndex: number, isTop: boolean) => {
    const isEven = pointIndex % 2 === 0;
    const colorClass = isEven ? themeStyles.pointDark : themeStyles.pointLight;
    const selected = isSelected(pointIndex);
    const targetMove = getTargetMove(pointIndex);
    const pointCheckers = points[pointIndex] || [];

    // Is this point inside a player's home board?
    const isWhiteHome = pointIndex >= 1 && pointIndex <= 6;
    const isBlackHome = pointIndex >= 19 && pointIndex <= 24;

    return (
      <div
        key={pointIndex}
        onClick={() => onPointClick(pointIndex)}
        className={`relative flex-1 h-full flex flex-col justify-${
          isTop ? 'start' : 'end'
        } items-center cursor-pointer group transition-all ${
          isWhiteHome && !isTop
            ? 'bg-amber-500/5 border-x border-amber-500/10'
            : isBlackHome && isTop
            ? 'bg-purple-500/5 border-x border-purple-500/10'
            : ''
        }`}
      >
        {/* SVG Triangle */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow"
          viewBox="0 0 100 300"
          preserveAspectRatio="none"
        >
          <polygon
            points={isTop ? '0,0 100,0 50,280' : '0,300 100,300 50,20'}
            className={`${colorClass} transition-opacity ${
              targetMove ? 'opacity-95' : 'opacity-80 group-hover:opacity-100'
            }`}
          />
        </svg>

        {/* Selected Highlight Glow */}
        {selected && (
          <div className="absolute inset-0 bg-amber-400/30 border-2 border-amber-400 rounded pointer-events-none animate-pulse z-10" />
        )}

        {/* Target Destination Indicator */}
        {targetMove && (
          <div className="absolute inset-x-0 my-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-500 border-2 border-emerald-200 shadow-xl shadow-emerald-500/60 flex flex-col items-center justify-center animate-bounce z-30 pointer-events-none">
            <span className="text-white text-[11px] font-black leading-none">
              +{targetMove.dieValue}
            </span>
          </div>
        )}

        {/* Number Label & Direction Arrow */}
        <div
          className={`absolute ${
            isTop ? 'top-1' : 'bottom-1'
          } flex items-center gap-0.5 z-20 opacity-80 group-hover:opacity-100`}
        >
          <span className={`text-[10px] sm:text-xs font-bold ${themeStyles.text}`}>
            {pointIndex}
          </span>
          <span className="text-[9px] text-amber-400/70 font-mono">
            {isTop ? '➔' : '◄'}
          </span>
        </div>

        {/* Checkers Stack */}
        <div className={`z-10 py-1 ${isTop ? 'pt-5' : 'pb-5'}`}>
          {renderCheckers(pointCheckers)}
        </div>
      </div>
    );
  };

  const whiteOffTarget = getTargetMove('off') && currentTurn === 'white';
  const blackOffTarget = getTargetMove('off') && currentTurn === 'black';

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-1.5 select-none">
      {/* Top Banner: Player Movement Directions */}
      <div className="w-full flex items-center justify-between px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600" />
          <span className="text-slate-300">Svart Retning:</span>
          <span className="text-slate-400 font-normal">Felt 1 ➔ 24 (Hjemmefelt: 19-24 Øverst Høyere)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-normal">Felt 24 ➔ 1 (Hjemmefelt: 1-6 Nederst Høyere)</span>
          <span className="text-amber-300">:Hvit Retning</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />
        </div>
      </div>

      {/* Main Board Container */}
      <div
        className={`relative w-full aspect-[16/10] sm:aspect-[16/9] p-3 sm:p-5 rounded-2xl border-4 sm:border-8 shadow-2xl ${themeStyles.boardBg} ${themeStyles.woodFrame} flex flex-col justify-between overflow-hidden`}
      >
        {/* Top Section: Points 13-18 (Left) | BAR | Points 19-24 (Right, Black Home) */}
        <div className={`relative flex-1 flex rounded-t-xl ${themeStyles.feltBg} border border-amber-900/30 overflow-hidden`}>
          {/* Reserve Tray Left Top (White Reserve for Begynne ute) */}
          {startRule === 'ute' && (
            <div
              onClick={() => onReserveClick('white')}
              className={`w-12 sm:w-16 h-full border-r-2 border-amber-900/50 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                isSelected('reserve') && currentTurn === 'white'
                  ? 'bg-amber-500/30 ring-2 ring-amber-400'
                  : 'hover:bg-white/5'
              }`}
              title="Hvit Reserve (Klikk for å flytte inn)"
            >
              <span className="text-[9px] sm:text-[10px] text-amber-200 font-bold mb-1">Reserve</span>
              {reserve.white > 0 ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-amber-200 text-amber-950 font-bold flex items-center justify-center text-xs shadow border border-amber-300 animate-pulse">
                  {reserve.white}
                </div>
              ) : (
                <span className="text-[9px] text-amber-400/40">Tom</span>
              )}
            </div>
          )}

          {/* Top Left Quadrant (Points 13 to 18) - Ytre felt */}
          <div className="flex-1 flex h-full relative">
            <span className="absolute top-1 left-2 text-[9px] font-bold text-amber-200/40 uppercase tracking-widest pointer-events-none">
              Ytre Felt (13-18)
            </span>
            {[13, 14, 15, 16, 17, 18].map((p) => renderPointTriangle(p, true))}
          </div>

          {/* Center BAR */}
          <div
            className={`w-12 sm:w-16 md:w-20 h-full bg-amber-950/90 border-x-2 border-amber-900/70 flex flex-col items-center justify-around py-2 z-20`}
          >
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-400/60 uppercase">
              BAR
            </span>

            {/* White on Bar */}
            <div
              onClick={() => onBarClick('white')}
              className={`cursor-pointer p-1 rounded-xl transition-all ${
                isSelected('bar') && currentTurn === 'white'
                  ? 'bg-amber-400/40 ring-2 ring-amber-400 animate-pulse'
                  : ''
              }`}
            >
              {bar.white > 0 && (
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-50 to-amber-200 border-2 border-amber-300 shadow-lg flex items-center justify-center font-bold text-amber-950 text-xs">
                    {bar.white}
                  </div>
                  <span className="text-[9px] text-amber-200 font-semibold mt-0.5">Hvit</span>
                </div>
              )}
            </div>

            {/* Black on Bar */}
            <div
              onClick={() => onBarClick('black')}
              className={`cursor-pointer p-1 rounded-xl transition-all ${
                isSelected('bar') && currentTurn === 'black'
                  ? 'bg-amber-400/40 ring-2 ring-amber-400 animate-pulse'
                  : ''
              }`}
            >
              {bar.black > 0 && (
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700 shadow-lg flex items-center justify-center font-bold text-amber-100 text-xs">
                    {bar.black}
                  </div>
                  <span className="text-[9px] text-amber-200 font-semibold mt-0.5">Svart</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Right Quadrant (Points 19 to 24) - SVART HJEMMEFELT */}
          <div className="flex-1 flex h-full relative bg-purple-950/20">
            <span className="absolute top-1 right-2 text-[9px] font-bold text-purple-300/60 uppercase tracking-widest pointer-events-none">
              Svart Hjemmefelt (19-24)
            </span>
            {[19, 20, 21, 22, 23, 24].map((p) => renderPointTriangle(p, true))}
          </div>

          {/* Off-board Tray Right Top (Black Bear Off) */}
          <div
            onClick={onOffClick}
            className={`w-12 sm:w-16 h-full border-l-2 border-amber-900/50 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
              blackOffTarget
                ? 'bg-emerald-500/40 ring-2 ring-emerald-400 animate-pulse'
                : 'hover:bg-white/5'
            }`}
            title="Svart Utbearing"
          >
            <span className="text-[9px] sm:text-[10px] text-purple-200 font-bold mb-1">Svart Ut</span>
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-amber-100 font-bold flex items-center justify-center text-xs shadow">
              {off.black}
            </div>
          </div>
        </div>

        {/* Center Divider Strip */}
        <div className="h-2 sm:h-3 bg-amber-950 border-y border-amber-900/60 flex items-center justify-center">
          <div className="w-20 h-1 bg-amber-500/40 rounded-full" />
        </div>

        {/* Bottom Section: Points 12-7 (Left) | BAR | Points 6-1 (Right, White Home) */}
        <div className={`relative flex-1 flex rounded-b-xl ${themeStyles.feltBg} border border-amber-900/30 overflow-hidden`}>
          {/* Reserve Tray Left Bottom (Black Reserve for Begynne ute) */}
          {startRule === 'ute' && (
            <div
              onClick={() => onReserveClick('black')}
              className={`w-12 sm:w-16 h-full border-r-2 border-amber-900/50 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                isSelected('reserve') && currentTurn === 'black'
                  ? 'bg-amber-500/30 ring-2 ring-amber-400'
                  : 'hover:bg-white/5'
              }`}
              title="Svart Reserve (Klikk for å flytte inn)"
            >
              <span className="text-[9px] sm:text-[10px] text-slate-300 font-bold mb-1">Reserve</span>
              {reserve.black > 0 ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-amber-100 font-bold flex items-center justify-center text-xs shadow border border-slate-700 animate-pulse">
                  {reserve.black}
                </div>
              ) : (
                <span className="text-[9px] text-slate-500">Tom</span>
              )}
            </div>
          )}

          {/* Bottom Left Quadrant (Points 12 to 7) - Ytre felt */}
          <div className="flex-1 flex h-full relative">
            <span className="absolute bottom-1 left-2 text-[9px] font-bold text-amber-200/40 uppercase tracking-widest pointer-events-none">
              Ytre Felt (7-12)
            </span>
            {[12, 11, 10, 9, 8, 7].map((p) => renderPointTriangle(p, false))}
          </div>

          {/* Center BAR Bottom Spacing */}
          <div className="w-12 sm:w-16 md:w-20 h-full bg-amber-950/90 border-x-2 border-amber-900/70 flex flex-col items-center justify-center">
            <div className="w-2 h-12 bg-amber-800/40 rounded-full" />
          </div>

          {/* Bottom Right Quadrant (Points 6 to 1) - HVIT HJEMMEFELT */}
          <div className="flex-1 flex h-full relative bg-amber-500/10">
            <span className="absolute bottom-1 right-2 text-[9px] font-bold text-amber-300/70 uppercase tracking-widest pointer-events-none">
              Hvit Hjemmefelt (1-6)
            </span>
            {[6, 5, 4, 3, 2, 1].map((p) => renderPointTriangle(p, false))}
          </div>

          {/* Off-board Tray Right Bottom (White Bear Off) */}
          <div
            onClick={onOffClick}
            className={`w-12 sm:w-16 h-full border-l-2 border-amber-900/50 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
              whiteOffTarget
                ? 'bg-emerald-500/40 ring-2 ring-emerald-400 animate-pulse'
                : 'hover:bg-white/5'
            }`}
            title="Hvit Utbearing"
          >
            <span className="text-[9px] sm:text-[10px] text-amber-200 font-bold mb-1">Hvit Ut</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-bold flex items-center justify-center text-xs shadow">
              {off.white}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
