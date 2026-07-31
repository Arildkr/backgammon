import React, { useState, useEffect } from 'react';
import type { GameState, Player, BoardTheme } from '../types/backgammon';

interface BoardProps {
  gameState: GameState;
  onPointClick: (pointIndex: number) => void;
  onBarClick: (player: Player) => void;
  onReserveClick: (player: Player) => void;
  onOffClick: () => void;
  onExecuteMove: (from: number | 'bar' | 'reserve', to: number | 'off') => void;
  hitFlashPoint: number | null;
}

const THEMES: Record<
  BoardTheme,
  {
    frame: string;
    frameBorder: string;
    surface: string;
    triDark: string;
    triLight: string;
    homeWhite: string;
    homeBlack: string;
    numberColor: string;
  }
> = {
  mahogany: {
    frame: 'linear-gradient(160deg,#4a2c18,#2a1710 55%,#1a0d05)',
    frameBorder: 'rgba(201,162,74,.28)',
    surface: '#1a0d05',
    triDark: '#5a3a22',
    triLight: '#7a5232',
    homeWhite: 'rgba(201,162,74,.07)',
    homeBlack: 'rgba(59,130,246,.07)',
    numberColor: 'rgba(243,233,216,.55)',
  },
  leather: {
    frame: 'linear-gradient(160deg,#2e2e33,#18181b 55%,#0c0c0e)',
    frameBorder: 'rgba(148,163,184,.28)',
    surface: '#0f172a',
    triDark: '#334155',
    triLight: '#475569',
    homeWhite: 'rgba(148,163,184,.07)',
    homeBlack: 'rgba(59,130,246,.07)',
    numberColor: 'rgba(226,232,240,.55)',
  },
  cyber: {
    frame: 'linear-gradient(160deg,#0c1425,#090d16 55%,#03050a)',
    frameBorder: 'rgba(2,132,199,.35)',
    surface: '#050b14',
    triDark: '#1e1b4b',
    triLight: '#0284c7',
    homeWhite: 'rgba(2,132,199,.10)',
    homeBlack: 'rgba(2,132,199,.10)',
    numberColor: 'rgba(186,230,253,.6)',
  },
};

const CHECKER_WHITE_BG = 'radial-gradient(circle at 35% 30%,#fdf6e8,#e0c894 70%)';
const CHECKER_BLACK_BG = 'radial-gradient(circle at 35% 30%,#4a4a52,#0a0a0c 70%)';

