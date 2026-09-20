import { cellCount, type GridSize } from './gridSize';

/**
 * Star thresholds scale with cell count so every grid size is equally hard to
 * three-star. Completing a round always earns at least 1 star — the loop
 * stays encouraging (no punishing "you failed" state) while still giving
 * fast, honest signal for how close to mastery a run was.
 */
const MS_PER_CELL_FOR_THREE_STARS = 850;
const MS_PER_CELL_FOR_TWO_STARS = 1300;

/**
 * Hard per-level deadline. Deliberately well above the 2-star pace (≈2.3x)
 * so it only bites when a run has genuinely stalled, not on an honest slow
 * clear — a safety-net timer for urgency, not a skill gate.
 */
const MS_PER_CELL_TIME_LIMIT = 3000;

export function timeLimitMillis(gridSize: GridSize): number {
  return cellCount(gridSize) * MS_PER_CELL_TIME_LIMIT;
}

export function starsForTime(gridSize: GridSize, timeMillis: number): 1 | 2 | 3 {
  const cells = cellCount(gridSize);
  if (timeMillis <= cells * MS_PER_CELL_FOR_THREE_STARS) return 3;
  if (timeMillis <= cells * MS_PER_CELL_FOR_TWO_STARS) return 2;
  return 1;
}

export function nextThreshold(gridSize: GridSize, stars: 1 | 2 | 3): number | null {
  const cells = cellCount(gridSize);
  if (stars < 2) return cells * MS_PER_CELL_FOR_TWO_STARS;
  if (stars < 3) return cells * MS_PER_CELL_FOR_THREE_STARS;
  return null;
}

export const RANK_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Cleared',
  2: 'Great run',
  3: 'Flawless',
};
