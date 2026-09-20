import { GRID_SIZES } from '../domain/gridSize';
import { starsForTime } from '../domain/stars';
import { runRepository } from './runRepository';

/** Rounds of the same grid size needed to clear a stage and unlock the next. */
export const ROUNDS_PER_STAGE = 5;

export interface StageProgress {
  dimension: number;
  bestTimeMillis: number | null;
  stars: 0 | 1 | 2 | 3;
  roundsCompleted: number;
  cleared: boolean;
  unlocked: boolean;
}

export function roundsCompletedForDimension(dimension: number): number {
  return runRepository.allRuns().filter((r) => r.gridDimension === dimension).length;
}

/**
 * Derives the full stage ladder from run history alone (no separate
 * "unlocked"/"stars"/"cleared" storage to drift out of sync with actual
 * runs). A stage unlocks once the previous stage has racked up
 * ROUNDS_PER_STAGE completed rounds of that grid size.
 */
export function stageLadder(): StageProgress[] {
  let previousCleared = true;
  return GRID_SIZES.map((size) => {
    const bestTimeMillis = runRepository.bestTimeMillis(size);
    const stars = bestTimeMillis != null ? starsForTime(size, bestTimeMillis) : 0;
    const roundsCompleted = roundsCompletedForDimension(size.dimension);
    const cleared = roundsCompleted >= ROUNDS_PER_STAGE;
    const unlocked = previousCleared;
    previousCleared = cleared;
    return { dimension: size.dimension, bestTimeMillis, stars, roundsCompleted, cleared, unlocked };
  });
}
