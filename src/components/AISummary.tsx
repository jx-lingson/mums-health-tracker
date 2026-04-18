"use client";

import { useState } from "react";
import { HealthData } from "@/lib/types";
import { BODY_PARTS, VITAL_TYPES } from "@/lib/constants";

interface AISummaryProps {
  data: HealthData;
}

function loadStored(): { summary: string | null; lastUpdated: string | null } {
  if (typeof window === "undefined") return { summary: null, lastUpdated: null };
  try {
    const raw = localStorage.getItem("health-tracker-ai-summary");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { summary: null, lastUpdated: null };
}

export default function AISummary({ data }: AISummaryProps) {
  const [stored] = useState(loadStored);
  const [summary, setSummaryState] = useState<string | null>(stored.summary);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdatedState] = useState<string | null>(stored.lastUpdated);

  function setSummary(s: string) {
    const ts = new Date().toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    setSummaryState(s);
    setLastUpdatedState(ts);
    try { localStorage.setItem("health-tracker-ai-summary", JSON.stringify({ summary: s, lastUpdated: ts })); } catch {}
  }

  const hasData = Object.keys(data.bodyParts).length > 0 || data.markers.length > 0 || data.vitals.length > 0 || data.medications.length > 0;

  async function generateSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annotations: buildAnnotationsText(data),
          vitals: buildVitalsText(data),
          medications: buildMedicationsText(data),
          allergies: buildAllergiesText(data),
        }),
      });
      const result = await res.json();
      setSummary(result.summary);
    } catch {
      setSummary("Unable to generate summary right now.");
    }
    setLoading(false);
  }

  if (!hasData && !summary) return null;

  return (
    <section className="bg-gradient-to-br from-orange-950/40 to-neutral-900 rounded-2xl border border-orange-900/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <span className="text-xs text-white">AI</span>
          </div>
          <h2 className="text-sm font-semibold text-neutral-300">Health Summary</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-neutral-600">{lastUpdated}</span>}
          <button onClick={generateSummary} disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50 transition-colors">
            {loading ? "Analysing..." : summary ? "Refresh" : "Generate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-orange-800 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Analysing health data...</p>
        </div>
      )}

      {!loading && summary && (
        <div className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{summary}</div>
      )}

      {!loading && !summary && (
        <p className="text-sm text-neutral-600">Click &quot;Generate&quot; to get an AI analysis of all recorded health data.</p>
      )}
    </section>
  );
}

function buildAnnotationsText(data: HealthData): string {
  const parts: string[] = [];
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    const label = BODY_PARTS.find((p) => p.id === partId)?.label || partId;
    entry.notes.forEach((n) => { parts.push(`${label}: "${n.text}" (${new Date(n.date).toLocaleDateString("en-AU")})`); });
  });
  data.markers.forEach((m) => { parts.push(`Marker "${m.label}": "${m.note}" (${new Date(m.createdAt).toLocaleDateString("en-AU")})`); });
  return parts.length > 0 ? parts.join("\n") : "";
}

function buildVitalsText(data: HealthData): string {
  const byType: Record<string, string[]> = {};
  data.vitals.forEach((v) => { const l = VITAL_TYPES.find((vt) => vt.id === v.type)?.label || v.type; if (!byType[l]) byType[l] = []; byType[l].push(`${v.value} ${v.unit} (${new Date(v.date).toLocaleDateString("en-AU")})`); });
  return Object.entries(byType).map(([l, r]) => `${l}: ${r.slice(0, 5).join(", ")}`).join("\n") || "";
}

function buildMedicationsText(data: HealthData): string {
  return data.medications.map((m) => `${m.name} ${m.dosage} ${m.frequency}${m.endDate ? " (past)" : " (current)"}`).join("\n") || "";
}

function buildAllergiesText(data: HealthData): string {
  return data.allergies.map((a) => `${a.name} (${a.severity}) - ${a.reaction}`).join("\n") || "";
}
