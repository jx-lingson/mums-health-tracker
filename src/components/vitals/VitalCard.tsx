"use client";

import { useState } from "react";
import { HealthData, VitalReading } from "@/lib/types";
import { VitalTypeDef } from "@/lib/constants";
import Sparkline from "./Sparkline";

interface VitalCardProps {
  vitalDef: VitalTypeDef;
  readings: VitalReading[];
  onLog: (value: string, date: string) => void;
  onDelete: (id: string) => void;
}

export default function VitalCard({ vitalDef, readings, onLog, onDelete }: VitalCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const sorted = [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0];
  const sparklineValues = [...sorted]
    .reverse()
    .map((r) => parseFloat(r.value.split("/")[0]))
    .filter((v) => !isNaN(v));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onLog(value.trim(), date);
    setValue("");
    setIsLogging(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{vitalDef.label}</h4>
        <button
          onClick={() => setIsLogging(!isLogging)}
          className="text-orange-600 hover:text-orange-700 text-xs font-medium"
        >
          {isLogging ? "Cancel" : "+ Log"}
        </button>
      </div>

      {latest ? (
        <div>
          <p className="text-2xl font-bold text-stone-900 tabular-nums">
            {latest.value}
            <span className="text-sm font-normal text-stone-400 ml-1">{vitalDef.unit}</span>
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {new Date(latest.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-stone-400 py-2">No readings</p>
      )}

      {sparklineValues.length >= 2 && (
        <div className="mt-3">
          <Sparkline values={sparklineValues} color="#ea580c" />
        </div>
      )}

      {isLogging && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`${vitalDef.placeholder} ${vitalDef.unit}`}
            className="w-full border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-40 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {sorted.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mt-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          {showHistory ? "Hide history" : `${sorted.length} reading${sorted.length > 1 ? "s" : ""}`}
        </button>
      )}

      {showHistory && (
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
          {sorted.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs py-1 group">
              <span className="text-stone-500">
                {new Date(r.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-700">{r.value} {vitalDef.unit}</span>
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-stone-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
