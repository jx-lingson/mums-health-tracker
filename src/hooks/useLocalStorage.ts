"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // corrupt data, use initial value
    }
    setLoaded(true);
  }, [key]);

  const setAndPersist = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newVal === "function" ? (newVal as (prev: T) => T)(prev) : newVal;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full, silently fail
        }
        return resolved;
      });
    },
    [key]
  );

  return [loaded ? value : initialValue, setAndPersist];
}
