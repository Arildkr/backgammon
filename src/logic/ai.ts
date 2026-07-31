import type { GameState, Move, Player } from '../types/backgammon';
import { getValidMoves, applyMove, calculatePipCount } from './rules';

export function getAIMove(state: GameState): Move | null {
  const { points, bar, off, reserve, currentTurn, remainingDice, aiDifficulty } = state;

  const validMoves = getValidMoves(points, bar, reserve, currentTurn, remainingDice);
  if (validMoves.length === 0) return null;

  if (aiDifficulty === 'easy') {
    // Pick random move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Evaluate each valid move candidate
  let bestMove: Move = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const { newPoints, newBar, newOff, newReserve } = applyMove(
      points,
      bar,
      off,
      reserve,
      currentTurn,
      move
    );

    let score = evaluatePosition(
      newPoints,
      newBar,
      newOff,
      newReserve,
      currentTurn,
      move,
      aiDifficulty
    );

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
  _off: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player,
  move: Move,
  difficulty: 'medium' | 'master'
): number {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let score = 0;

  // 1. Hitting opponent blot
  if (move.hit) {
    score += difficulty === 'master' ? 40 : 25;
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
      score += difficulty === 'master' ? 8 : 4;
      // Extra bonus for home board anchors
      const isHomeBoard = player === 'black' ? p >= 19 : p <= 6;
      if (isHomeBoard) score += 6;
    } else if (count === 1) {
      // Penalty for single exposed blot
      const isHomeBoard = player === 'black' ? p >= 19 : p <= 6;
      const penalty = isHomeBoard ? -15 : -8;
      score += difficulty === 'master' ? penalty : -4;
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
    const { newPoints, newBar, newOff, newReserve } = applyMove(
      points,
      bar,
      off,
      reserve,
      currentTurn,
      move
    );

    const score = evaluatePosition(
      newPoints,
      newBar,
      newOff,
      newReserve,
      currentTurn,
      move,
      'master'
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
