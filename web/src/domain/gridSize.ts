export interface GridSize {
  dimension: number;
  label: string;
  /** World-map style level badge, e.g. "1-1". */
  worldLabel: string;
  tierName: string;
  /** Accent color for this tier, warming up as difficulty rises (cool = approachable, hot = expert). */
  accent: string;
  accentSoft: string;
  /** One wrong tap resets the whole round instead of just counting a mistake. */
  hardcore: boolean;
  /** Times-table boards only ever appear at this tier — everywhere else stays numbers/letters. */
  tablesEnabled: boolean;
}

export const GRID_SIZES: GridSize[] = [
  { dimension: 3, label: '3×3', worldLabel: '1-1', tierName: 'Warm-up', accent: '#00a800', accentSoft: '#d3f4d3', hardcore: false, tablesEnabled: false },
  { dimension: 4, label: '4×4', worldLabel: '1-2', tierName: 'Easy', accent: '#2c5fd6', accentSoft: '#d6e2fb', hardcore: false, tablesEnabled: false },
  { dimension: 5, label: '5×5', worldLabel: '1-3', tierName: 'Focus', accent: '#c99900', accentSoft: '#faedbf', hardcore: false, tablesEnabled: false },
  { dimension: 6, label: '6×6', worldLabel: '1-4', tierName: 'Sharp', accent: '#c84c0c', accentSoft: '#f7d9c2', hardcore: false, tablesEnabled: false },
  { dimension: 7, label: '7×7', worldLabel: '1-5', tierName: 'Expert', accent: '#a01512', accentSoft: '#f4c9c8', hardcore: true, tablesEnabled: true },
];

export const DEFAULT_GRID_SIZE: GridSize = GRID_SIZES[2];

export const cellCount = (size: GridSize): number => size.dimension * size.dimension;

export const gridSizeByDimension = (dimension: number): GridSize =>
  GRID_SIZES.find((s) => s.dimension === dimension) ?? DEFAULT_GRID_SIZE;
