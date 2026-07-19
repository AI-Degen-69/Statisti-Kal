import { useEffect, useRef, useState } from 'react';

export interface TooltipPosition {
  top: number;
  left: number;
}

interface UseScrollPositionedTooltipOptions {
  /** Gate: the effect attaches listeners only while this is truthy. */
  visible: boolean;
  /**
   * Maps the live element rect to the tooltip's fixed position.
   * Compared against the previous position so unchanged frames skip a re-render.
   */
  compute: (rect: DOMRect) => TooltipPosition;
  /** Extra values that should re-run the effect when they change (e.g. an offset prop). */
  deps?: ReadonlyArray<unknown>;
}

/**
 * Positions a fixed/portal tooltip relative to an element, keeping it in sync
 * with scroll and resize — without forcing a layout flush on every event.
 *
 * Subscribes to scroll/resize and coalesces reads into at most one
 * getBoundingClientRect() per animation frame (rAF), registers the scroll
 * listener as passive (capture preserved), and skips the state update when
 * the computed position is unchanged.
 *
 * Shared by the label tooltip, the message popup, and the duplicate
 * InputTooltip in CustomComponents — previously each had a hand-copied
 * version of this effect, which let the forced-reflow bug recur in three
 * places.
 */
export function useScrollPositionedTooltip<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { visible, compute, deps = [] }: UseScrollPositionedTooltipOptions,
): TooltipPosition {
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;

    const update = () => {
      rafRef.current = null;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const next = compute(rect);
      setPosition((prev) =>
        prev.top === next.top && prev.left === next.left ? prev : next,
      );
    };

    const schedule = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    // `passive` is a valid runtime option but absent from this project's
    // strict EventListenerOptions typing, so cast to AddEventListenerOptions.
    const scrollOpts = { capture: true, passive: true } as AddEventListenerOptions;
    update();
    window.addEventListener('scroll', schedule, scrollOpts);
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule, scrollOpts);
      window.removeEventListener('resize', schedule);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ...deps]);

  return position;
}
