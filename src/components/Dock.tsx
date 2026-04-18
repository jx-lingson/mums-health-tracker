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
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setMouseX(clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  return (
    <>
      {/* Spacer so content doesn't hide behind dock */}
      <div className="h-24 md:hidden" />

      {/* Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
          className="flex items-end gap-1.5 px-3 py-2.5 bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl"
        >
          {items.map((item, index) => {
            const itemCenter = 16 + index * 68 + 26; // approximate center of each item
            let scale = 1;
            if (mouseX !== null) {
              const distance = Math.abs(mouseX - itemCenter);
              scale = Math.max(1, 1.5 - distance / 100);
            }

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1 transition-transform duration-150 ease-out origin-bottom"
                style={{ transform: `scale(${scale})` }}
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
            );
          })}
        </div>
      </div>
    </>
  );
}
