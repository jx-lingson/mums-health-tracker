"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useCloudStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Load from localStorage first for instant display
      try {
        const stored = localStorage.getItem(key);
        if (stored && !cancelled) {
          setValue(JSON.parse(stored));
        }
      } catch {}

      // Then fetch from cloud
      try {
        const res = await fetch("/api/data");
        const result = await res.json();
        if (result.data && !cancelled) {
          setValue(result.data);
          try { localStorage.setItem(key, JSON.stringify(result.data)); } catch {}
        }
      } catch {
        // Cloud unavailable, localStorage data stands
      }

      if (!cancelled) setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [key]);

  const saveToCloud = useCallback((data: T) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });
      } catch {
        // Silent fail, data is still in localStorage
      }
      setSyncing(false);
    }, 500); // Debounce 500ms
  }, []);

  const setAndSync = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newVal === "function" ? (newVal as (prev: T) => T)(prev) : newVal;
        // Save to localStorage immediately
        try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
        // Debounced save to cloud
        saveToCloud(resolved);
        return resolved;
      });
    },
    [key, saveToCloud]
  );

  return [loaded ? value : initialValue, setAndSync, syncing];
}
