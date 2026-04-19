"use client";

import { useState, useMemo } from "react";
import { BloodMarkerReading } from "@/lib/types";
import { BLOOD_MARKER_DEFS, BLOOD_MARKER_CATEGORIES, BloodMarkerDef, getStatus, findMarkerDef } from "@/lib/bloodMarkers";

interface BloodMarkerBarProps {
  readings: BloodMarkerReading[];
  onAdd: (type: string, value: string, unit: string, status: "normal" | "low" | "high") => void;
  onEdit: (id: string, updates: { comment?: string; date?: string }) => void;
  onDelete: (id: string) => void;
}

function MiniSparkline({ readings }: { readings: BloodMarkerReading[] }) {
  if (readings.length < 2) {
    const status = readings[0]?.status || "normal";
    const color = status === "normal" ? "#22c55e" : status === "high" ? "#ef4444" : "#3b82f6";
    return <svg viewBox="0 0 60 24" className="w-14 h-6"><circle cx="50" cy="12" r="3" fill={color} /></svg>;
  }
  const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const values = sorted.map((r) => parseFloat(r.value)).filter((v) => !isNaN(v));
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => ({
    x: 4 + (i / (values.length - 1)) * 52,
    y: 20 - ((v - min) / range) * 16,
    status: sorted[i].status || "normal",
  }));
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

const statusBg: Record<string, string> = {
  normal: "bg-green-500/10 text-green-400",
  high: "bg-red-500/10 text-red-400",
  low: "bg-blue-500/10 text-blue-400",
};

