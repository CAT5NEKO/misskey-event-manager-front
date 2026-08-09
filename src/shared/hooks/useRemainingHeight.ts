import { useCallback, useState } from 'react';

interface RemainingHeightOptions {
  minHeight?: number;
  enabled?: boolean;
  offset?: number;
}

export function useRemainingHeight({
  minHeight = 120,
  enabled = true,
  offset = 24,
}: RemainingHeightOptions = {}) {
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      if (!enabled || !el) return;

      let last = -1;
      const update = () => {
        if (el.offsetWidth === 0) return;
        const next = Math.max(minHeight, window.innerHeight - el.getBoundingClientRect().top - offset);
        if (last !== next) {
          last = next;
          setMaxHeight(next);
        }
      };

      const ro = new ResizeObserver(update);
      ro.observe(el);
      window.addEventListener('resize', update);
      update();

      return () => {
        ro.disconnect();
        window.removeEventListener('resize', update);
        setMaxHeight(null);
      };
    },
    [enabled, minHeight, offset],
  );

  return { ref, maxHeight };
}