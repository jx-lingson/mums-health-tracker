"use client";

import { useState } from "react";
import { HealthData } from "@/lib/types";
import { BODY_PARTS, VITAL_TYPES } from "@/lib/constants";

interface AISummaryProps {
  data: HealthData;
}

export default function AISummary({ data }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const hasData =
    Object.keys(data.bodyParts).length > 0 ||
    data.markers.length > 0 ||
    data.vitals.length > 0 ||
    data.medications.length > 0;

  async function generateSummary() {
    setLoading(true);
    try {
      const annotations = buildAnnotationsText(data);
      const vitals = buildVitalsText(data);
      const medications = buildMedicationsText(data);
      const allergies = buildAllergiesText(data);

      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations, vitals, medications, allergies }),
      });

      const result = await res.json();
      setSummary(result.summary);
      setLastUpdated(new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setSummary("Unable to generate summary right now.");
    }
    setLoading(false);
  }

  if (!hasData && !summary) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">✦</span>
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">AI Health Summary</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-stone-400">Updated {lastUpdated}</span>}
          <button
            onClick={generateSummary}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Analysing..." : summary ? "Refresh" : "Generate Summary"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Analysing health data...</p>
        </div>
      )}

      {!loading && summary && (
        <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{summary}</div>
      )}

      {!loading && !summary && (
        <p className="text-sm text-stone-400">
          Click &quot;Generate Summary&quot; to get an AI analysis of all recorded health data.
        </p>
      )}
    </section>
  );
}

function buildAnnotationsText(data: HealthData): string {
  const parts: string[] = [];
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    const label = BODY_PARTS.find((p) => p.id === partId)?.label || partId;
    entry.notes.forEach((n) => {
      parts.push(`${label}: "${n.text}" (${new Date(n.date).toLocaleDateString("en-AU")})`);
    });
  });
  data.markers.forEach((m) => {
    parts.push(`Marker "${m.label}": "${m.note}" (${new Date(m.createdAt).toLocaleDateString("en-AU")})`);
  });
  return parts.length > 0 ? parts.join("\n") : "";
}

function buildVitalsText(data: HealthData): string {
  const byType: Record<string, string[]> = {};
  data.vitals.forEach((v) => {
    const label = VITAL_TYPES.find((vt) => vt.id === v.type)?.label || v.type;
    if (!byType[label]) byType[label] = [];
    byType[label].push(`${v.value} ${v.unit} (${new Date(v.date).toLocaleDateString("en-AU")})`);
  });
  return Object.entries(byType)
    .map(([label, readings]) => `${label}: ${readings.slice(0, 5).join(", ")}`)
    .join("\n") || "";
}

function buildMedicationsText(data: HealthData): string {
  return data.medications
    .map((m) => `${m.name} ${m.dosage} ${m.frequency}${m.endDate ? " (past)" : " (current)"}`)
    .join("\n") || "";
}

function buildAllergiesText(data: HealthData): string {
  return data.allergies
    .map((a) => `${a.name} (${a.severity}) - ${a.reaction}`)
    .join("\n") || "";
}
