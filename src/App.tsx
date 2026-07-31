import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  GameState,
  Player,
  StartRule,
  GameMode,
  AIDifficulty,
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
import { RotateCw } from 'lucide-react';

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
      aiDifficulty: 'medium',
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
    aiDifficulty: AIDifficulty;
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
      aiDifficulty: config.aiDifficulty,
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
            showToast('Datamaskin har ingen flere lovlige trekk');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 font-sans relative">
      {/* Mobile Portrait Rotation Overlay */}
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center gap-4 text-center p-6 sm:hidden portrait:flex landscape:hidden">
        <div className="w-14 h-24 border-4 border-amber-400 rounded-2xl animate-spin relative flex items-center justify-center">
          <RotateCw className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-amber-300">Vri Skjermen Din</h2>
        <p className="text-xs text-slate-300 max-w-xs">
          Backgammon-brettet krever liggende format (landscape) for best visning og spillopplevelse.
        </p>
      </div>

      <Header
        soundEnabled={gameState.soundEnabled}
        onToggleSound={() =>
          setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        stats={gameState.stats}
      />

      <main className="w-full flex flex-col items-center justify-center flex-1 my-2">
        <Board
          gameState={gameState}
          onPointClick={handlePointClick}
          onBarClick={handleBarClick}
          onReserveClick={handleReserveClick}
          onOffClick={handleOffClick}
          onExecuteMove={handleExecuteDirectMove}
          hitFlashPoint={hitFlashPoint}
        />

        <Controls
          gameState={gameState}
          onRollDice={handleRollDice}
          onUndoMove={handleUndoMove}
          onGetHint={handleGetHint}
          onOfferDouble={handleOfferDouble}
          onRespondDouble={handleRespondDouble}
          onNewGame={handleNewGame}
          pipWhite={pipWhite}
          pipBlack={pipBlack}
        />
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-amber-500/50 text-slate-100 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      <footer className="py-2 text-center text-xs text-slate-500 font-medium">
        Backgammon Master &bull; Antigravity Edition
      </footer>
    </div>
  );
};

export default App;
