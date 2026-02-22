"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a rapidly-changing value.
 *
 * @param value - The value to debounce.
 * @param delay - Debounce delay in milliseconds.
 * @returns The debounced value, updated only after `delay` ms of inactivity.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 300);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
