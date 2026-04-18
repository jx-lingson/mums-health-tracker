"use client";

import { useState } from "react";
import { BloodMarkerReading } from "@/lib/types";

interface BloodMarkerBarProps {
  readings: BloodMarkerReading[];
  onAdd: (type: string, value: string, unit: string, status: "normal" | "low" | "high") => void;
  onDelete: (id: string) => void;
}

export default function BloodMarkerBar({ readings, onAdd, onDelete }: BloodMarkerBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newStatus, setNewStatus] = useState<"normal" | "low" | "high">("normal");

  // Group by type, get latest for each
  const grouped: Record<string, BloodMarkerReading[]> = {};
  readings.forEach((r) => {
    const key = r.type.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  // Sort each group by date
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  const markerTypes = Object.keys(grouped).sort();

  const statusColor = {
    normal: "text-green-400",
    low: "text-blue-400",
    high: "text-red-400",
  };

  const statusBg = {
    normal: "bg-green-500/10 border-green-500/20",
    low: "bg-blue-500/10 border-blue-500/20",
    high: "bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
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
        }} className="space-y-2 pb-3 mb-3 border-b border-neutral-800">
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
                className={`px-2 py-0.5 text-xs rounded-full capitalize ${newStatus === s ? statusColor[s] + " " + statusBg[s] : "bg-neutral-800 text-neutral-500"}`}>{s}</button>
            ))}
            <button type="submit" disabled={!newType.trim() || !newValue.trim()}
              className="ml-auto px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save</button>
          </div>
        </form>
      )}

      {markerTypes.length === 0 && !showAdd && (
        <p className="text-xs text-neutral-700 text-center py-2">No blood markers recorded yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {markerTypes.map((type) => {
          const latest = grouped[type][0];
          const history = grouped[type];
          const isExpanded = expandedType === type;

          return (
            <div key={type} className={`transition-all ${isExpanded ? "w-full" : ""}`}>
              <button onClick={() => setExpandedType(isExpanded ? null : type)}
                className={`px-3 py-2 rounded-xl border text-left transition-all ${statusBg[latest.status || "normal"]} ${isExpanded ? "w-full" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-300 uppercase">{latest.type}</span>
                  <span className={`text-sm font-bold tabular-nums ${statusColor[latest.status || "normal"]}`}>{latest.value}</span>
                  <span className="text-[10px] text-neutral-600">{latest.unit}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-1 space-y-1">
                  {history.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs py-1 group">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-600 w-20">
                          {new Date(r.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className={`font-medium tabular-nums ${statusColor[r.status || "normal"]}`}>{r.value} {r.unit}</span>
                        <span className={`text-[10px] capitalize ${statusColor[r.status || "normal"]}`}>{r.status}</span>
                      </div>
                      <button onClick={() => onDelete(r.id)}
                        className="text-neutral-700 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
