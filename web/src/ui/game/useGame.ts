import { useCallback, useEffect, useRef, useState } from 'react';
import { gridSizeByDimension } from '../../domain/gridSize';
import type { GridSize } from '../../domain/gridSize';
import {
  shuffledBoard,
  directedSequence,
  randomBoardMode,
  randomDirection,
  randomTableBase,
} from '../../domain/gridGenerator';
import type { BoardMode, Direction } from '../../domain/gridGenerator';
import { starsForTime, timeLimitMillis } from '../../domain/stars';
import { tokensEqual } from '../../domain/token';
import type { Token } from '../../domain/token';
import { runRepository } from '../../data/runRepository';

export interface GameState {
  gridSize: GridSize;
  /** Picked fresh each round — a round is all-numbers, all-letters, or one times table, never mixed. */
  mode: BoardMode;
  /** Only meaningful when mode is "table" — the times-table base (2x-12x). */
  tableBase: number;
  /** Picked fresh each round, independent of mode — ascending or descending tap order. */
  direction: Direction;
  board: Token[];
  clearedIndices: Set<number>;
  /** 0-based position in the ordered number/letter sequence for this gridSize. */
  nextIndex: number;
  elapsedMillis: number;
  timeLimitMillis: number;
  mistakes: number;
  isPaused: boolean;
  isComplete: boolean;
  /** Brief rules popup shown at the start of every round; taps/timer are held off until it clears. */
  introVisible: boolean;
  timedOut: boolean;
  /** Hardcore tiers (Expert): true right after any wrong tap, until the round auto-restarts. */
  failedTap: boolean;
  wrongTapIndex: number | null;
  justClearedIndex: number | null;
  combo: number;
  bestComboThisRound: number;
  lastCorrectAt: number;
  finalTimeMillis: number;
  isNewBest: boolean;
  stars: 1 | 2 | 3;
  roundResultReady: boolean;
}

const TICK_INTERVAL_MS = 50;
/** A correct tap within this window of the previous one keeps the combo alive. */
const COMBO_WINDOW_MS = 1400;
/** How long the "Time's up" message shows before the board reshuffles. */
const TIMEOUT_RESTART_DELAY_MS = 1400;
/** How long the brief pre-round rules popup stays up before play begins. */
const INTRO_DURATION_MS = 4500;

function freshState(gridSize: GridSize): GameState {
  const mode = randomBoardMode(gridSize.tablesEnabled);
  const tableBase = randomTableBase();
  const direction = randomDirection();
  return {
    gridSize,
    mode,
    tableBase,
    direction,
    board: shuffledBoard(gridSize, mode, tableBase),
    clearedIndices: new Set(),
    nextIndex: 0,
    elapsedMillis: 0,
    timeLimitMillis: timeLimitMillis(gridSize),
    mistakes: 0,
    isPaused: false,
    isComplete: false,
    introVisible: true,
    timedOut: false,
    failedTap: false,
    wrongTapIndex: null,
    justClearedIndex: null,
    combo: 0,
    bestComboThisRound: 0,
    lastCorrectAt: 0,
    finalTimeMillis: 0,
    isNewBest: false,
    stars: 1,
    roundResultReady: false,
  };
}

/**
 * All setState updaters below are kept pure (no ref writes, no other setState
 * calls, no side effects) — React StrictMode double-invokes updater functions
 * to catch impurity, and using the *second* call's result. An updater that
 * mutates a ref it also reads (e.g. a "stop ticking" flag) sees its own
 * mutation on the second invocation and silently produces a different,
 * wrong result. Side effects that depend on a state transition (stopping the
 * interval, recording a finished run, haptics) are driven by separate
 * `useEffect`s that react to the committed state instead.
 */
