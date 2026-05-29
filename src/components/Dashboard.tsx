"use client";

import { useState } from "react";
import { HealthData, EMPTY_HEALTH_DATA, Marker } from "@/lib/types";
import { useCloudStorage } from "@/hooks/useCloudStorage";
import { MUM_DOB, calculateAge } from "@/lib/constants";
import BodySvg from "./body/BodySvg";
import MarkerLayer from "./body/MarkerLayer";
import MarkerForm from "./body/MarkerForm";
import BodyPartPanel from "./body/BodyPartPanel";
import AnnotationList from "./body/AnnotationList";
import BloodMarkerBar from "./body/BloodMarkerBar";
import HistorySection from "./history/HistorySection";
import LinksSection from "./LinksSection";
import WatchNotes from "./WatchNotes";
import Dock from "./Dock";

const BODY_PART_CENTERS: Record<string, [number, number]> = {
  "upper-head": [150, 35], "lower-head": [150, 70], neck: [150, 97], "left-shoulder": [125, 111], "right-shoulder": [175, 111],
  chest: [150, 145], abdomen: [150, 200], "left-upper-arm": [105, 140], "right-upper-arm": [195, 140],
  "left-forearm": [103, 210], "right-forearm": [197, 210], "left-hand": [97, 265], "right-hand": [203, 265],
  "left-upper-leg": [137, 280], "right-upper-leg": [163, 280], "left-lower-leg": [135, 370], "right-lower-leg": [165, 370],
  "left-foot": [132, 430], "right-foot": [168, 430],
};

function getClosestBodyPart(x: number, y: number): string | null {
  let closest: string | null = null;
  let minDist = Infinity;
  for (const [id, [cx, cy]] of Object.entries(BODY_PART_CENTERS)) {
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < minDist && dist < 60) { minDist = dist; closest = id; }
  }
  return closest;
}

type Modal =
  | { type: "part"; partId: string }
  | { type: "new-marker"; x: number; y: number }
  | { type: "edit-marker"; marker: Marker }
  | null;

type Tab = "health" | "records";

