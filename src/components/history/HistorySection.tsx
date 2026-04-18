"use client";

import { useState } from "react";
import { HealthData, Medication, Surgery, Allergy } from "@/lib/types";

interface HistorySectionProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

export default function HistorySection({ data, onUpdate }: HistorySectionProps) {
  const [expanded, setExpanded] = useState<"medications" | "surgeries" | "allergies" | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const sections = [
    {
      id: "medications" as const,
      label: "Medications",
      count: data.medications.length,
      icon: "💊",
      sub: `${data.medications.filter((m) => !m.endDate).length} current`,
    },
    {
      id: "surgeries" as const,
      label: "Surgeries",
      count: data.surgeries.length,
      icon: "🏥",
      sub: `${data.surgeries.length} recorded`,
    },
    {
      id: "allergies" as const,
      label: "Allergies",
      count: data.allergies.length,
      icon: "⚠️",
      sub: `${data.allergies.length} recorded`,
    },
  ];

  function toggleSection(id: typeof expanded) {
    setExpanded(expanded === id ? null : id);
    setShowAddForm(false);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSection(s.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              expanded === s.id
                ? "bg-orange-950/30 border-orange-900/50"
                : "bg-white border-neutral-800 hover:border-neutral-700"
            }`}
          >
            <span className="text-lg">{s.icon}</span>
            <p className="text-sm font-semibold text-neutral-900 mt-1">{s.label}</p>
            <p className="text-xs text-neutral-400">{s.sub}</p>
          </button>
        ))}
      </div>

      {expanded === "medications" && (
        <ExpandedMedications
          medications={data.medications}
          showAdd={showAddForm}
          onToggleAdd={() => setShowAddForm(!showAddForm)}
          onAdd={(med) => { onUpdate((p) => ({ ...p, medications: [...p.medications, med] })); setShowAddForm(false); }}
          onDelete={(id) => onUpdate((p) => ({ ...p, medications: p.medications.filter((m) => m.id !== id) }))}
        />
      )}
      {expanded === "surgeries" && (
        <ExpandedSurgeries
          surgeries={data.surgeries}
          showAdd={showAddForm}
          onToggleAdd={() => setShowAddForm(!showAddForm)}
          onAdd={(s) => { onUpdate((p) => ({ ...p, surgeries: [...p.surgeries, s] })); setShowAddForm(false); }}
          onDelete={(id) => onUpdate((p) => ({ ...p, surgeries: p.surgeries.filter((s) => s.id !== id) }))}
        />
      )}
      {expanded === "allergies" && (
        <ExpandedAllergies
          allergies={data.allergies}
          showAdd={showAddForm}
          onToggleAdd={() => setShowAddForm(!showAddForm)}
          onAdd={(a) => { onUpdate((p) => ({ ...p, allergies: [...p.allergies, a] })); setShowAddForm(false); }}
          onDelete={(id) => onUpdate((p) => ({ ...p, allergies: p.allergies.filter((a) => a.id !== id) }))}
        />
      )}
    </div>
  );
}

function ExpandedMedications({ medications, showAdd, onToggleAdd, onAdd, onDelete }: {
  medications: Medication[]; showAdd: boolean; onToggleAdd: () => void;
  onAdd: (m: Medication) => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const current = medications.filter((m) => !m.endDate);
  const past = medications.filter((m) => m.endDate);

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">Medications</h4>
        <button onClick={onToggleAdd} className="text-xs text-orange-500 font-medium hover:text-orange-400">
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onAdd({ id: crypto.randomUUID(), name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim(), startDate, endDate: endDate || null, notes: notes.trim() }); setName(""); setDosage(""); setFrequency(""); setNotes(""); }} className="space-y-2 pb-3 border-b border-neutral-800">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication name" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
          <div className="flex gap-2">
            <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage" className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency" className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End (empty=current)" className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full border border-stone-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <button type="submit" disabled={!name.trim()} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save</button>
        </form>
      )}

      {medications.length === 0 && <p className="text-xs text-neutral-400 py-2">No medications recorded.</p>}
      {current.length > 0 && (
        <div>
          <p className="text-xs text-neutral-400 font-medium mb-1">Current</p>
          {current.map((m) => <MedItem key={m.id} med={m} onDelete={() => onDelete(m.id)} />)}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-xs text-neutral-400 font-medium mb-1">Past</p>
          {past.map((m) => <MedItem key={m.id} med={m} onDelete={() => onDelete(m.id)} />)}
        </div>
      )}
    </div>
  );
}

function MedItem({ med, onDelete }: { med: Medication; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between py-2 group">
      <div>
        <p className="text-sm font-medium text-neutral-900">{med.name}</p>
        <p className="text-xs text-neutral-500">{[med.dosage, med.frequency].filter(Boolean).join(" · ")}</p>
      </div>
      <button onClick={onDelete} className="text-neutral-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">&times;</button>
    </div>
  );
}

function ExpandedSurgeries({ surgeries, showAdd, onToggleAdd, onAdd, onDelete }: {
  surgeries: Surgery[]; showAdd: boolean; onToggleAdd: () => void;
  onAdd: (s: Surgery) => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">Surgeries</h4>
        <button onClick={onToggleAdd} className="text-xs text-orange-500 font-medium hover:text-orange-400">
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onAdd({ id: crypto.randomUUID(), name: name.trim(), date, hospital: hospital.trim(), notes: notes.trim() }); setName(""); setDate(""); setHospital(""); setNotes(""); }} className="space-y-2 pb-3 border-b border-neutral-800">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Surgery name" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Hospital" className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full border border-stone-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <button type="submit" disabled={!name.trim()} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save</button>
        </form>
      )}
      {surgeries.length === 0 && <p className="text-xs text-neutral-400 py-2">No surgeries recorded.</p>}
      {surgeries.map((s) => (
        <div key={s.id} className="flex items-start justify-between py-2 group">
          <div>
            <p className="text-sm font-medium text-neutral-900">{s.name}</p>
            <p className="text-xs text-neutral-500">{[s.date && new Date(s.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }), s.hospital].filter(Boolean).join(" · ")}</p>
          </div>
          <button onClick={() => onDelete(s.id)} className="text-neutral-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">&times;</button>
        </div>
      ))}
    </div>
  );
}

function ExpandedAllergies({ allergies, showAdd, onToggleAdd, onAdd, onDelete }: {
  allergies: Allergy[]; showAdd: boolean; onToggleAdd: () => void;
  onAdd: (a: Allergy) => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [reaction, setReaction] = useState("");
  const [notes, setNotes] = useState("");

  const severityColors = { mild: "bg-green-100 text-green-700", moderate: "bg-yellow-100 text-yellow-700", severe: "bg-red-100 text-red-700" };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">Allergies</h4>
        <button onClick={onToggleAdd} className="text-xs text-orange-500 font-medium hover:text-orange-400">
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onAdd({ id: crypto.randomUUID(), name: name.trim(), severity, reaction: reaction.trim(), notes: notes.trim() }); setName(""); setReaction(""); setNotes(""); }} className="space-y-2 pb-3 border-b border-neutral-800">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Allergen name" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
          <div className="flex gap-2 items-center">
            <span className="text-xs text-neutral-500">Severity:</span>
            {(["mild", "moderate", "severe"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSeverity(s)} className={`px-2 py-0.5 text-xs rounded-full capitalize ${severity === s ? severityColors[s] : "bg-stone-100 text-neutral-400"}`}>{s}</button>
            ))}
          </div>
          <input type="text" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="Reaction" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <button type="submit" disabled={!name.trim()} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save</button>
        </form>
      )}
      {allergies.length === 0 && <p className="text-xs text-neutral-400 py-2">No allergies recorded.</p>}
      {allergies.map((a) => (
        <div key={a.id} className="flex items-start justify-between py-2 group">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-neutral-900">{a.name}</p>
            <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${severityColors[a.severity]}`}>{a.severity}</span>
          </div>
          <button onClick={() => onDelete(a.id)} className="text-neutral-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">&times;</button>
        </div>
      ))}
    </div>
  );
}
