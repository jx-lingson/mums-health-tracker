"use client";

import { useState } from "react";
import { HealthData, VitalReading, VitalType } from "@/lib/types";
import { VITAL_TYPES } from "@/lib/constants";
import Sparkline from "./Sparkline";

interface VitalsViewProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

export default function VitalsView({ data, onUpdate }: VitalsViewProps) {
  const [selectedType, setSelectedType] = useState<VitalType>("blood-pressure");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const vitalDef = VITAL_TYPES.find((v) => v.id === selectedType)!;
  const readings = data.vitals
    .filter((r) => r.type === selectedType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    const reading: VitalReading = {
      id: crypto.randomUUID(),
      type: selectedType,
      value: value.trim(),
      unit: vitalDef.unit,
      date: date,
    };
    onUpdate((prev) => ({ ...prev, vitals: [...prev.vitals, reading] }));
    setValue("");
  }

  function handleDelete(id: string) {
    onUpdate((prev) => ({ ...prev, vitals: prev.vitals.filter((v) => v.id !== id) }));
  }

  const sparklineValues = [...readings]
    .reverse()
    .map((r) => {
      const num = parseFloat(r.value.split("/")[0]);
      return isNaN(num) ? null : num;
    })
    .filter((v): v is number => v !== null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap gap-2">
        {VITAL_TYPES.map((vt) => (
          <button
            key={vt.id}
            onClick={() => setSelectedType(vt.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedType === vt.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {vt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Log {vitalDef.label}</h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`${vitalDef.placeholder} ${vitalDef.unit}`}
            className="flex-1 min-w-[140px] border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Log
          </button>
        </div>
      </form>

      {sparklineValues.length >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Trend</h4>
          <Sparkline values={sparklineValues} />
        </div>
      )}

      {readings.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No {vitalDef.label.toLowerCase()} readings yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                <th className="text-left p-3 text-gray-500 font-medium">Value</th>
                <th className="text-right p-3 text-gray-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 group hover:bg-gray-50">
                  <td className="p-3 text-gray-600">
                    {new Date(r.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-3 text-gray-900 font-medium">
                    {r.value} <span className="text-gray-400 font-normal">{r.unit}</span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
