import type { Player, Move, StartRule } from '../types/backgammon';

export function createInitialBoard(startRule: StartRule): {
  points: { [key: number]: Player[] };
  bar: { white: number; black: number };
  off: { white: number; black: number };
  reserve: { white: number; black: number };
} {
  const points: { [key: number]: Player[] } = {};
  for (let i = 1; i <= 24; i++) {
    points[i] = [];
  }

  if (startRule === 'inne') {
    // Standard Backgammon initial setup
    // White moves 24 -> 1. Black moves 1 -> 24.
    points[24] = ['white', 'white'];
    points[13] = Array(5).fill('white');
    points[8] = Array(3).fill('white');
    points[6] = Array(5).fill('white');

    points[1] = ['black', 'black'];
    points[12] = Array(5).fill('black');
    points[17] = Array(3).fill('black');
    points[19] = Array(5).fill('black');

    return {
      points,
      bar: { white: 0, black: 0 },
      off: { white: 0, black: 0 },
      reserve: { white: 0, black: 0 },
    };
  } else {
    // Ute-start: All 15 checkers start in reserve off-board
    return {
      points,
      bar: { white: 0, black: 0 },
      off: { white: 0, black: 0 },
      reserve: { white: 15, black: 15 },
    };
  }
}

export function rollDice(): number[] {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  if (d1 === d2) {
    return [d1, d1, d1, d1];
  }
  return [d1, d2];
}

// Calculate total pip count for a player
export function calculatePipCount(
  points: { [key: number]: Player[] },
  bar: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player
): number {
  let count = 0;

  for (let p = 1; p <= 24; p++) {
    const checkers = points[p] || [];
    const playerCheckers = checkers.filter((c) => c === player).length;
    if (playerCheckers > 0) {
      if (player === 'white') {
        // White moves 24 down to 1 (bearing off at 0)
        count += playerCheckers * p;
      } else {
        // Black moves 1 up to 24 (bearing off at 25)
        count += playerCheckers * (25 - p);
      }
    }
  }

  // Checkers on bar or reserve count as 25 pips each
  count += (bar[player] || 0) * 25;
  count += (reserve[player] || 0) * 25;

  return count;
}

// Check if all checkers of a player are in their home board
export function isAllInHomeBoard(
  points: { [key: number]: Player[] },
  bar: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player
): boolean {
  if (bar[player] > 0 || reserve[player] > 0) return false;

  if (player === 'white') {
    // White home board is 1..6. Any checkers on 7..24 means false.
    for (let p = 7; p <= 24; p++) {
      if ((points[p] || []).includes('white')) return false;
    }
  } else {
    // Black home board is 19..24. Any checkers on 1..18 means false.
    for (let p = 1; p <= 18; p++) {
      if ((points[p] || []).includes('black')) return false;
    }
  }
  return true;
}

// Get highest occupied point for bearing off overflow checks
function getHighestOccupiedPoint(
  points: { [key: number]: Player[] },
  player: Player
): number {
  if (player === 'white') {
    for (let p = 6; p >= 1; p--) {
      if ((points[p] || []).includes('white')) return p;
    }
    return 0;
  } else {
    for (let p = 19; p <= 24; p++) {
      if ((points[p] || []).includes('black')) return p;
    }
    return 0;
  }
}