export const Board: React.FC<BoardProps> = ({
  gameState,
  onPointClick,
  onBarClick,
  onReserveClick,
  onOffClick,
  onExecuteMove,
  hitFlashPoint,
}) => {
  const { points, bar, off, reserve, currentTurn, selectedOrigin, validMoves, boardTheme, startRule } =
    gameState;

  const [dragOrigin, setDragOrigin] = useState<number | 'bar' | 'reserve' | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragOrigin !== null) setDragPos({ x: e.clientX, y: e.clientY });
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (dragOrigin !== null) {
        const elem = document.elementFromPoint(e.clientX, e.clientY);
        const dropTarget = elem?.closest('[data-drop-target]');
        if (dropTarget) {
          const targetAttr = dropTarget.getAttribute('data-drop-target');
          if (targetAttr === 'off') {
            onExecuteMove(dragOrigin, 'off');
          } else if (targetAttr) {
            const targetPoint = parseInt(targetAttr, 10);
            if (!isNaN(targetPoint)) onExecuteMove(dragOrigin, targetPoint);
          }
        }
        setDragOrigin(null);
        setDragPos(null);
      }
    };
    if (dragOrigin !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragOrigin, onExecuteMove]);

  const theme = THEMES[boardTheme];

  const getTargetMove = (from: number | 'bar' | 'reserve' | null, to: number | 'off') => {
    if (from === null) return null;
    return validMoves.find((m) => m.from === from && m.to === to) || null;
  };
  const activeOrigin = selectedOrigin !== null ? selectedOrigin : dragOrigin;

  const handlePointerDownOrigin = (origin: number | 'bar' | 'reserve', e: React.PointerEvent) => {
    const hasValidMoves = validMoves.some((m) => m.from === origin);
    if (hasValidMoves) {
      setDragOrigin(origin);
      setDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  const renderChips = (checkers: Player[]) => {
    const count = checkers.length;
    if (count === 0) return null;
    const player = checkers[0];
    const maxShow = 4;
    const overflow = count > maxShow;
    const shown = overflow ? maxShow - 1 : count;
    return (
      <>
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="w-[80%] max-w-8 aspect-square rounded-full -mt-1.5 animate-chip-drop shadow-[0_3px_6px_rgba(0,0,0,.5),inset_0_1px_1px_rgba(255,255,255,.4)]"
            style={{
              background: player === 'white' ? CHECKER_WHITE_BG : CHECKER_BLACK_BG,
              border: `2px solid ${player === 'white' ? '#a9822f' : '#050506'}`,
            }}
          />
        ))}
        {overflow && (
          <div className="mt-0.5 bg-[#e8cd85] text-[#2a1710] text-[9px] font-extrabold py-px px-1.5 rounded-lg">
            ×{count}
          </div>
        )}
      </>
    );
  };

  const renderPoint = (pointIndex: number, isTop: boolean) => {
    const checkers = points[pointIndex] || [];
    const isSel = activeOrigin === pointIndex;
    const targetMove = getTargetMove(activeOrigin, pointIndex);
    const isHit = hitFlashPoint === pointIndex;
    const dark = pointIndex % 2 === 0;
    const startTag = pointIndex === 24 ? 'HVIT START' : pointIndex === 1 ? 'SVART START' : '';
    const startTagColor = pointIndex === 24 ? '#e8cd85' : '#93c5fd';
    const homeTint = pointIndex >= 19 ? theme.homeBlack : pointIndex <= 6 ? theme.homeWhite : 'transparent';

    return (
      <div
        key={pointIndex}
        data-drop-target={pointIndex}
        onClick={() => onPointClick(pointIndex)}
        onPointerDown={(e) => handlePointerDownOrigin(pointIndex, e)}
        className={`flex-1 h-full relative cursor-pointer flex flex-col ${
          isTop ? 'justify-start' : 'justify-end'
        }`}
        style={{ background: homeTint }}
      >
        <div
          className="absolute inset-0 opacity-90"
          style={{
            clipPath: isTop ? 'polygon(8% 0,92% 0,50% 88%)' : 'polygon(50% 12%,92% 100%,8% 100%)',
            background: dark ? theme.triDark : theme.triLight,
          }}
        />
        <span
          className={`relative z-[2] text-center text-[10px] font-bold ${isTop ? 'mt-[5px]' : 'mb-[5px]'}`}
          style={{ color: theme.numberColor }}
        >
          {pointIndex}
        </span>

        {startTag && (
          <div
            className={`absolute ${isTop ? 'top-0.5' : 'bottom-0.5'} right-0.5 text-[6.5px] font-extrabold tracking-wide bg-black/40 py-px px-1 rounded z-[3]`}
            style={{ color: startTagColor }}
          >
            {startTag}
          </div>
        )}

        {isSel && (
          <div className="absolute inset-0.5 border-2 border-[#e8cd85] rounded-[5px] z-[3] shadow-[0_0_12px_rgba(232,205,133,.5)] pointer-events-none" />
        )}

        {isHit && (
          <div
            className="absolute inset-0 z-[4] pointer-events-none animate-hit-flash"
            style={{ background: 'radial-gradient(circle,#e2574c,transparent 70%)' }}
          />
        )}

        {targetMove && (
          <div
            className="absolute left-1/2 w-7 h-7 rounded-full border-2 border-[#a7f3d0] flex items-center justify-center z-[5] pointer-events-none"
            style={{
              top: isTop ? '30%' : '70%',
              transform: 'translate(-50%,-50%)',
              background: '#34d399',
              boxShadow: '0 0 14px rgba(52,211,153,.7)',
              animation: 'targetPulse 1s ease-in-out infinite',
            }}
          >
            <span className="text-[10px] font-extrabold text-[#04241a]">{targetMove.dieValue}</span>
          </div>
        )}

        <div
          className={`z-[2] flex flex-col items-center relative ${
            isTop ? 'justify-start pt-4' : 'justify-end pb-4 flex-col-reverse'
          }`}
        >
          {renderChips(checkers)}
        </div>
      </div>
    );
  };

  const isSelBar = activeOrigin === 'bar';
  const isSelReserveWhite = activeOrigin === 'reserve' && currentTurn === 'white';
  const isSelReserveBlack = activeOrigin === 'reserve' && currentTurn === 'black';
  const offTargetActive = getTargetMove(activeOrigin, 'off');

  return (
    <div className="w-full max-w-[1180px] relative rounded-[22px] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7),inset_0_2px_3px_rgba(255,255,255,.08)] border" style={{ background: theme.frame, borderColor: theme.frameBorder }}>
      <div
        className="relative w-full aspect-[16/10] rounded-xl overflow-hidden flex shadow-[inset_0_0_40px_rgba(0,0,0,.6)]"
        style={{ background: theme.surface }}
      >
        {/* Reserve column (begynne ute) */}
        {startRule === 'ute' && (
          <div className="w-[8.5%] min-w-11 bg-gradient-to-b from-[#1a0d05] to-[#241407] border-x-2 border-[#c9a24a]/30 flex flex-col items-center relative z-10">
            <div
              data-drop-target="reserve-noop"
              onClick={() => onReserveClick('white')}
              onPointerDown={(e) => reserve.white > 0 && handlePointerDownOrigin('reserve', e)}
              className={`flex-1 w-full flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isSelReserveWhite ? 'shadow-[0_0_0_2px_#e8cd85_inset] rounded-[10px]' : ''
              }`}
            >
              {reserve.white > 0 && (
                <div
                  className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center font-extrabold text-xs animate-chip-drop shadow-[0_3px_7px_rgba(0,0,0,.5)]"
                  style={{ background: CHECKER_WHITE_BG, borderColor: '#a9822f', color: '#4a2c18' }}
                >
                  {reserve.white}
                </div>
              )}
              <span className="text-[8px] font-extrabold tracking-widest uppercase text-[#e8cd85]/55">
                Reserve
              </span>
            </div>
            <div
              data-drop-target="reserve-noop"
              onClick={() => onReserveClick('black')}
              onPointerDown={(e) => reserve.black > 0 && handlePointerDownOrigin('reserve', e)}
              className={`flex-1 w-full flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isSelReserveBlack ? 'shadow-[0_0_0_2px_#93c5fd_inset] rounded-[10px]' : ''
              }`}
            >
              <span className="text-[8px] font-extrabold tracking-widest uppercase text-[#93c5fd]/55">
                Reserve
              </span>
              {reserve.black > 0 && (
                <div
                  className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center font-extrabold text-xs text-[#f3e9d8] animate-chip-drop shadow-[0_3px_7px_rgba(0,0,0,.5)]"
                  style={{ background: CHECKER_BLACK_BG, borderColor: '#050506' }}
                >
                  {reserve.black}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">{[13, 14, 15, 16, 17, 18].map((p) => renderPoint(p, true))}</div>
          <div className="flex-1 flex">{[12, 11, 10, 9, 8, 7].map((p) => renderPoint(p, false))}</div>
        </div>

        {/* Bar column */}
        <div className="w-[8.5%] min-w-11 bg-gradient-to-b from-[#1a0d05] to-[#241407] border-x-2 border-[#c9a24a]/35 flex flex-col items-center relative z-10">
          <div
            data-drop-target="bar-noop"
            onClick={() => onBarClick('black')}
            onPointerDown={(e) => bar.black > 0 && handlePointerDownOrigin('bar', e)}
            className={`flex-1 w-full flex flex-col items-center justify-center gap-1 cursor-pointer ${
              isSelBar && currentTurn === 'black' ? 'shadow-[0_0_0_2px_#93c5fd_inset] rounded-[10px]' : ''
            }`}
          >
            <span className="text-[8px] font-extrabold tracking-widest uppercase text-[#93c5fd]/55">Bar</span>
            {bar.black > 0 && (
              <div
                className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center font-extrabold text-xs text-[#f3e9d8] animate-chip-drop shadow-[0_3px_7px_rgba(0,0,0,.5)]"
                style={{ background: CHECKER_BLACK_BG, borderColor: '#050506' }}
              >
                {bar.black}
              </div>
            )}
          </div>

          <div className="w-9 h-5 rounded-md bg-gradient-to-br from-[#e8cd85] to-[#8a6a24] border border-[#5c4419] flex items-center justify-center text-[10px] font-extrabold text-[#2a1710] my-1.5">
            {gameState.doublingCube.value}x
          </div>

          <div
            data-drop-target="bar-noop"
            onClick={() => onBarClick('white')}
            onPointerDown={(e) => bar.white > 0 && handlePointerDownOrigin('bar', e)}
            className={`flex-1 w-full flex flex-col items-center justify-center gap-1 cursor-pointer ${
              isSelBar && currentTurn === 'white' ? 'shadow-[0_0_0_2px_#e8cd85_inset] rounded-[10px]' : ''
            }`}
          >
            {bar.white > 0 && (
              <div
                className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center font-extrabold text-xs animate-chip-drop shadow-[0_3px_7px_rgba(0,0,0,.5)]"
                style={{ background: CHECKER_WHITE_BG, borderColor: '#a9822f', color: '#4a2c18' }}
              >
                {bar.white}
              </div>
            )}
            <span className="text-[8px] font-extrabold tracking-widest uppercase text-[#e8cd85]/55">Bar</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">{[19, 20, 21, 22, 23, 24].map((p) => renderPoint(p, true))}</div>
          <div className="flex-1 flex">{[6, 5, 4, 3, 2, 1].map((p) => renderPoint(p, false))}</div>
        </div>

        {/* Off column */}
        <div className="w-[8.5%] min-w-11 border-l-2 border-[#c9a24a]/30 flex flex-col items-center">
          <div
            data-drop-target="off"
            onClick={() => currentTurn === 'black' && onOffClick()}
            className={`flex-1 w-full flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              offTargetActive && currentTurn === 'black' ? 'shadow-[0_0_0_2px_#34d399_inset] rounded-[10px]' : ''
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-wide text-[#93c5fd]">Ute</span>
            <div className="w-7 h-7 rounded-full bg-[#1a0d05] border-2 border-[#93c5fd]/40 flex items-center justify-center text-[11px] font-extrabold text-[#dbeafe]">
              {off.black}
            </div>
          </div>
          <div
            data-drop-target="off"
            onClick={() => currentTurn === 'white' && onOffClick()}
            className={`flex-1 w-full flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              offTargetActive && currentTurn === 'white' ? 'shadow-[0_0_0_2px_#34d399_inset] rounded-[10px]' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#1a0d05] border-2 border-[#e8cd85]/50 flex items-center justify-center text-[11px] font-extrabold text-[#f3e0a8]">
              {off.white}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wide text-[#e8cd85]">Ute</span>
          </div>
        </div>

        {dragOrigin !== null && dragPos && (
          <div
            className="fixed w-8 h-8 rounded-full pointer-events-none z-[999]"
            style={{
              left: dragPos.x,
              top: dragPos.y,
              transform: 'translate(-50%,-50%)',
              background: currentTurn === 'white' ? CHECKER_WHITE_BG : CHECKER_BLACK_BG,
              border: `2px solid ${currentTurn === 'white' ? '#a9822f' : '#050506'}`,
              boxShadow: '0 8px 18px rgba(0,0,0,.5)',
            }}
          />
        )}
      </div>
    </div>
  );
};
