import { cellCount } from './gridSize';
import type { GridSize } from './gridSize';
import type { Token } from './token';

export type BoardMode = 'number' | 'letter' | 'table';
export type Direction = 'asc' | 'desc';

const MODES_WITH_TABLE: BoardMode[] = ['number', 'letter', 'table'];
const MODES_WITHOUT_TABLE: BoardMode[] = ['number', 'letter'];
const TABLE_BASE_MIN = 2;
const TABLE_BASE_MAX = 12;

/**
 * Picks a mode with even odds, so a fresh round can't be predicted from the
 * last one. Times-table boards only ever roll when `allowTable` is set
 * (Expert tier) — every other tier stays numbers/letters only.
 */
export function randomBoardMode(allowTable: boolean): BoardMode {
  const pool = allowTable ? MODES_WITH_TABLE : MODES_WITHOUT_TABLE;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Picks a tap direction with even odds — independent of the mode roll. */
export function randomDirection(): Direction {
  return Math.random() < 0.5 ? 'asc' : 'desc';
}

/** Picks the times-table base (2x through 12x) for a "table" mode round. */
export function randomTableBase(): number {
  return TABLE_BASE_MIN + Math.floor(Math.random() * (TABLE_BASE_MAX - TABLE_BASE_MIN + 1));
}

/**
 * Spreadsheet-style column naming (A, B, ... Z, AA, AB, ...) so letter mode
 * still works past 26 cells (the 7×7 Expert board needs 49) without ever
 * repeating a letter or mixing letter case.
 */
function letterForIndex(index: number): string {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/**
 * The canonical tap order (rank 1..cellCount) for a single-mode board — pure
 * numbers, pure letters, or a times table (tableBase, 2×tableBase, ...) —
 * never mixed. Deterministic for a given size/mode/tableBase, so callers can
 * regenerate it on demand instead of carrying it around in state.
 */
export function orderedSequence(size: GridSize, mode: BoardMode, tableBase: number): Token[] {
  const total = cellCount(size);
  return Array.from({ length: total }, (_, i) => {
    if (mode === 'letter') return { kind: 'letter', value: letterForIndex(i) };
    if (mode === 'table') return { kind: 'number', value: tableBase * (i + 1) };
    return { kind: 'number', value: i + 1 };
  });
}

/**
 * The actual required tap order for a round — orderedSequence run backwards
 * when direction is "desc" (highest value / last letter first). The set of
 * tokens on the board never changes with direction, only the order they must
 * be tapped in.
 */
export function directedSequence(size: GridSize, mode: BoardMode, direction: Direction, tableBase: number): Token[] {
  const sequence = orderedSequence(size, mode, tableBase);
  return direction === 'desc' ? sequence.reverse() : sequence;
}

/**
 * Produces a new randomized board layout for a GridSize using a Fisher-Yates
 * shuffle, so every permutation of the ordered sequence is equally likely.
 */
export function shuffledBoard(size: GridSize, mode: BoardMode, tableBase: number): Token[] {
  const tokens = orderedSequence(size, mode, tableBase);
  fisherYatesShuffle(tokens);
  return tokens;
}

function fisherYatesShuffle<T>(list: T[]): void {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}