// Find all valid moves for current player and remaining dice
export function getValidMoves(
  points: { [key: number]: Player[] },
  bar: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player,
  remainingDice: number[]
): Move[] {
  if (remainingDice.length === 0) return [];

  const moves: Move[] = [];
  const opponent: Player = player === 'white' ? 'black' : 'white';
  const uniqueDice = Array.from(new Set(remainingDice));

  // Case 1: Player has checkers on BAR (Must move off BAR first)
  if (bar[player] > 0) {
    for (const die of uniqueDice) {
      const targetPoint = player === 'white' ? 25 - die : die;
      const targetCheckers = points[targetPoint] || [];
      const oppCount = targetCheckers.filter((c) => c === opponent).length;

      if (oppCount < 2) {
        moves.push({
          from: 'bar',
          to: targetPoint,
          dieValue: die,
          hit: oppCount === 1,
        });
      }
    }
    return moves; // Must move bar checkers before any other moves
  }

  // Case 2: Player has checkers in RESERVE (begynne ute mode)
  // If reserve > 0, player CAN enter from reserve onto board
  if (reserve[player] > 0) {
    for (const die of uniqueDice) {
      const targetPoint = player === 'white' ? 25 - die : die;
      const targetCheckers = points[targetPoint] || [];
      const oppCount = targetCheckers.filter((c) => c === opponent).length;

      if (oppCount < 2) {
        moves.push({
          from: 'reserve',
          to: targetPoint,
          dieValue: die,
          hit: oppCount === 1,
        });
      }
    }
  }

  // Case 3: Move checkers on the BOARD
  const canBearOff = isAllInHomeBoard(points, bar, reserve, player);

  for (let fromP = 1; fromP <= 24; fromP++) {
    const checkers = points[fromP] || [];
    if (!checkers.includes(player)) continue;

    for (const die of uniqueDice) {
      if (player === 'white') {
        const targetP = fromP - die;
        if (targetP >= 1) {
          const targetCheckers = points[targetP] || [];
          const oppCount = targetCheckers.filter((c) => c === opponent).length;
          if (oppCount < 2) {
            moves.push({
              from: fromP,
              to: targetP,
              dieValue: die,
              hit: oppCount === 1,
            });
          }
        } else if (canBearOff) {
          // Exact bear off or over-die bear off from highest occupied point
          if (targetP === 0) {
            moves.push({ from: fromP, to: 'off', dieValue: die });
          } else if (targetP < 0) {
            const highestP = getHighestOccupiedPoint(points, player);
            if (fromP === highestP) {
              moves.push({ from: fromP, to: 'off', dieValue: die });
            }
          }
        }
      } else {
        // Black moves +die
        const targetP = fromP + die;
        if (targetP <= 24) {
          const targetCheckers = points[targetP] || [];
          const oppCount = targetCheckers.filter((c) => c === opponent).length;
          if (oppCount < 2) {
            moves.push({
              from: fromP,
              to: targetP,
              dieValue: die,
              hit: oppCount === 1,
            });
          }
        } else if (canBearOff) {
          if (targetP === 25) {
            moves.push({ from: fromP, to: 'off', dieValue: die });
          } else if (targetP > 25) {
            // Lowest point in black home board is 19 (furthest from 25)
            let lowestP = 24;
            for (let p = 19; p <= 24; p++) {
              if ((points[p] || []).includes('black')) {
                lowestP = p;
                break;
              }
            }
            if (fromP === lowestP) {
              moves.push({ from: fromP, to: 'off', dieValue: die });
            }
          }
        }
      }
    }
  }

  return moves;
}

// Apply a single move to state and return updated state components
export function applyMove(
  points: { [key: number]: Player[] },
  bar: { white: number; black: number },
  off: { white: number; black: number },
  reserve: { white: number; black: number },
  player: Player,
  move: Move
): {
  newPoints: { [key: number]: Player[] };
  newBar: { white: number; black: number };
  newOff: { white: number; black: number };
  newReserve: { white: number; black: number };
} {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  const newPoints = { ...points };
  for (const k in newPoints) {
    newPoints[k] = [...newPoints[k]];
  }
  const newBar = { ...bar };
  const newOff = { ...off };
  const newReserve = { ...reserve };

  // Remove checker from origin
  if (move.from === 'bar') {
    newBar[player]--;
  } else if (move.from === 'reserve') {
    newReserve[player]--;
  } else {
    const idx = newPoints[move.from as number].lastIndexOf(player);
    if (idx !== -1) {
      newPoints[move.from as number].splice(idx, 1);
    }
  }

  // Place checker at target or off
  if (move.to === 'off') {
    newOff[player]++;
  } else {
    const targetPoint = move.to as number;
    // Check hit
    const oppIdx = newPoints[targetPoint].indexOf(opponent);
    if (oppIdx !== -1) {
      newPoints[targetPoint].splice(oppIdx, 1);
      newBar[opponent]++;
    }
    newPoints[targetPoint].push(player);
  }

  return { newPoints, newBar, newOff, newReserve };
}

// Determine if game is won and win type
export function checkWinState(
  off: { white: number; black: number },
  points: { [key: number]: Player[] },
  bar: { white: number; black: number }
): { winner: Player | null; winType: 'normal' | 'gammon' | 'backgammon' | null } {
  if (off.white >= 15) {
    const loserOff = off.black;
    if (loserOff === 0) {
      // Check for Backgammon (loser has checkers on winner's home board or bar)
      const loserInWinnerHome = [1, 2, 3, 4, 5, 6].some((p) =>
        (points[p] || []).includes('black')
      );
      if (bar.black > 0 || loserInWinnerHome) {
        return { winner: 'white', winType: 'backgammon' };
      }
      return { winner: 'white', winType: 'gammon' };
    }
    return { winner: 'white', winType: 'normal' };
  }

  if (off.black >= 15) {
    const loserOff = off.white;
    if (loserOff === 0) {
      const loserInWinnerHome = [19, 20, 21, 22, 23, 24].some((p) =>
        (points[p] || []).includes('white')
      );
      if (bar.white > 0 || loserInWinnerHome) {
        return { winner: 'black', winType: 'backgammon' };
      }
      return { winner: 'black', winType: 'gammon' };
    }
    return { winner: 'black', winType: 'normal' };
  }

  return { winner: null, winType: null };
}