export function useGame(gridDimension: number) {
  const gridSize = gridSizeByDimension(gridDimension);
  const [state, setState] = useState<GameState>(() => freshState(gridSize));

  const accumulatedRef = useRef(0);
  const startTimeRef = useRef(0);
  const runningRef = useRef(true);
  const intervalRef = useRef<number | undefined>(undefined);
  const introTimeoutRef = useRef<number | undefined>(undefined);

  const currentElapsed = useCallback(
    () => accumulatedRef.current + (runningRef.current ? performance.now() - startTimeRef.current : 0),
    [],
  );

  const beginTicking = useCallback(() => {
    accumulatedRef.current = 0;
    startTimeRef.current = performance.now();
    runningRef.current = true;
    window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const elapsed = currentElapsed();
      setState((s) => {
        if (!runningRef.current || s.isComplete || s.timedOut || s.failedTap) return s;
        if (elapsed >= s.timeLimitMillis) {
          return { ...s, elapsedMillis: s.timeLimitMillis, timedOut: true };
        }
        return { ...s, elapsedMillis: elapsed };
      });
    }, TICK_INTERVAL_MS);
  }, [currentElapsed]);

  // Starts a round: fresh state with the rules popup showing, clock held off
  // until the popup's timeout clears it — so the intro never eats into the
  // player's time budget.
  const startRound = useCallback(() => {
    window.clearTimeout(introTimeoutRef.current);
    setState(freshState(gridSize));
    introTimeoutRef.current = window.setTimeout(() => {
      setState((s) => ({ ...s, introVisible: false }));
      beginTicking();
    }, INTRO_DURATION_MS);
  }, [gridSize, beginTicking]);

  useEffect(() => {
    startRound();
    return () => {
      window.clearTimeout(introTimeoutRef.current);
      window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridDimension]);

  // Stop the clock exactly once when a round ends, whichever way it ends.
  // Snapshots the elapsed time into accumulatedRef *before* flipping
  // runningRef, so a later currentElapsed() call (finishRound, below) still
  // returns the correct frozen value instead of losing the running portion.
  useEffect(() => {
    if (state.isComplete || state.timedOut || state.failedTap) {
      accumulatedRef.current = currentElapsed();
      runningRef.current = false;
      window.clearInterval(intervalRef.current);
    }
  }, [state.isComplete, state.timedOut, state.failedTap, currentElapsed]);

  // mistakes is passed in (read from the calling effect's own `state`
  // closure) rather than read from `s` inside the updater, and the
  // localStorage write happens here — outside any setState updater — so
  // StrictMode's double-invocation of the updater can't record the run twice.
  const finishRound = useCallback(
    (mistakes: number) => {
      const finalTimeMillis = Math.round(currentElapsed());
      const previousBest = runRepository.bestTimeMillis(gridSize);
      const isNewBest = previousBest == null || finalTimeMillis < previousBest;
      const stars = starsForTime(gridSize, finalTimeMillis);

      runRepository.recordRun({ gridSize, timeMillis: finalTimeMillis, mistakes });

      setState((s) => ({ ...s, finalTimeMillis, isNewBest, stars, roundResultReady: true }));
    },
    [gridSize, currentElapsed],
  );

  // Fires the completion side effects (persisting the run) once, right after
  // isComplete actually commits — not from inside the tap updater itself.
  useEffect(() => {
    if (state.isComplete && !state.roundResultReady) {
      finishRound(state.mistakes);
    }
  }, [state.isComplete, state.roundResultReady, state.mistakes, finishRound]);

  const onCellTapped = useCallback((index: number) => {
    const now = performance.now();
    setState((s) => {
      if (s.introVisible || s.isPaused || s.isComplete || s.timedOut || s.failedTap || s.clearedIndices.has(index))
        return s;

      const targetToken = directedSequence(s.gridSize, s.mode, s.direction, s.tableBase)[s.nextIndex];
      if (tokensEqual(s.board[index], targetToken)) {
        const comboAlive = now - s.lastCorrectAt <= COMBO_WINDOW_MS;
        const combo = comboAlive ? s.combo + 1 : 1;
        const bestComboThisRound = Math.max(s.bestComboThisRound, combo);

        const newCleared = new Set(s.clearedIndices);
        newCleared.add(index);
        const isComplete = newCleared.size === s.board.length;

        return {
          ...s,
          clearedIndices: newCleared,
          nextIndex: s.nextIndex + 1,
          wrongTapIndex: null,
          justClearedIndex: index,
          combo,
          bestComboThisRound,
          lastCorrectAt: now,
          isComplete,
        };
      }

      return {
        ...s,
        mistakes: s.mistakes + 1,
        wrongTapIndex: index,
        combo: 0,
        lastCorrectAt: 0,
        failedTap: s.gridSize.hardcore,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((s) => {
      if (s.introVisible || s.isComplete || s.timedOut || s.failedTap) return s;
      return { ...s, isPaused: !s.isPaused };
    });
  }, []);

  // Keeps the stopwatch bookkeeping refs in sync with isPaused. Runs once on
  // mount too (redundant with beginTicking's own reset, but harmless).
  useEffect(() => {
    if (state.isPaused) {
      accumulatedRef.current = currentElapsed();
      runningRef.current = false;
    } else if (!state.isComplete && !state.timedOut && !state.failedTap) {
      startTimeRef.current = performance.now();
      runningRef.current = true;
    }
  }, [state.isPaused, state.isComplete, state.timedOut, state.failedTap, currentElapsed]);

  const clearWrongTapFlash = useCallback((index: number) => {
    setState((s) => (s.wrongTapIndex === index ? { ...s, wrongTapIndex: null } : s));
  }, []);

  const clearJustCleared = useCallback((index: number) => {
    setState((s) => (s.justClearedIndex === index ? { ...s, justClearedIndex: null } : s));
  }, []);

  return {
    state,
    onCellTapped,
    togglePause,
    clearWrongTapFlash,
    clearJustCleared,
    restartRound: startRound,
  };
}

export { TIMEOUT_RESTART_DELAY_MS };
