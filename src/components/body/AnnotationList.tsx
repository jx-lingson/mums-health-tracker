"use client";

import { useState } from "react";
import { HealthData, Marker, BodyNote } from "@/lib/types";
import { BODY_PARTS } from "@/lib/constants";

interface AnnotationListProps {
  data: HealthData;
  onMarkerClick: (marker: Marker) => void;
  onPartClick: (partId: string) => void;
}

interface AnnotationItem {
  type: "marker" | "note";
  id: string;
  label: string;
  text: string;
  date: string;
  partId?: string;
  marker?: Marker;
}

export default function AnnotationList({ data, onMarkerClick, onPartClick }: AnnotationListProps) {
  const [showAll, setShowAll] = useState(false);

  const items: AnnotationItem[] = [];
  data.markers.forEach((m) => {
    items.push({ type: "marker", id: m.id, label: m.label || "Marker", text: m.note, date: m.createdAt, marker: m });
  });
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    const part = BODY_PARTS.find((p) => p.id === partId);
    entry.notes.forEach((note: BodyNote) => {
      items.push({ type: "note", id: note.id, label: part?.label || partId, text: note.text, date: note.date, partId });
    });
  });
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayed = showAll ? items : items.slice(0, 4);

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
      {displayed.map((item) => (
        <button key={item.id}
          onClick={() => { if (item.type === "marker" && item.marker) onMarkerClick(item.marker); else if (item.partId) onPartClick(item.partId); }}
          className="w-full text-left group">
          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors">
            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.type === "marker" ? "bg-orange-500" : "bg-green-500"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-200 truncate">{item.label}</span>
                <span className="text-xs text-neutral-600 flex-shrink-0">
                  {new Date(item.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </span>
              </div>
              {item.text && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.text}</p>}
            </div>
          </div>
        </button>
      ))}
      {items.length > 4 && (
        <button onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-orange-500 font-medium py-2 hover:text-orange-400 transition-colors">
          {showAll ? "Show less" : `View all ${items.length} annotations`}
        </button>
      )}
    </div>
  );
}
