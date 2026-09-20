import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatSeconds } from '../../domain/stopwatch';
import { directedSequence } from '../../domain/gridGenerator';
import { tokenLabel } from '../../domain/token';
import { useGame, TIMEOUT_RESTART_DELAY_MS } from './useGame';
import { useSquareSize } from './useSquareSize';
import IntroPopup from './IntroPopup';
import GameGrid from './GameGrid';
import './game.css';

function comboLabel(combo: number): { text: string; tier: string } | null {
  if (combo >= 10) return { text: `${combo}x On Fire`, tier: 'fire' };
  if (combo >= 6) return { text: `${combo}x Great`, tier: 'great' };
  if (combo >= 3) return { text: `${combo}x Nice`, tier: 'nice' };
  return null;
}

function timeUrgencyTier(remainingPct: number): string {
  if (remainingPct <= 15) return 'danger';
  if (remainingPct <= 35) return 'warning';
  return '';
}

export default function GameScreen() {
  const { dimension } = useParams();
  const navigate = useNavigate();
  const { state, onCellTapped, togglePause, clearWrongTapFlash, clearJustCleared, restartRound } = useGame(
    Number(dimension) || 5,
  );

  useEffect(() => {
    if (state.roundResultReady) {
      navigate(
        `/result/${state.gridSize.dimension}/${state.finalTimeMillis}/${state.mistakes}/${state.isNewBest}/${state.stars}/${state.bestComboThisRound}`,
        { replace: true },
      );
    }
  }, [
    state.roundResultReady,
    state.gridSize.dimension,
    state.finalTimeMillis,
    state.mistakes,
    state.isNewBest,
    state.stars,
    state.bestComboThisRound,
    navigate,
  ]);

  useEffect(() => {
    if (state.wrongTapIndex == null) return;
    if ('vibrate' in navigator) navigator.vibrate(40);
    const index = state.wrongTapIndex;
    const timeout = setTimeout(() => clearWrongTapFlash(index), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.wrongTapIndex, clearWrongTapFlash]);

  useEffect(() => {
    if (state.justClearedIndex == null) return;
    if ('vibrate' in navigator) navigator.vibrate(10);
    const index = state.justClearedIndex;
    const timeout = setTimeout(() => clearJustCleared(index), 220);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.justClearedIndex, clearJustCleared]);

  useEffect(() => {
    if (!state.timedOut) return;
    if ('vibrate' in navigator) navigator.vibrate([90, 60, 90]);
    const timeout = setTimeout(restartRound, TIMEOUT_RESTART_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [state.timedOut, restartRound]);

  useEffect(() => {
    if (!state.failedTap) return;
    if ('vibrate' in navigator) navigator.vibrate([120, 60, 120, 60, 120]);
    const timeout = setTimeout(restartRound, TIMEOUT_RESTART_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [state.failedTap, restartRound]);

  const dimensionValue = state.gridSize.dimension;
  const { ref: boardWrapperRef, size: boardSize } = useSquareSize<HTMLDivElement>();
  const combo = comboLabel(state.combo);
  const sequence = directedSequence(state.gridSize, state.mode, state.direction, state.tableBase);
  const nextLabel = state.nextIndex < sequence.length ? tokenLabel(sequence[state.nextIndex]) : '✓';
  const progressPct = (state.clearedIndices.size / state.board.length) * 100;
  const timeRemainingPct = Math.max(0, 100 - (state.elapsedMillis / state.timeLimitMillis) * 100);
  const secondsLeft = Math.max(0, Math.ceil((state.timeLimitMillis - state.elapsedMillis) / 1000));

  return (
    <div
      className="game-screen"
      style={{ ['--accent' as string]: state.gridSize.accent, ['--accent-soft' as string]: state.gridSize.accentSoft }}
    >
      <div className="game-topbar">
        <div>
          <div className="level-tag">
            LEVEL {state.gridSize.worldLabel} ·{' '}
            {state.mode === 'number' ? '123' : state.mode === 'letter' ? 'ABC' : `×${state.tableBase}`}
          </div>
          {state.gridSize.hardcore && <div className="hardcore-tag">☠ ONE MISTAKE = RESTART</div>}
          <div className="next-label">
            NEXT {nextLabel}
            {state.direction === 'desc' && <span className="direction-badge">⇄ REVERSE</span>}
          </div>
          <div className="elapsed">{formatSeconds(state.elapsedMillis)}</div>
        </div>
        {combo && (
          <div key={state.combo} className={`combo-badge combo-${combo.tier}`}>
            {combo.text}
          </div>
        )}
        <div className={`time-left ${timeUrgencyTier(timeRemainingPct)}`}>⏱ {secondsLeft}s</div>
        {!state.isComplete && (
          <button
            className="pause-btn"
            aria-label={state.isPaused ? 'Resume' : 'Pause'}
            onClick={togglePause}
            disabled={state.timedOut || state.failedTap || state.introVisible}
          >
            {/* Drawn in CSS, not a Unicode ⏸/▶ glyph — those render as Apple's
                colored emoji on iOS (a clashing box-in-a-box look) but plain
                monochrome on Android, so the button looked broken on iPhone. */}
            <span className={state.isPaused ? 'icon-play' : 'icon-pause'} />
          </button>
        )}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className={`time-track ${timeUrgencyTier(timeRemainingPct)}`}>
        <div className="time-fill" style={{ width: `${timeRemainingPct}%` }} />
      </div>

      {state.introVisible ? (
        <IntroPopup
          mode={state.mode}
          tableBase={state.tableBase}
          sequence={sequence}
          direction={state.direction}
          hardcore={state.gridSize.hardcore}
        />
      ) : state.timedOut ? (
        <div className="timeout-overlay">
          <div className="timeout-title">⏱ Time's up!</div>
          <div className="timeout-sub">Reshuffling the board — here we go again.</div>
        </div>
      ) : state.failedTap && state.wrongTapIndex == null ? (
        <div className="timeout-overlay fail-overlay">
          <div className="timeout-title">💥 Wrong tap!</div>
          <div className="timeout-sub">Expert resets on any mistake — restarting the level...</div>
        </div>
      ) : state.isPaused && !state.isComplete ? (
        <div className="paused-overlay">Paused</div>
      ) : (
        <div className="game-board-wrapper" ref={boardWrapperRef}>
          <GameGrid
            board={state.board}
            clearedIndices={state.clearedIndices}
            wrongTapIndex={state.wrongTapIndex}
            justClearedIndex={state.justClearedIndex}
            dimension={dimensionValue}
            boardSize={boardSize}
            onCellTapped={onCellTapped}
          />
        </div>
      )}
    </div>
  );
}
