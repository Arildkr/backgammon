import type { GameState, Move, Player } from '../types/backgammon';
import { getValidMoves, applyMove, calculatePipCount } from './rules';

export function getAIMove(state: GameState): Move | null {
  const { points, bar, off, reserve, currentTurn, remainingDice } = state;

  const validMoves = getValidMoves(points, bar, reserve, currentTurn, remainingDice);
  if (validMoves.length === 0) return null;

  let bestMove: Move = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const { newPoints, newBar, newReserve } = applyMove(
      points,
      bar,
      off,
      reserve,
      currentTurn,
      move
    );

    let score = evaluatePosition(newPoints, newBar, newReserve, currentTurn, move);

    // Add tiny random jitter to break ties dynamically
    score += Math.random() * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function evaluatePosition(
  points: { [key: number]: Player[] },
  bar: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player,
  move: Move
): number {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let score = 0;

  // 1. Hitting opponent blot
  if (move.hit) {
    score += 40;
  }

  // 2. Bearing off
  if (move.to === 'off') {
    score += 30;
  }

  // 3. Pip count comparison
  const myPip = calculatePipCount(points, bar, reserve, player);
  const oppPip = calculatePipCount(points, bar, reserve, opponent);
  score += (oppPip - myPip) * 0.5;

  // 4. Made points (anchors with 2+ checkers)
  for (let p = 1; p <= 24; p++) {
    const checkers = points[p] || [];
    const count = checkers.filter((c) => c === player).length;
    if (count >= 2) {
      score += 8;
      // Extra bonus for home board anchors
      const isHomeBoard = player === 'black' ? p >= 19 : p <= 6;
      if (isHomeBoard) score += 6;
    } else if (count === 1) {
      // Penalty for single exposed blot
      const isHomeBoard = player === 'black' ? p >= 19 : p <= 6;
      score += isHomeBoard ? -15 : -8;
    }
  }

  // 5. Opponent in Bar penalty for them
  score += bar[opponent] * 20;

  // 6. Checkers stuck in reserve (begynne ute mode)
  score -= reserve[player] * 10;

  return score;
}

// Generate best hint for human player
export function getBestHint(state: GameState): Move | null {
  const { points, bar, off, reserve, currentTurn, remainingDice } = state;
  const validMoves = getValidMoves(points, bar, reserve, currentTurn, remainingDice);
  if (validMoves.length === 0) return null;

  let bestMove: Move = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const { newPoints, newBar, newReserve } = applyMove(
      points,
      bar,
      off,
      reserve,
      currentTurn,
      move
    );

    const score = evaluatePosition(newPoints, newBar, newReserve, currentTurn, move);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
