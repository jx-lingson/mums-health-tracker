"use client";

import { useState, useRef, useCallback } from "react";

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

interface DockProps {
  items: DockItem[];
}

export default function Dock({ items }: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Spacer so content doesn't hide behind dock */}
      <div className="h-24 md:hidden" />

      {/* Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4">
        <div
          ref={dockRef}
          className="flex items-end justify-around px-4 py-2.5 bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl"
        >
          {items.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-colors ${
                  item.active
                    ? "bg-orange-600 shadow-lg shadow-orange-600/30"
                    : "bg-neutral-800 hover:bg-neutral-700"
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  item.active ? "text-orange-400" : "text-neutral-500"
                }`}>
                  {item.label}
                </span>
              </button>
          ))}
        </div>
      </div>
    </>
  );
}
