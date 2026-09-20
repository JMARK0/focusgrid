import { tokenLabel } from '../../domain/token';
import type { Token } from '../../domain/token';
import type { BoardMode, Direction } from '../../domain/gridGenerator';

interface IntroPopupProps {
  mode: BoardMode;
  tableBase: number;
  sequence: Token[];
  direction: Direction;
  hardcore: boolean;
}

/** Brief pre-round popup — auto-dismisses via useGame's introVisible timer. */
export default function IntroPopup({ mode, tableBase, sequence, direction, hardcore }: IntroPopupProps) {
  const first = tokenLabel(sequence[0]);
  const last = tokenLabel(sequence[sequence.length - 1]);
  const isReverse = direction === 'desc';

  return (
    <div className="intro-overlay">
      <div className="intro-card">
        {mode === 'table' && <div className="intro-table-label">✖ {tableBase} TIMES TABLE</div>}
        {isReverse ? (
          <div className="intro-reverse">
            ⇄ REVERSE
            <span className="intro-range">
              {first} ← {last}
            </span>
          </div>
        ) : (
          <div className="intro-range intro-range-big">
            {first} → {last}
          </div>
        )}
        {hardcore ? (
          <div className="intro-stakes intro-stakes-danger">☠ ONE MISTAKE RESETS THE LEVEL</div>
        ) : (
          <div className="intro-stakes">⏱ Clear it before time runs out!</div>
        )}
      </div>
    </div>
  );
}
