import { useCallback, useRef, useState } from 'react';

/**
 * Tracks a container's box and returns the largest square (in px) that fits
 * inside it. Uses a callback ref (not an object ref + mount-only effect) so
 * it still attaches correctly when the container is conditionally rendered
 * and doesn't exist yet on the component's first render (e.g. behind an
 * intro popup that clears a moment later).
 */
export function useSquareSize<T extends HTMLElement>() {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState(0);

  const ref = useCallback((el: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize(Math.max(0, Math.floor(Math.min(width, height))));
    });
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return { ref, size };
}
