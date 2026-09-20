import type { GridSize } from '../domain/gridSize';

export interface RunRecord {
  id: number;
  gridDimension: number;
  timeMillis: number;
  mistakes: number;
  completedAtEpochMillis: number;
}

export interface CompletedRun {
  gridSize: GridSize;
  timeMillis: number;
  mistakes: number;
}

const STORAGE_KEY = 'focusgrid.runs';

type Listener = () => void;
const listeners = new Set<Listener>();

function readAll(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Defensive: don't trust storage contents blindly — a hand-edited or
    // corrupted value that isn't the expected array shape would otherwise
    // crash every read (filter/sort/reduce) downstream instead of just
    // this one.
    return Array.isArray(parsed) ? (parsed as RunRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(runs: RunRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  cachedAllRuns = null;
  listeners.forEach((listener) => listener());
}

// useSyncExternalStore requires getSnapshot to return a stable reference
// when nothing has changed, so the sorted list is cached until the next write.
let cachedAllRuns: RunRecord[] | null = null;

export const runRepository = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  recordRun(run: CompletedRun): void {
    const runs = readAll();
    const nextId = runs.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    runs.push({
      id: nextId,
      gridDimension: run.gridSize.dimension,
      timeMillis: run.timeMillis,
      mistakes: run.mistakes,
      completedAtEpochMillis: Date.now(),
    });
    writeAll(runs);
  },

  bestTimeMillis(gridSize: GridSize): number | null {
    const times = readAll()
      .filter((r) => r.gridDimension === gridSize.dimension)
      .map((r) => r.timeMillis);
    return times.length ? Math.min(...times) : null;
  },

  allRuns(): RunRecord[] {
    if (!cachedAllRuns) {
      cachedAllRuns = readAll().sort((a, b) => b.completedAtEpochMillis - a.completedAtEpochMillis);
    }
    return cachedAllRuns;
  },
};
