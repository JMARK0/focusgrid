import { useNavigate, useParams } from 'react-router-dom';
import { formatSeconds } from '../../domain/stopwatch';
import { GRID_SIZES, gridSizeByDimension } from '../../domain/gridSize';
import { RANK_LABEL } from '../../domain/stars';
import { ROUNDS_PER_STAGE, roundsCompletedForDimension } from '../../data/progress';
import '../screen.css';
import './result.css';

const CONFETTI_COLORS = ['#fbd000', '#00a800', '#e52521', '#5c94fc', '#c84c0c'];

// Deterministic pseudo-randomness (golden-angle spread) keeps this a pure render
// while still looking scattered — no need for real randomness for a visual flourish.
const CONFETTI_PIECES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: (i * 137.5) % 100,
  delay: (i * 53) % 250,
  duration: 900 + ((i * 97) % 500),
  rotation: (i * 71) % 360,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

function Confetti() {
  const pieces = CONFETTI_PIECES;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function ResultScreen() {
  const { dimension, timeMillis, mistakes, isNewBest, stars, combo } = useParams();
  const navigate = useNavigate();

  const dim = Number(dimension);
  const starCount = (Number(stars) || 1) as 1 | 2 | 3;
  const comboCount = Number(combo) || 0;
  const newBest = isNewBest === 'true';
  const gridSize = gridSizeByDimension(dim);
  const nextIndex = GRID_SIZES.findIndex((s) => s.dimension === dim) + 1;
  const nextStage = GRID_SIZES[nextIndex];

  // The run that landed on this screen was already persisted by useGame
  // before navigating here, so this count already includes it.
  const roundsCompleted = Math.min(roundsCompletedForDimension(dim), ROUNDS_PER_STAGE);
  const stageCleared = roundsCompleted >= ROUNDS_PER_STAGE;
  const justClearedStage = roundsCompleted === ROUNDS_PER_STAGE;
  const celebrate = newBest || justClearedStage;

  return (
    <div
      className="screen result-screen"
      style={{ ['--accent' as string]: gridSize.accent, ['--accent-soft' as string]: gridSize.accentSoft }}
    >
      {celebrate && <Confetti />}

      <div className="clear-banner">{justClearedStage && nextStage ? 'STAGE CLEAR!' : 'LEVEL COMPLETE'}</div>
      <div className="rank-badge">{RANK_LABEL[starCount]}</div>

      <div className="star-row">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={i <= starCount ? 'result-star result-star-filled' : 'result-star'}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            ★
          </span>
        ))}
      </div>

      <div className="result-time">{formatSeconds(Number(timeMillis))}</div>

      {newBest && <div className="best-pill">NEW BEST!</div>}

      <div className="stat-row">
        <div className="stat-chip">
          <span className="stat-value">{mistakes}</span>
          <span className="stat-label">mistakes</span>
        </div>
        {comboCount >= 3 && (
          <div className="stat-chip">
            <span className="stat-value">{comboCount}x</span>
            <span className="stat-label">best streak</span>
          </div>
        )}
        {nextStage && (
          <div className="stat-chip">
            <span className="stat-value">
              {roundsCompleted}/{ROUNDS_PER_STAGE}
            </span>
            <span className="stat-label">{gridSize.label} rounds</span>
          </div>
        )}
      </div>

      <div className="result-actions">
        {nextStage && stageCleared ? (
          <>
            <button
              className="btn btn-primary btn-large"
              onClick={() => navigate(`/play/${nextStage.dimension}`, { replace: true })}
            >
              Next: {nextStage.tierName} →
            </button>
            <button className="btn btn-outline" onClick={() => navigate(`/play/${dimension}`, { replace: true })}>
              Replay {gridSize.label}
            </button>
          </>
        ) : nextStage ? (
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate(`/play/${dimension}`, { replace: true })}
          >
            Next round ({roundsCompleted}/{ROUNDS_PER_STAGE}) →
          </button>
        ) : (
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate(`/play/${dimension}`, { replace: true })}
          >
            Play again
          </button>
        )}
        <button className="btn-text" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}
