"use client";

import { useState } from "react";
import { BloodMarkerReading } from "@/lib/types";

interface BloodMarkerBarProps {
  readings: BloodMarkerReading[];
  onAdd: (type: string, value: string, unit: string, status: "normal" | "low" | "high") => void;
  onDelete: (id: string) => void;
}

function MiniSparkline({ readings }: { readings: BloodMarkerReading[] }) {
  if (readings.length < 2) {
    const status = readings[0]?.status || "normal";
    const color = status === "normal" ? "#22c55e" : status === "high" ? "#ef4444" : "#3b82f6";
    return (
      <svg viewBox="0 0 60 24" className="w-14 h-6">
        <circle cx="50" cy="12" r="3" fill={color} />
      </svg>
    );
  }

  const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const values = sorted.map((r) => parseFloat(r.value)).filter((v) => !isNaN(v));
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = 4 + (i / (values.length - 1)) * 52;
    const y = 20 - ((v - min) / range) * 16;
    return { x, y, status: sorted[i].status || "normal" };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 60 24" className="w-14 h-6">
      <path d={linePath} fill="none" stroke="#525252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const color = p.status === "normal" ? "#22c55e" : p.status === "high" ? "#ef4444" : "#3b82f6";
        return <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 2} fill={color} />;
      })}
    </svg>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "normal") return <span className="text-green-500 text-xs">✓</span>;
  if (status === "high") return <span className="text-red-400 text-xs">↑</span>;
  return <span className="text-blue-400 text-xs">↓</span>;
}

export default function BloodMarkerBar({ readings, onAdd, onDelete }: BloodMarkerBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newStatus, setNewStatus] = useState<"normal" | "low" | "high">("normal");
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null);

  // Group readings by marker type
  const grouped: Record<string, BloodMarkerReading[]> = {};
  readings.forEach((r) => {
    const key = r.type;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  Object.values(grouped).forEach((arr) =>
    arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );

  const markerTypes = Object.keys(grouped).sort();

  // Get unique dates across all markers (most recent 4)
  const allDates = [...new Set(readings.map((r) => r.date.split("T")[0]))].sort();
  const displayDates = allDates.slice(-4);

  const statusBg: Record<string, string> = {
    normal: "bg-green-500/10 text-green-400",
    high: "bg-red-500/10 text-red-400",
    low: "bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Blood Markers</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-orange-500 font-medium hover:text-orange-400 transition-colors">
          {showAdd ? "Cancel" : "+ Log"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newType.trim() || !newValue.trim()) return;
          onAdd(newType.trim(), newValue.trim(), newUnit.trim(), newStatus);
          setNewType(""); setNewValue(""); setNewUnit(""); setNewStatus("normal"); setShowAdd(false);
        }} className="space-y-2 pb-4 mb-4 border-b border-neutral-800">
          <div className="flex gap-2">
            <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Marker (e.g. WBC)"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Value"
              className="w-24 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="text" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unit"
              className="w-24 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Status:</span>
            {(["normal", "low", "high"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setNewStatus(s)}
                className={`px-2 py-0.5 text-xs rounded-full capitalize transition-colors ${newStatus === s ? statusBg[s] : "bg-neutral-800 text-neutral-500"}`}>{s}</button>
            ))}
            <button type="submit" disabled={!newType.trim() || !newValue.trim()}
              className="ml-auto px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save</button>
          </div>
        </form>
      )}

      {markerTypes.length === 0 && !showAdd && (
        <p className="text-xs text-neutral-700 text-center py-3">No blood markers recorded yet. Upload a blood test to auto-populate.</p>
      )}

      {markerTypes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-600 pb-2 pr-4 w-36">Marker</th>
                <th className="text-center text-xs font-medium text-neutral-600 pb-2 px-2 w-16">Trend</th>
                {displayDates.map((d) => (
                  <th key={d} className="text-center text-xs font-medium text-neutral-600 pb-2 px-2">
                    {new Date(d + "T12:00:00").toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {markerTypes.map((type) => {
                const history = grouped[type];
                const isExpanded = expandedMarker === type;
                const unit = history[0]?.unit || "";

                return (
                  <tr key={type}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedMarker(isExpanded ? null : type)}>
                    <td className="py-2.5 pr-4">
                      <span className="text-sm text-neutral-300">{type}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <MiniSparkline readings={history} />
                    </td>
                    {displayDates.map((d) => {
                      const reading = history.find((r) => r.date.split("T")[0] === d);
                      if (!reading) return <td key={d} className="py-2.5 px-2 text-center text-neutral-700 text-xs">-</td>;
                      return (
                        <td key={d} className="py-2.5 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${statusBg[reading.status || "normal"]}`}>
                            <StatusIcon status={reading.status || "normal"} />
                            {reading.value} <span className="text-[10px] opacity-60">{unit}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