export default function BloodMarkerBar({ readings, onAdd, onEdit, onDelete }: BloodMarkerBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDef, setSelectedDef] = useState<BloodMarkerDef | null>(null);
  const [newValue, setNewValue] = useState("");
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null);

  // Tracked marker types (ones with readings)
  const trackedTypes = useMemo(() => {
    const types = new Set<string>();
    readings.forEach((r) => types.add(r.type));
    return types;
  }, [readings]);

  // Group readings by marker type
  const grouped: Record<string, BloodMarkerReading[]> = {};
  readings.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

  // Get display order: group by category
  const orderedTypes = useMemo(() => {
    const types = Object.keys(grouped);
    return types.sort((a, b) => {
      const defA = findMarkerDef(a);
      const defB = findMarkerDef(b);
      const catA = defA?.category || "Other";
      const catB = defB?.category || "Other";
      if (catA !== catB) return BLOOD_MARKER_CATEGORIES.indexOf(catA) - BLOOD_MARKER_CATEGORIES.indexOf(catB);
      return a.localeCompare(b);
    });
  }, [grouped]);

  // Get unique dates (most recent 4)
  const allDates = [...new Set(readings.map((r) => r.date.split("T")[0]))].sort();
  const displayDates = allDates.slice(-4);

  // Searchable marker list
  const filteredDefs = BLOOD_MARKER_DEFS.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group filtered defs by category
  const defsByCategory: Record<string, BloodMarkerDef[]> = {};
  filteredDefs.forEach((d) => {
    if (!defsByCategory[d.category]) defsByCategory[d.category] = [];
    defsByCategory[d.category].push(d);
  });

  function handleAddFromDef(def: BloodMarkerDef) {
    setSelectedDef(def);
    setNewValue("");
    setSearch("");
  }

  function handleSubmitValue() {
    if (!selectedDef || !newValue.trim()) return;
    const numVal = parseFloat(newValue);
    const status = isNaN(numVal) ? "normal" : getStatus(selectedDef, numVal);
    onAdd(selectedDef.name, newValue.trim(), selectedDef.unit, status);
    setSelectedDef(null);
    setNewValue("");
    setShowAdd(false);
  }

  // Category headers for the table
  let lastCategory = "";

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Blood Markers</h3>
        <button onClick={() => { setShowAdd(!showAdd); setSelectedDef(null); setSearch(""); }}
          className="text-xs text-orange-500 font-medium hover:text-orange-400 transition-colors">
          {showAdd ? "Done" : "+ Add Marker"}
        </button>
      </div>

      {showAdd && !selectedDef && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search markers (e.g. WBC, ferritin, cholesterol...)"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3" autoFocus />
          <div className="max-h-64 overflow-y-auto space-y-3">
            {Object.entries(defsByCategory).map(([cat, defs]) => (
              <div key={cat}>
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-1">{cat}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {defs.map((d) => {
                    const isTracked = trackedTypes.has(d.name);
                    return (
                      <button key={d.id} onClick={() => handleAddFromDef(d)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isTracked ? "bg-neutral-800 text-neutral-300" : "hover:bg-neutral-800 text-neutral-400"
                        }`}>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{d.name}</span>
                          {isTracked && <span className="text-green-500/50">●</span>}
                        </div>
                        <span className="text-neutral-600">{d.low}{d.high < 900 ? `-${d.high}` : "+"} {d.unit}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && selectedDef && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setSelectedDef(null)} className="text-neutral-500 hover:text-neutral-300 text-sm">←</button>
            <span className="text-sm font-medium text-neutral-200">{selectedDef.name}</span>
            <span className="text-xs text-neutral-600">({selectedDef.unit})</span>
          </div>
          <p className="text-xs text-neutral-600 mb-2">
            Normal range: {selectedDef.low}{selectedDef.high < 900 ? ` - ${selectedDef.high}` : "+"} {selectedDef.unit}
          </p>
          <div className="flex gap-2">
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Enter value (${selectedDef.unit})`}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
            <button onClick={handleSubmitValue} disabled={!newValue.trim()}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Log</button>
          </div>
          {newValue && !isNaN(parseFloat(newValue)) && (
            <p className={`text-xs mt-2 ${statusBg[getStatus(selectedDef, parseFloat(newValue))]?.split(" ")[1] || "text-neutral-400"}`}>
              {parseFloat(newValue)} {selectedDef.unit} is {getStatus(selectedDef, parseFloat(newValue)) === "normal" ? "within normal range" : getStatus(selectedDef, parseFloat(newValue)) === "high" ? "above normal range" : "below normal range"}
            </p>
          )}
        </div>
      )}

      {orderedTypes.length === 0 && !showAdd && (
        <p className="text-xs text-neutral-700 text-center py-3">No blood markers tracked yet. Click &quot;+ Add Marker&quot; to start tracking.</p>
      )}

      {orderedTypes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-600 pb-2 pr-4 w-40">Marker</th>
                <th className="text-center text-xs font-medium text-neutral-600 pb-2 px-2 w-16">Trend</th>
                {displayDates.map((d) => (
                  <th key={d} className="text-center text-xs font-medium text-neutral-600 pb-2 px-2 min-w-[90px]">
                    {new Date(d + "T12:00:00").toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                  </th>
                ))}
                <th className="text-right text-xs font-medium text-neutral-600 pb-2 pl-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {orderedTypes.map((type) => {
                const def = findMarkerDef(type);
                const cat = def?.category || "Other";
                const showHeader = cat !== lastCategory;
                lastCategory = cat;
                const history = grouped[type];
                const unit = history[0]?.unit || def?.unit || "";

                return (
                  <>
                    {showHeader && (
                      <tr key={`cat-${cat}`}>
                        <td colSpan={2 + displayDates.length} className="pt-3 pb-1">
                          <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">{cat}</span>
                        </td>
                      </tr>
                    )}
                    <tr key={type}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/30 cursor-pointer transition-colors group"
                      onClick={() => setExpandedMarker(expandedMarker === type ? null : type)}>
                      <td className="py-2 pr-4">
                        <div>
                          <span className="text-sm text-neutral-300">{type}</span>
                          {def && <span className="text-[10px] text-neutral-700 ml-1.5">{def.low}{def.high < 900 ? `-${def.high}` : "+"}</span>}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center"><MiniSparkline readings={history} /></td>
                      {displayDates.map((d) => {
                        const reading = history.find((r) => r.date.split("T")[0] === d);
                        if (!reading) return <td key={d} className="py-2 px-2 text-center text-neutral-700 text-xs">-</td>;
                        return (
                          <td key={d} className="py-2 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${statusBg[reading.status || "normal"]}`}>
                              <StatusIcon status={reading.status || "normal"} />
                              {reading.value} <span className="text-[10px] opacity-60">{unit}</span>
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2 pl-2 text-right">
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete all ${type} readings?`)) history.forEach((r) => onDelete(r.id)); }}
                          className="text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                      </td>
                    </tr>
                    {expandedMarker === type && (
                      <tr key={`${type}-expanded`}>
                        <td colSpan={3 + displayDates.length} className="pb-2">
                          <div className="ml-1 space-y-1.5 pt-1">
                            {[...history].reverse().map((r) => (
                              <ExpandedRow key={r.id} reading={r} unit={unit} onEdit={onEdit} onDelete={onDelete} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpandedRow({ reading, unit, onEdit, onDelete }: {
  reading: BloodMarkerReading; unit: string;
  onEdit: (id: string, updates: { comment?: string; date?: string }) => void; onDelete: (id: string) => void;
}) {
  const [editingComment, setEditingComment] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [comment, setComment] = useState(reading.comment || "");
  const [date, setDate] = useState(reading.date.split("T")[0]);

  return (
    <div className="flex items-center gap-2 text-xs py-0.5 group/row">
      {editingDate ? (
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            autoFocus />
          <button onClick={() => { onEdit(reading.id, { date: date + "T12:00:00.000Z" }); setEditingDate(false); }}
            className="text-orange-500 hover:text-orange-400">✓</button>
          <button onClick={() => { setEditingDate(false); setDate(reading.date.split("T")[0]); }}
            className="text-neutral-600 hover:text-neutral-400">✕</button>
        </div>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); setEditingDate(true); }}
          className="text-neutral-600 hover:text-neutral-400 w-24 flex-shrink-0 text-left">
          {new Date(reading.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
        </button>
      )}
      <span className={`font-medium tabular-nums flex-shrink-0 ${statusBg[reading.status || "normal"]?.split(" ")[1]}`}>
        {reading.value} {unit}
      </span>
      <div className="flex-1 min-w-0">
        {editingComment ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Add comment..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus onKeyDown={(e) => { if (e.key === "Enter") { onEdit(reading.id, { comment }); setEditingComment(false); } }} />
            <button onClick={() => { onEdit(reading.id, { comment }); setEditingComment(false); }}
              className="text-orange-500 hover:text-orange-400">✓</button>
            <button onClick={() => { setEditingComment(false); setComment(reading.comment || ""); }}
              className="text-neutral-600 hover:text-neutral-400">✕</button>
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setEditingComment(true); }}
            className={`text-left truncate ${reading.comment ? "text-neutral-500" : "text-neutral-700 hover:text-neutral-500"}`}>
            {reading.comment || "Add comment..."}
          </button>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this reading?")) onDelete(reading.id); }}
        className="text-neutral-700 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity flex-shrink-0">&times;</button>
    </div>
  );
}
