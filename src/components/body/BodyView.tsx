"use client";

import { useState } from "react";
import { HealthData, Marker } from "@/lib/types";
import BodySvg from "./BodySvg";
import BodyPartPanel from "./BodyPartPanel";
import MarkerLayer from "./MarkerLayer";
import MarkerForm from "./MarkerForm";

interface BodyViewProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

type SidePanel =
  | { type: "part"; partId: string }
  | { type: "new-marker"; x: number; y: number }
  | { type: "edit-marker"; marker: Marker }
  | null;

export default function BodyView({ data, onUpdate }: BodyViewProps) {
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);

  function handlePartClick(partId: string) {
    setSidePanel({ type: "part", partId });
  }

  function handleAddNote(partId: string, text: string) {
    onUpdate((prev) => ({
      ...prev,
      bodyParts: {
        ...prev.bodyParts,
        [partId]: {
          notes: [
            ...(prev.bodyParts[partId]?.notes || []),
            { id: crypto.randomUUID(), text, date: new Date().toISOString() },
          ],
        },
      },
    }));
  }

  function handleDeleteNote(partId: string, noteId: string) {
    onUpdate((prev) => ({
      ...prev,
      bodyParts: {
        ...prev.bodyParts,
        [partId]: {
          notes: (prev.bodyParts[partId]?.notes || []).filter((n) => n.id !== noteId),
        },
      },
    }));
  }

  function handleMarkerPlace(x: number, y: number) {
    setIsPlacingMarker(false);
    setSidePanel({ type: "new-marker", x, y });
  }

  function handleSaveNewMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (sidePanel?.type !== "new-marker") return;
    const marker: Marker = {
      id: crypto.randomUUID(),
      x: sidePanel.x,
      y: sidePanel.y,
      label,
      note,
      color,
      createdAt: new Date().toISOString(),
    };
    onUpdate((prev) => ({ ...prev, markers: [...prev.markers, marker] }));
    setSidePanel(null);
  }

  function handleUpdateMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (sidePanel?.type !== "edit-marker") return;
    const id = sidePanel.marker.id;
    onUpdate((prev) => ({
      ...prev,
      markers: prev.markers.map((m) => (m.id === id ? { ...m, label, note, color } : m)),
    }));
    setSidePanel(null);
  }

  function handleDeleteMarker() {
    if (sidePanel?.type !== "edit-marker") return;
    const id = sidePanel.marker.id;
    onUpdate((prev) => ({ ...prev, markers: prev.markers.filter((m) => m.id !== id) }));
    setSidePanel(null);
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <div className="flex flex-col items-center gap-4 md:w-1/2">
        {isPlacingMarker && (
          <div className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg w-full text-center">
            Click anywhere on the body to place a marker
          </div>
        )}
        <div className="relative inline-block">
          <BodySvg
            selectedPart={sidePanel?.type === "part" ? sidePanel.partId : null}
            onPartClick={handlePartClick}
            isPlacingMarker={isPlacingMarker}
            onMarkerPlace={handleMarkerPlace}
          />
          <MarkerLayer
            markers={data.markers}
            onMarkerClick={(marker) => setSidePanel({ type: "edit-marker", marker })}
          />
        </div>
        <button
          onClick={() => {
            setIsPlacingMarker(!isPlacingMarker);
            if (!isPlacingMarker) setSidePanel(null);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isPlacingMarker
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {isPlacingMarker ? "Cancel Placing" : "Add Marker"}
        </button>
      </div>

      <div className="md:w-1/2">
        {sidePanel === null && !isPlacingMarker && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-1">Click a body part to view details</p>
            <p className="text-sm">or place a marker to track a specific area</p>
          </div>
        )}
        {sidePanel?.type === "part" && (
          <BodyPartPanel
            key={sidePanel.partId}
            partId={sidePanel.partId}
            entry={data.bodyParts[sidePanel.partId]}
            onAddNote={handleAddNote}
            onEditNote={() => {}}
            onDeleteNote={handleDeleteNote}
            onClose={() => setSidePanel(null)}
          />
        )}
        {sidePanel?.type === "new-marker" && (
          <MarkerForm
            onSave={handleSaveNewMarker}
            onCancel={() => setSidePanel(null)}
          />
        )}
        {sidePanel?.type === "edit-marker" && (
          <MarkerForm
            key={sidePanel.marker.id}
            marker={sidePanel.marker}
            onSave={handleUpdateMarker}
            onDelete={handleDeleteMarker}
            onCancel={() => setSidePanel(null)}
          />
        )}
      </div>
    </div>
  );
}
