"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useCloudStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void, boolean, () => Promise<void>] {
  const [value, setValue] = useState<T>(initialValue);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFromCloud = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setValue(result.data);
          try { localStorage.setItem(key, JSON.stringify(result.data)); } catch {}
        }
      }
    } catch {}
    setSyncing(false);
  }, [key]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stored = localStorage.getItem(key);
        if (stored && !cancelled) setValue(JSON.parse(stored));
      } catch {}

      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const result = await res.json();
          if (!cancelled && result.data) {
            setValue(result.data);
            try { localStorage.setItem(key, JSON.stringify(result.data)); } catch {}
          }
        }
      } catch {}

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
      } catch {}
      setSyncing(false);
    }, 500);
  }, []);

  const setAndSync = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof newVal === "function" ? (newVal as (prev: T) => T)(prev) : newVal;
        try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
        saveToCloud(resolved);
        return resolved;
      });
    },
    [key, saveToCloud]
  );

  return [loaded ? value : initialValue, setAndSync, syncing, fetchFromCloud];
}
