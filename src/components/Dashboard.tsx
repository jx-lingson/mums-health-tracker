"use client";

import { useState } from "react";
import { HealthData, EMPTY_HEALTH_DATA, Marker } from "@/lib/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MUM_DOB, calculateAge, VITAL_TYPES } from "@/lib/constants";
import BodySvg from "./body/BodySvg";
import MarkerLayer from "./body/MarkerLayer";
import MarkerForm from "./body/MarkerForm";
import BodyPartPanel from "./body/BodyPartPanel";
import AnnotationList from "./body/AnnotationList";
import VitalCard from "./vitals/VitalCard";
import HistorySection from "./history/HistorySection";

type Modal =
  | { type: "part"; partId: string }
  | { type: "new-marker"; x: number; y: number }
  | { type: "edit-marker"; marker: Marker }
  | null;

export default function Dashboard() {
  const [data, setData] = useLocalStorage<HealthData>("health-tracker-data", EMPTY_HEALTH_DATA);
  const [modal, setModal] = useState<Modal>(null);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);

  const age = calculateAge(MUM_DOB);

  function handleAddNote(partId: string, text: string) {
    setData((prev) => ({
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
    setData((prev) => ({
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
    setModal({ type: "new-marker", x, y });
  }

  function handleSaveNewMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (modal?.type !== "new-marker") return;
    const marker: Marker = {
      id: crypto.randomUUID(),
      x: modal.x,
      y: modal.y,
      label,
      note,
      color,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, markers: [...prev.markers, marker] }));
    setModal(null);
  }

  function handleUpdateMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (modal?.type !== "edit-marker") return;
    const id = modal.marker.id;
    setData((prev) => ({
      ...prev,
      markers: prev.markers.map((m) => (m.id === id ? { ...m, label, note, color } : m)),
    }));
    setModal(null);
  }

  function handleDeleteMarker() {
    if (modal?.type !== "edit-marker") return;
    setData((prev) => ({ ...prev, markers: prev.markers.filter((m) => m.id !== modal.marker.id) }));
    setModal(null);
  }

  function handleLogVital(type: string, value: string, date: string) {
    const vitalDef = VITAL_TYPES.find((v) => v.id === type)!;
    setData((prev) => ({
      ...prev,
      vitals: [...prev.vitals, {
        id: crypto.randomUUID(),
        type: vitalDef.id,
        value,
        unit: vitalDef.unit,
        date,
      }],
    }));
  }

  function handleDeleteVital(id: string) {
    setData((prev) => ({ ...prev, vitals: prev.vitals.filter((v) => v.id !== id) }));
  }

  const markerCounts: Record<string, number> = {};
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    if (entry.notes.length > 0) markerCounts[partId] = entry.notes.length;
  });

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Chinn Health Tracker</h1>
            <p className="text-stone-400 text-sm mt-0.5">Health monitoring dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{age.years}<span className="text-stone-400 text-sm font-normal ml-1">years</span></p>
            <p className="text-stone-400 text-xs">{age.months} months</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Body Map + Annotations */}
        <section className="flex flex-col lg:flex-row gap-6">
          {/* Body */}
          <div className="lg:w-5/12">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Body Map</h2>
                <button
                  onClick={() => {
                    setIsPlacingMarker(!isPlacingMarker);
                    if (!isPlacingMarker) setModal(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isPlacingMarker
                      ? "bg-stone-200 text-stone-700"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {isPlacingMarker ? "Cancel" : "Add Marker"}
                </button>
              </div>

              {isPlacingMarker && (
                <div className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-2 rounded-lg mb-4 text-center">
                  Click anywhere on the body to place a marker
                </div>
              )}

              <div className="flex justify-center">
                <div className="relative inline-block">
                  <BodySvg
                    selectedPart={modal?.type === "part" ? modal.partId : null}
                    onPartClick={(partId) => setModal({ type: "part", partId })}
                    isPlacingMarker={isPlacingMarker}
                    onMarkerPlace={handleMarkerPlace}
                    markerCounts={markerCounts}
                  />
                  <MarkerLayer
                    markers={data.markers}
                    onMarkerClick={(marker) => setModal({ type: "edit-marker", marker })}
                  />
                </div>
              </div>

              {/* Modal forms */}
              {modal?.type === "part" && (
                <div className="mt-4">
                  <BodyPartPanel
                    key={modal.partId}
                    partId={modal.partId}
                    entry={data.bodyParts[modal.partId]}
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                    onClose={() => setModal(null)}
                  />
                </div>
              )}
              {modal?.type === "new-marker" && (
                <div className="mt-4">
                  <MarkerForm onSave={handleSaveNewMarker} onCancel={() => setModal(null)} />
                </div>
              )}
              {modal?.type === "edit-marker" && (
                <div className="mt-4">
                  <MarkerForm
                    key={modal.marker.id}
                    marker={modal.marker}
                    onSave={handleUpdateMarker}
                    onDelete={handleDeleteMarker}
                    onCancel={() => setModal(null)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Annotations */}
          <div className="lg:w-7/12">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm h-full">
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Body Annotations</h2>
              <AnnotationList
                data={data}
                onMarkerClick={(marker) => setModal({ type: "edit-marker", marker })}
                onPartClick={(partId) => setModal({ type: "part", partId })}
              />
            </div>
          </div>
        </section>

        {/* Vitals */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Vitals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {VITAL_TYPES.map((vt) => (
              <VitalCard
                key={vt.id}
                vitalDef={vt}
                readings={data.vitals.filter((v) => v.type === vt.id)}
                onLog={(value, date) => handleLogVital(vt.id, value, date)}
                onDelete={handleDeleteVital}
              />
            ))}
          </div>
        </section>

        {/* Medical History */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Medical History</h2>
          <HistorySection data={data} onUpdate={setData} />
        </section>
      </main>
    </div>
  );
}
