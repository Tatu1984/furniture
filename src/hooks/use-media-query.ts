"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * SSR-safe: returns `false` on the server (no `window` available).
 *
 * @param query - A valid CSS media query string, e.g. `"(min-width: 768px)"`.
 * @returns `true` when the viewport matches the query, `false` otherwise.
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);

    // Sync in case the value changed between render and effect.
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
