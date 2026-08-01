import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  GameState,
  Player,
  StartRule,
  GameMode,
  BoardTheme,
  Move,
} from './types/backgammon';
import {
  createInitialBoard,
  rollDice,
  calculatePipCount,
  getValidMoves,
  applyMove,
  checkWinState,
} from './logic/rules';
import { getAIMove, getBestHint } from './logic/ai';
import { sounds } from './utils/sound';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { TurnLegend } from './components/TurnLegend';
import { DiceBar } from './components/DiceBar';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const startRule: StartRule = 'inne';
    const initialBoard = createInitialBoard(startRule);
    return {
      points: initialBoard.points,
      bar: initialBoard.bar,
      off: initialBoard.off,
      reserve: initialBoard.reserve,
      startRule,
      gameMode: 'ai',
      boardTheme: 'mahogany',
      currentTurn: 'white',
      dice: [],
      remainingDice: [],
      isRolling: false,
      turnPhase: 'roll',
      selectedOrigin: null,
      validMoves: [],
      turnHistory: [],
      doublingCube: { value: 1, owner: 'center', offered: false },
      winner: null,
      winType: null,
      soundEnabled: true,
      stats: { whiteWins: 0, blackWins: 0 },
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hitFlashPoint, setHitFlashPoint] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const triggerHitFlash = (pointIndex: number) => {
    setHitFlashPoint(pointIndex);
    setTimeout(() => {
      setHitFlashPoint(null);
    }, 700);
  };

  const pipWhite = calculatePipCount(
    gameState.points,
    gameState.bar,
    gameState.reserve,
    'white'
  );
  const pipBlack = calculatePipCount(
    gameState.points,
    gameState.bar,
    gameState.reserve,
    'black'
  );

  // Handle Dice Roll
  const handleRollDice = () => {
    if (gameState.turnPhase !== 'roll' || gameState.isRolling || gameState.winner) return;

    sounds.playDiceRoll(gameState.soundEnabled);
    setGameState((prev) => ({ ...prev, isRolling: true }));

    setTimeout(() => {
      const rolled = rollDice();
      setGameState((prev) => {
        const valid = getValidMoves(
          prev.points,
          prev.bar,
          prev.reserve,
          prev.currentTurn,
          rolled
        );

        if (valid.length === 0) {
          showToast('Ingen lovlige trekk – turen går videre');
          const nextPlayer: Player = prev.currentTurn === 'white' ? 'black' : 'white';
          return {
            ...prev,
            dice: [],
            remainingDice: [],
            isRolling: false,
            turnPhase: 'roll',
            currentTurn: nextPlayer,
            validMoves: [],
            turnHistory: [],
          };
        }

        return {
          ...prev,
          dice: rolled,
          remainingDice: rolled,
          isRolling: false,
          turnPhase: 'move',
          validMoves: valid,
          selectedOrigin: null,
        };
      });
    }, 500);
  };

  // Helper to execute a valid move
  const executeMove = (move: Move) => {
    setGameState((prev) => {
      const { newPoints, newBar, newOff, newReserve } = applyMove(
        prev.points,
        prev.bar,
        prev.off,
        prev.reserve,
        prev.currentTurn,
        move
      );

      // Play move or hit sound
      if (move.hit) {
        sounds.playHit(prev.soundEnabled);
        if (typeof move.to === 'number') {
          triggerHitFlash(move.to);
        }
      } else {
        sounds.playCheckerMove(prev.soundEnabled);
      }

      // Check win condition
      const { winner, winType } = checkWinState(newOff, newPoints, newBar);

      if (winner) {
        sounds.playWin(prev.soundEnabled);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        return {
          ...prev,
          points: newPoints,
          bar: newBar,
          off: newOff,
          reserve: newReserve,
          winner,
          winType,
          turnPhase: 'game_over',
          stats: {
            whiteWins: winner === 'white' ? prev.stats.whiteWins + 1 : prev.stats.whiteWins,
            blackWins: winner === 'black' ? prev.stats.blackWins + 1 : prev.stats.blackWins,
          },
        };
      }

      // Remove consumed die value
      const remaining = [...prev.remainingDice];
      const dieIdx = remaining.indexOf(move.dieValue);
      if (dieIdx !== -1) remaining.splice(dieIdx, 1);

      // Push history snapshot for Undo
      const historySnapshot = {
        points: prev.points,
        bar: prev.bar,
        off: prev.off,
        reserve: prev.reserve,
        remainingDice: prev.remainingDice,
        movesMade: [],
      };

      // Check if turn ends (no remaining dice or no valid moves left)
      const nextValid = getValidMoves(
        newPoints,
        newBar,
        newReserve,
        prev.currentTurn,
        remaining
      );

      if (remaining.length === 0 || nextValid.length === 0) {
        if (remaining.length > 0 && nextValid.length === 0) {
          showToast('Ingen flere lovlige trekk – turen går videre');
        }
        const nextPlayer: Player = prev.currentTurn === 'white' ? 'black' : 'white';
        return {
          ...prev,
          points: newPoints,
          bar: newBar,
          off: newOff,
          reserve: newReserve,
          dice: [],
          remainingDice: [],
          currentTurn: nextPlayer,
          turnPhase: 'roll',
          selectedOrigin: null,
          validMoves: [],
          turnHistory: [],
        };
      }

      return {
        ...prev,
        points: newPoints,
        bar: newBar,
        off: newOff,
        reserve: newReserve,
        remainingDice: remaining,
        selectedOrigin: null,
        validMoves: nextValid,
        turnHistory: [...prev.turnHistory, historySnapshot],
      };
    });
  };

  // Drag and drop / Direct move execution
  const handleExecuteDirectMove = (
    from: number | 'bar' | 'reserve',
    to: number | 'off'
  ) => {
    const move = gameState.validMoves.find((m) => m.from === from && m.to === to);
    if (move) {
      executeMove(move);
    } else {
      if (gameState.bar[gameState.currentTurn] > 0 && from !== 'bar') {
        showToast('Sett inn brikke fra baren først!');
      }
    }
  };

  // Handle Point click
  const handlePointClick = (pointIndex: number) => {
    if (gameState.turnPhase !== 'move' || gameState.winner) return;

    if (gameState.bar[gameState.currentTurn] > 0 && gameState.selectedOrigin !== 'bar') {
      showToast('Sett inn brikke fra baren først!');
      return;
    }

    if (gameState.selectedOrigin !== null) {
      const move = gameState.validMoves.find(
        (m) => m.from === gameState.selectedOrigin && m.to === pointIndex
      );
      if (move) {
        executeMove(move);
        return;
      }
    }

    const movesFromPoint = gameState.validMoves.filter((m) => m.from === pointIndex);
    if (movesFromPoint.length > 0) {
      setGameState((prev) => ({
        ...prev,
        selectedOrigin: prev.selectedOrigin === pointIndex ? null : pointIndex,
      }));
    } else {
      setGameState((prev) => ({ ...prev, selectedOrigin: null }));
    }
  };

  // Handle Bar click
  const handleBarClick = (player: Player) => {
    if (gameState.turnPhase !== 'move' || gameState.currentTurn !== player) return;
    const movesFromBar = gameState.validMoves.filter((m) => m.from === 'bar');
    if (movesFromBar.length > 0) {
      setGameState((prev) => ({
        ...prev,
        selectedOrigin: prev.selectedOrigin === 'bar' ? null : 'bar',
      }));
    }
  };

  // Handle Reserve click
  const handleReserveClick = (player: Player) => {
    if (gameState.turnPhase !== 'move' || gameState.currentTurn !== player) return;
    const movesFromReserve = gameState.validMoves.filter((m) => m.from === 'reserve');
    if (movesFromReserve.length > 0) {
      setGameState((prev) => ({
        ...prev,
        selectedOrigin: prev.selectedOrigin === 'reserve' ? null : 'reserve',
      }));
    }
  };

  // Handle Bear Off click
  const handleOffClick = () => {
    if (gameState.turnPhase !== 'move' || gameState.selectedOrigin === null) return;
    const move = gameState.validMoves.find(
      (m) => m.from === gameState.selectedOrigin && m.to === 'off'
    );
    if (move) {
      executeMove(move);
    }
  };

  // Undo Last Move in Turn
  const handleUndoMove = () => {
    if (gameState.turnHistory.length === 0) return;

    setGameState((prev) => {
      const history = [...prev.turnHistory];
      const lastState = history.pop();
      if (!lastState) return prev;

      const valid = getValidMoves(
        lastState.points,
        lastState.bar,
        lastState.reserve,
        prev.currentTurn,
        lastState.remainingDice
      );

      return {
        ...prev,
        points: lastState.points,
        bar: lastState.bar,
        off: lastState.off,
        reserve: lastState.reserve,
        remainingDice: lastState.remainingDice,
        validMoves: valid,
        selectedOrigin: null,
        turnHistory: history,
      };
    });
  };

  // Get Best Hint
  const handleGetHint = () => {
    const hint = getBestHint(gameState);
    if (hint) {
      setGameState((prev) => ({
        ...prev,
        selectedOrigin: hint.from,
      }));
    }
  };

  // Doubling Cube
  const handleOfferDouble = () => {
    sounds.playDouble(gameState.soundEnabled);
    setGameState((prev) => ({
      ...prev,
      doublingCube: {
        ...prev.doublingCube,
        offered: true,
        offeredBy: prev.currentTurn,
      },
    }));
  };

  const handleRespondDouble = (accept: boolean) => {
    setGameState((prev) => {
      if (accept) {
        return {
          ...prev,
          doublingCube: {
            value: prev.doublingCube.value * 2,
            owner: prev.currentTurn,
            offered: false,
          },
        };
      } else {
        const winner = prev.doublingCube.offeredBy || 'white';
        return {
          ...prev,
          winner,
          winType: 'normal',
          turnPhase: 'game_over',
          doublingCube: { ...prev.doublingCube, offered: false },
        };
      }
    });
  };

  // Start New Game
  const handleNewGame = (config: {
    startRule: StartRule;
    gameMode: GameMode;
    boardTheme: BoardTheme;
  }) => {
    const newBoard = createInitialBoard(config.startRule);
    setGameState((prev) => ({
      ...prev,
      points: newBoard.points,
      bar: newBoard.bar,
      off: newBoard.off,
      reserve: newBoard.reserve,
      startRule: config.startRule,
      gameMode: config.gameMode,
      boardTheme: config.boardTheme,
      currentTurn: 'white',
      dice: [],
      remainingDice: [],
      isRolling: false,
      turnPhase: 'roll',
      selectedOrigin: null,
      validMoves: [],
      turnHistory: [],
      doublingCube: { value: 1, owner: 'center', offered: false },
      winner: null,
      winType: null,
    }));
  };

  // Live toggle between Player-vs-Player and Player-vs-AI
  const handleToggleGameMode = () => {
    setGameState((prev) => ({ ...prev, gameMode: prev.gameMode === 'ai' ? 'pvp' : 'ai' }));
  };

  // Live board theme change — purely cosmetic, doesn't touch the board state
  const handleChangeTheme = (boardTheme: BoardTheme) => {
    setGameState((prev) => ({ ...prev, boardTheme }));
  };

  // Quick restart keeping the current configuration
  const handleQuickReset = () => {
    handleNewGame({
      startRule: gameState.startRule,
      gameMode: gameState.gameMode,
      boardTheme: gameState.boardTheme,
    });
  };

  // AI Turn Logic Automation
  useEffect(() => {
    if (
      gameState.gameMode === 'ai' &&
      gameState.currentTurn === 'black' &&
      !gameState.winner &&
      !gameState.isRolling
    ) {
      if (gameState.turnPhase === 'roll') {
        const timer = setTimeout(() => {
          handleRollDice();
        }, 700);
        return () => clearTimeout(timer);
      } else if (gameState.turnPhase === 'move') {
        const timer = setTimeout(() => {
          const aiMove = getAIMove(gameState);
          if (aiMove) {
            executeMove(aiMove);
          } else {
            showToast('Linnea har ingen flere lovlige trekk');
            setGameState((prev) => ({
              ...prev,
              dice: [],
              remainingDice: [],
              currentTurn: 'white',
              turnPhase: 'roll',
              validMoves: [],
              selectedOrigin: null,
              turnHistory: [],
            }));
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState]);

  return (
    <div
      className="h-[100dvh] overflow-hidden flex flex-col items-center p-2.5 gap-2 font-sans relative"
      style={{ background: 'radial-gradient(ellipse at 50% -10%,#2a1710 0%,rgba(18,9,5,0) 55%),#0e0906' }}
    >
      {/* Mobile Portrait Rotation Overlay */}
      <div className="rotate-gate fixed inset-0 z-[500] bg-[#0e0906] flex-col items-center justify-center gap-4 text-center p-8">
        <div className="w-[54px] h-[88px] border-4 border-[#e8cd85] rounded-[10px] relative animate-rotate-phone">
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded bg-[#e8cd85]" />
        </div>
        <h2 className="text-xl text-[#e8cd85] m-0">Vri skjermen din</h2>
        <p className="text-[13px] text-[#b8a488] m-0 max-w-xs">
          Backgammon-brettet trenger liggende format for å vises riktig. Roter telefonen din.
        </p>
      </div>

      <Header
        soundEnabled={gameState.soundEnabled}
        onToggleSound={() =>
          setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        gameMode={gameState.gameMode}
        onToggleGameMode={handleToggleGameMode}
        onQuickReset={handleQuickReset}
        onOpenSettings={() => setShowSettings(true)}
        boardTheme={gameState.boardTheme}
        onChangeTheme={handleChangeTheme}
        stats={gameState.stats}
      />

      <TurnLegend currentTurn={gameState.currentTurn} gameOver={!!gameState.winner} />

      <DiceBar
        currentTurn={gameState.currentTurn}
        gameMode={gameState.gameMode}
        gameOver={!!gameState.winner}
        dice={gameState.dice}
        remainingDice={gameState.remainingDice}
        isRolling={gameState.isRolling}
        onRoll={handleRollDice}
        canRoll={gameState.turnPhase === 'roll' && !(gameState.gameMode === 'ai' && gameState.currentTurn === 'black')}
      />

      {/* Flexible area: shrinks the board to whatever height is left, never forces a page scroll */}
      <div
        className="w-full flex-1 min-h-0 flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <Board
          gameState={gameState}
          onPointClick={handlePointClick}
          onBarClick={handleBarClick}
          onReserveClick={handleReserveClick}
          onOffClick={handleOffClick}
          onExecuteMove={handleExecuteDirectMove}
          hitFlashPoint={hitFlashPoint}
        />
      </div>

      <Controls
        gameState={gameState}
        onUndoMove={handleUndoMove}
        onGetHint={handleGetHint}
        onOfferDouble={handleOfferDouble}
        onRespondDouble={handleRespondDouble}
        onNewGame={handleNewGame}
        pipWhite={pipWhite}
        pipBlack={pipBlack}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 bg-[#241407] border border-[#c9a24a]/40 text-[#f3e9d8] px-5 py-2.5 rounded-[11px] font-semibold text-[13px] shadow-2xl z-[200] animate-toast-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
