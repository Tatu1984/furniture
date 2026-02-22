"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | null;

/**
 * Tracks the current scroll direction of the page.
 *
 * @param threshold - Minimum scroll delta (in px) before a direction change is
 *                    registered. Prevents jitter from tiny scroll movements.
 *                    Defaults to `10`.
 * @returns `"up"` when scrolling up, `"down"` when scrolling down, or `null`
 *          when the page has not been scrolled yet.
 *
 * @example
 * ```tsx
 * const direction = useScrollDirection();
 * // Hide header when scrolling down
 * <header className={direction === "down" ? "hidden" : ""} />
 * ```
 */
export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    lastScrollY.current = window.scrollY;

    const updateDirection = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? "down" : "up");
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateDirection);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}
