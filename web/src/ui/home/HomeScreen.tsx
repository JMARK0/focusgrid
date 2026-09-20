import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatSeconds } from '../../domain/stopwatch';
import { GRID_SIZES } from '../../domain/gridSize';
import { stageLadder, ROUNDS_PER_STAGE } from '../../data/progress';
import { useAllRuns } from '../../data/useRuns';
import Footer from './Footer';
import RetroLogo from './RetroLogo';
import '../screen.css';
import './home.css';

function currentStreak(completedAtEpochMillis: number[]): number {
  if (completedAtEpochMillis.length === 0) return 0;

  const toDayKey = (epochMillis: number) => {
    const d = new Date(epochMillis);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const DAY = 24 * 60 * 60 * 1000;

  const playedDays = Array.from(new Set(completedAtEpochMillis.map(toDayKey))).sort((a, b) => b - a);

  const today = toDayKey(Date.now());
  let expected = playedDays[0] === today ? today : today - DAY;
  if (playedDays[0] !== today && playedDays[0] !== expected) return 0;

  let streak = 0;
  for (const day of playedDays) {
    if (day === expected) {
      streak++;
      expected -= DAY;
    } else if (day < expected) {
      break;
    }
  }
  return streak;
}

function Stars({ count }: { count: 0 | 1 | 2 | 3 }) {
  return (
    <span className="stars" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= count ? 'star star-filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const allRuns = useAllRuns();

  // Recomputed on every render, which happens whenever allRuns changes (localStorage is the source of truth).
  const ladder = stageLadder();
  const streakDays = useMemo(
    () => currentStreak(allRuns.map((r) => r.completedAtEpochMillis)),
    [allRuns],
  );
  const totalStars = ladder.reduce((sum, s) => sum + s.stars, 0);

  return (
    <div className="screen home-screen">
      <RetroLogo />
      <h1 className="home-title">FocusGrid</h1>
      <div className="world-label">WORLD 1</div>

      <div className="summary-row">
        <div className="summary-chip pixel-panel">
          <span className="summary-icon">★</span>
          <span className="summary-value">{totalStars}/15</span>
        </div>
        <div className="summary-chip pixel-panel">
          <span className="summary-icon">🔥</span>
          <span className="summary-value">{streakDays > 0 ? streakDays : 0}</span>
        </div>
      </div>

      <div className="stage-path">
        {ladder.map(({ dimension, bestTimeMillis, stars, roundsCompleted, cleared, unlocked }, i) => {
          const size = GRID_SIZES[i];
          const previous = GRID_SIZES[i - 1];
          const roundsShown = Math.min(roundsCompleted, ROUNDS_PER_STAGE);
          return (
            <div className="stage-row" key={dimension}>
              {i > 0 && <div className={`stage-connector ${unlocked ? 'connector-lit' : ''}`} />}
              <button
                className={`stage-card pixel-btn ${unlocked ? '' : 'stage-locked'} ${cleared ? 'stage-cleared' : ''}`}
                disabled={!unlocked}
                onClick={() => navigate(`/play/${dimension}`)}
                style={{ ['--stage-accent' as string]: size.accent }}
              >
                <div className="stage-badge">
                  {unlocked ? size.worldLabel : '🔒'}
                  {cleared && <span className="stage-flag">🚩</span>}
                </div>
                <div className="stage-body">
                  <div className="stage-name">{size.tierName}</div>
                  <div className="stage-sub">
                    {unlocked
                      ? cleared
                        ? bestTimeMillis != null
                          ? `${size.label} · Best ${formatSeconds(bestTimeMillis)}`
                          : `${size.label} · Not played`
                        : `${size.label} · Round ${roundsShown}/${ROUNDS_PER_STAGE}`
                      : `Clear ${previous.tierName} to unlock`}
                  </div>
                  {unlocked && !cleared && (
                    <div className="stage-progress-track">
                      <div
                        className="stage-progress-fill"
                        style={{ width: `${(roundsShown / ROUNDS_PER_STAGE) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                {unlocked && <Stars count={stars} />}
              </button>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
