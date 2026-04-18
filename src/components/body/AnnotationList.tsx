"use client";

import { useState } from "react";
import { HealthData, Marker, BodyNote } from "@/lib/types";
import { BODY_PARTS } from "@/lib/constants";

interface AnnotationListProps {
  data: HealthData;
  onMarkerClick: (marker: Marker) => void;
  onPartClick: (partId: string) => void;
  markerCounts?: Record<string, number>;
}

function getIntensityColor(count: number): string {
  if (count <= 0) return "rgb(64, 64, 64)";
  const intensity = Math.min(count / 8, 1);
  const r = Math.round(64 + intensity * (251 - 64));
  const g = Math.round(64 + intensity * (146 - 64));
  const b = Math.round(64 + intensity * (60 - 64));
  return `rgb(${r}, ${g}, ${b})`;
}

interface AnnotationItem {
  type: "marker" | "note";
  id: string;
  label: string;
  text: string;
  date: string;
  partId?: string;
  marker?: Marker;
  source?: "manual" | "extracted";
}

interface Connection {
  relatedAnnotationId: string;
  relatedLabel: string;
  explanation: string;
}

type SortOrder = "newest" | "oldest";

export default function AnnotationList({ data, onMarkerClick, onPartClick, markerCounts }: AnnotationListProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, Connection[]>>({});
  const [loadingConnections, setLoadingConnections] = useState<string | null>(null);

  const items: AnnotationItem[] = [];
  data.markers.forEach((m) => {
    items.push({ type: "marker", id: m.id, label: m.label || "Marker", text: m.note, date: m.createdAt, marker: m });
  });
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    const part = BODY_PARTS.find((p) => p.id === partId);
    entry.notes.forEach((note: BodyNote) => {
      items.push({ type: "note", id: note.id, label: part?.label || partId, text: note.text, date: note.date, partId, source: note.source });
    });
  });
  items.sort((a, b) => sortOrder === "newest"
    ? new Date(b.date).getTime() - new Date(a.date).getTime()
    : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const displayed = showAll ? items : items.slice(0, 4);

  async function handleToggleExpand(item: AnnotationItem) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);

    if (connections[item.id] || items.length < 2) return;

    setLoadingConnections(item.id);
    try {
      const allAnnotations = items.map((a) => ({
        id: a.id,
        label: a.label,
        text: a.text,
        date: new Date(a.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      }));
      const selectedAnnotation = {
        id: item.id,
        label: item.label,
        text: item.text,
        date: new Date(item.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
      };

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAnnotation, allAnnotations }),
      });

      if (res.ok) {
        const result = await res.json();
        setConnections((prev) => ({ ...prev, [item.id]: result.connections || [] }));
      }
    } catch {}
    setLoadingConnections(null);
  }

  if (items.length === 0) {
    return (
      <div className="text-neutral-600 text-sm py-8 text-center">
        <p>No annotations yet.</p>
        <p className="mt-1 text-xs text-neutral-700">Click a body part or place a marker to add notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-end mb-2">
        <button onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1">
          {sortOrder === "newest" ? "Newest first ↓" : "Oldest first ↑"}
        </button>
      </div>
      {displayed.map((item) => {
        const isExpanded = expandedId === item.id;
        const itemConnections = connections[item.id];
        const isLoading = loadingConnections === item.id;

        return (
          <div key={item.id} className={`rounded-xl transition-colors ${isExpanded ? "bg-neutral-800/30" : ""}`}>
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors cursor-pointer"
              onClick={() => handleToggleExpand(item)}>
              <div className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getIntensityColor(item.partId ? (markerCounts?.[item.partId] || 1) : 1) }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-neutral-200 truncate">
                    {item.label}
                    {item.source === "extracted" && <span className="ml-1.5 text-[10px] font-medium text-orange-500/70 uppercase">auto</span>}
                    {(item.source === "manual" || (!item.source && item.type === "note")) && <span className="ml-1.5 text-[10px] font-medium text-green-500/70 uppercase">manual</span>}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-600">
                      {new Date(item.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-neutral-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {item.text && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.text}</p>}
              </div>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3">
                {/* Action buttons */}
                <div className="flex gap-2 ml-5 mb-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (item.type === "marker" && item.marker) onMarkerClick(item.marker); else if (item.partId) onPartClick(item.partId); }}
                    className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
                    View on body
                  </button>
                </div>

                {/* Connections */}
                <div className="ml-5 border-t border-neutral-800 pt-2">
                  <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-widest mb-2">Connections</p>

                  {isLoading && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-3 h-3 border-2 border-neutral-700 border-t-orange-500 rounded-full animate-spin" />
                      <span className="text-xs text-neutral-600">Finding connections...</span>
                    </div>
                  )}

                  {!isLoading && itemConnections && itemConnections.length === 0 && (
                    <p className="text-xs text-neutral-700 py-1">No connections found with other annotations.</p>
                  )}

                  {!isLoading && itemConnections && itemConnections.length > 0 && (
                    <div className="space-y-2">
                      {itemConnections.map((conn, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500/60 mt-0.5 flex-shrink-0">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <div>
                            <span className="text-xs font-medium text-neutral-400">{conn.relatedLabel}</span>
                            <p className="text-xs text-neutral-500">{conn.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && !itemConnections && items.length >= 2 && (
                    <p className="text-xs text-neutral-700 py-1">Loading...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {items.length > 4 && (
        <button onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-orange-500 font-medium py-2 hover:text-orange-400 transition-colors">
          {showAll ? "Show less" : `View all ${items.length} annotations`}
        </button>
      )}
    </div>
  );
}
