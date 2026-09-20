/**
 * Original pixel-art emblem — a mini checkerboard grid with a highlighted
 * "next target" cell, echoing the actual gameplay board. No external assets.
 */
export default function RetroLogo() {
  const cellSize = 24;
  const gap = 4;
  const offset = 10;

  return (
    <svg className="retro-logo" viewBox="0 0 100 100" role="img" aria-label="FocusGrid logo">
      <rect x="2" y="2" width="96" height="96" rx="6" fill="#fff8e6" stroke="#1a1a1f" strokeWidth="6" />
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const isTarget = i === 4;
        const isDark = (row + col) % 2 === 0;
        const fill = isTarget ? '#e52521' : isDark ? '#ffe9a8' : '#fff8e6';
        return (
          <rect
            key={i}
            x={offset + col * (cellSize + gap)}
            y={offset + row * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            fill={fill}
            stroke="#1a1a1f"
            strokeWidth="3"
          />
        );
      })}
    </svg>
  );
}