export default function Dashboard() {
  const [data, setData, syncing, refresh] = useCloudStorage<HealthData>("health-tracker-data", EMPTY_HEALTH_DATA);
  const [modal, setModal] = useState<Modal>(null);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("health");

  const age = calculateAge(MUM_DOB);

  function handleAddNote(partId: string, text: string) {
    setData((prev) => ({
      ...prev,
      bodyParts: { ...prev.bodyParts, [partId]: {
        notes: [...(prev.bodyParts[partId]?.notes || []), { id: crypto.randomUUID(), text, date: new Date().toISOString(), source: "manual" as const }],
      }},
    }));
  }

  function handleEditNote(partId: string, noteId: string, text: string, date: string) {
    setData((prev) => ({
      ...prev,
      bodyParts: { ...prev.bodyParts, [partId]: {
        notes: (prev.bodyParts[partId]?.notes || []).map((n) => n.id === noteId ? { ...n, text, date } : n),
      }},
    }));
  }

  function handleDeleteNote(partId: string, noteId: string) {
    setData((prev) => ({
      ...prev,
      bodyParts: { ...prev.bodyParts, [partId]: {
        notes: (prev.bodyParts[partId]?.notes || []).filter((n) => n.id !== noteId),
      }},
    }));
  }

  function handleMarkerPlace(x: number, y: number) {
    setIsPlacingMarker(false);
    setModal({ type: "new-marker", x, y });
  }

  function handleSaveNewMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (modal?.type !== "new-marker") return;
    setData((prev) => ({ ...prev, markers: [...prev.markers, {
      id: crypto.randomUUID(), x: modal.x, y: modal.y, label, note, color, createdAt: new Date().toISOString(),
    }] }));
    setModal(null);
  }

  function handleUpdateMarker(label: string, note: string, color: "red" | "orange" | "yellow") {
    if (modal?.type !== "edit-marker") return;
    const id = modal.marker.id;
    setData((prev) => ({ ...prev, markers: prev.markers.map((m) => (m.id === id ? { ...m, label, note, color } : m)) }));
    setModal(null);
  }

  function handleDeleteMarker() {
    if (modal?.type !== "edit-marker") return;
    setData((prev) => ({ ...prev, markers: prev.markers.filter((m) => m.id !== modal.marker.id) }));
    setModal(null);
  }

  function handleAddBloodMarker(type: string, value: string, unit: string, status: "normal" | "low" | "high") {
    setData((prev) => ({ ...prev, bloodMarkers: [...(prev.bloodMarkers || []), {
      id: crypto.randomUUID(), type, value, unit, date: new Date().toISOString(), status,
    }] }));
  }

  function handleEditBloodMarker(id: string, updates: { comment?: string; date?: string }) {
    setData((prev) => ({ ...prev, bloodMarkers: (prev.bloodMarkers || []).map((m) => m.id === id ? { ...m, ...updates } : m) }));
  }

  function handleDeleteBloodMarker(id: string) {
    setData((prev) => ({ ...prev, bloodMarkers: (prev.bloodMarkers || []).filter((m) => m.id !== id) }));
  }

  const markerCounts: Record<string, number> = {};
  Object.entries(data.bodyParts).forEach(([partId, entry]) => {
    if (entry.notes.length > 0) markerCounts[partId] = (markerCounts[partId] || 0) + entry.notes.length;
  });
  data.markers.forEach((m) => {
    const partId = getClosestBodyPart(m.x, m.y);
    if (partId) markerCounts[partId] = (markerCounts[partId] || 0) + 1;
  });

  const dockItems = [
    {
      id: "health",
      label: "Health",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
      active: activeTab === "health",
      onClick: () => setActiveTab("health"),
    },
    {
      id: "records",
      label: "Records",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      active: activeTab === "records",
      onClick: () => setActiveTab("records"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Chinn Health</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-neutral-500 text-sm">Health monitoring dashboard</p>
              {syncing && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-xs text-neutral-600">Syncing...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile refresh */}
            <button onClick={refresh} disabled={syncing}
              className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
              title="Refresh data">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={syncing ? "animate-spin" : ""}>
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
            {/* Desktop tab nav */}
            <nav className="hidden md:flex items-center gap-1 bg-neutral-900 rounded-xl p-1 border border-neutral-800">
              <button
                onClick={() => setActiveTab("health")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "health" ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Health
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "records" ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Records
              </button>
            </nav>
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl px-5 py-3">
              <p className="text-3xl font-bold tabular-nums leading-none">{age.years}</p>
              <p className="text-orange-200 text-xs mt-1">years, {age.months}mo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <WatchNotes
          value={data.watchNotes || ""}
          onChange={(val) => setData((prev) => ({ ...prev, watchNotes: val }))}
        />
        {activeTab === "health" && (
          <>
            {/* Body Map + Annotations */}
            <section className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-5/12">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Body Map</h2>
                    <button
                      onClick={() => { setIsPlacingMarker(!isPlacingMarker); if (!isPlacingMarker) setModal(null); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        isPlacingMarker ? "bg-neutral-700 text-neutral-300" : "bg-orange-600 text-white hover:bg-orange-500"
                      }`}
                    >
                      {isPlacingMarker ? "Cancel" : "Add Marker"}
                    </button>
                  </div>

                  {isPlacingMarker && (
                    <div className="bg-orange-950/50 text-orange-400 text-xs font-medium px-3 py-2 rounded-lg mb-4 text-center border border-orange-900/50">
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

                  {modal?.type === "part" && (
                    <div className="mt-4">
                      <BodyPartPanel key={modal.partId} partId={modal.partId} entry={data.bodyParts[modal.partId]}
                        onAddNote={handleAddNote} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} onClose={() => setModal(null)} />
                    </div>
                  )}
                  {modal?.type === "new-marker" && (
                    <div className="mt-4">
                      <MarkerForm onSave={handleSaveNewMarker} onCancel={() => setModal(null)} />
                    </div>
                  )}
                  {modal?.type === "edit-marker" && (
                    <div className="mt-4">
                      <MarkerForm key={modal.marker.id} marker={modal.marker}
                        onSave={handleUpdateMarker} onDelete={handleDeleteMarker} onCancel={() => setModal(null)} />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-7/12">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 h-full">
                  <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Body Annotations</h2>
                  <AnnotationList data={data} markerCounts={markerCounts}
                    onMarkerClick={(marker) => setModal({ type: "edit-marker", marker })}
                    onPartClick={(partId) => setModal({ type: "part", partId })} />
                </div>
              </div>
            </section>

            {/* Blood Markers */}
            <BloodMarkerBar
              readings={data.bloodMarkers || []}
              onAdd={handleAddBloodMarker}
              onEdit={handleEditBloodMarker}
              onDelete={handleDeleteBloodMarker}
            />

          </>
        )}

        {activeTab === "records" && (
          <>
            {/* Documents & Links */}
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Documents & Links</h2>
              <LinksSection data={data} onUpdate={setData} />
            </section>

            {/* Medical History */}
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Medical History</h2>
              <HistorySection data={data} onUpdate={setData} />
            </section>
          </>
        )}
      </main>

      {/* Mobile Dock */}
      <Dock items={dockItems} />
    </div>
  );
}
