import { memo } from 'react';
import { tokenLabel } from '../../domain/token';
import type { Token } from '../../domain/token';

interface GameGridProps {
  board: Token[];
  clearedIndices: Set<number>;
  wrongTapIndex: number | null;
  justClearedIndex: number | null;
  dimension: number;
  boardSize: number;
  onCellTapped: (index: number) => void;
}

/**
 * Memoized so the ~50ms elapsed-time tick (which changes GameScreen's state
 * on every render but not board/clearedIndices/wrongTapIndex/justClearedIndex)
 * doesn't re-render every cell 20x/second during play — only an actual board
 * change (tap, reshuffle) does.
 */
function GameGrid({
  board,
  clearedIndices,
  wrongTapIndex,
  justClearedIndex,
  dimension,
  boardSize,
  onCellTapped,
}: GameGridProps) {
  return (
    <div
      className="game-grid"
      style={{
        gridTemplateColumns: `repeat(${dimension}, 1fr)`,
        width: boardSize || undefined,
        height: boardSize || undefined,
        ['--cell-size' as string]: `${boardSize / dimension}px`,
      }}
    >
      {board.map((token, index) => {
        const isCleared = clearedIndices.has(index);
        const isWrong = wrongTapIndex === index;
        const isJustCleared = justClearedIndex === index;
        const isDarkCell = (Math.floor(index / dimension) + (index % dimension)) % 2 === 0;
        const label = tokenLabel(token);
        const shrink = label.length >= 3 ? 0.65 : label.length === 2 ? 0.85 : 1;
        return (
          <button
            key={index}
            className={[
              'grid-cell',
              isDarkCell ? 'cell-dark' : 'cell-light',
              isCleared ? 'cell-cleared' : '',
              isWrong ? 'cell-wrong' : '',
              isJustCleared ? 'cell-pop' : '',
            ].join(' ')}
            style={{ fontSize: `calc(var(--cell-size, 40px) * 0.28 * ${shrink})` }}
            disabled={isCleared}
            aria-label={isCleared ? 'Cell cleared' : `Cell showing ${label}`}
            onClick={() => onCellTapped(index)}
          >
            {!isCleared && label}
          </button>
        );
      })}
    </div>
  );
}

export default memo(GameGrid);
