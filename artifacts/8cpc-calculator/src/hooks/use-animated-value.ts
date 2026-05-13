import { useState, useEffect, useRef } from "react";

export function useAnimatedValue(target: number, duration = 550) {
  const [current, setCurrent] = useState(target);
  const startRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = startRef.current;
    if (from === target) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(from + (target - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = target;
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return current;
}
