"use client";

import { useState } from "react";
import { HealthData, Medication, Surgery, Allergy } from "@/lib/types";

interface HistoryViewProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

type Section = "medications" | "surgeries" | "allergies";

export default function HistoryView({ data, onUpdate }: HistoryViewProps) {
  const [activeSection, setActiveSection] = useState<Section>("medications");
  const [showForm, setShowForm] = useState(false);

  const sections: { id: Section; label: string; count: number }[] = [
    { id: "medications", label: "Medications", count: data.medications.length },
    { id: "surgeries", label: "Surgeries", count: data.surgeries.length },
    { id: "allergies", label: "Allergies", count: data.allergies.length },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setShowForm(false); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeSection === s.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label} {s.count > 0 && <span className="ml-1 opacity-70">({s.count})</span>}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancel" : `Add ${activeSection === "medications" ? "Medication" : activeSection === "surgeries" ? "Surgery" : "Allergy"}`}
        </button>
      </div>

      {showForm && activeSection === "medications" && (
        <MedicationForm onSave={(med) => { onUpdate((p) => ({ ...p, medications: [...p.medications, med] })); setShowForm(false); }} />
      )}
      {showForm && activeSection === "surgeries" && (
        <SurgeryForm onSave={(s) => { onUpdate((p) => ({ ...p, surgeries: [...p.surgeries, s] })); setShowForm(false); }} />
      )}
      {showForm && activeSection === "allergies" && (
        <AllergyForm onSave={(a) => { onUpdate((p) => ({ ...p, allergies: [...p.allergies, a] })); setShowForm(false); }} />
      )}

      {activeSection === "medications" && (
        <MedicationList
          medications={data.medications}
          onDelete={(id) => onUpdate((p) => ({ ...p, medications: p.medications.filter((m) => m.id !== id) }))}
        />
      )}
      {activeSection === "surgeries" && (
        <SurgeryList
          surgeries={data.surgeries}
          onDelete={(id) => onUpdate((p) => ({ ...p, surgeries: p.surgeries.filter((s) => s.id !== id) }))}
        />
      )}
      {activeSection === "allergies" && (
        <AllergyList
          allergies={data.allergies}
          onDelete={(id) => onUpdate((p) => ({ ...p, allergies: p.allergies.filter((a) => a.id !== id) }))}
        />
      )}
    </div>
  );
}

function MedicationForm({ onSave }: { onSave: (med: Medication) => void }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate,
      endDate: endDate || null,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Medication name *" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-3">
        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Dosage (e.g. 500mg)" className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Frequency (e.g. twice daily)" className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500">End Date (leave empty if current)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">Save Medication</button>
    </form>
  );
}

function SurgeryForm({ onSave }: { onSave: (s: Surgery) => void }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: crypto.randomUUID(), name: name.trim(), date, hospital: hospital.trim(), notes: notes.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Surgery name *" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Hospital" className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">Save Surgery</button>
    </form>
  );
}

function AllergyForm({ onSave }: { onSave: (a: Allergy) => void }) {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [reaction, setReaction] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: crypto.randomUUID(), name: name.trim(), severity, reaction: reaction.trim(), notes: notes.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Allergen name *" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-3 items-center">
        <span className="text-sm text-gray-500">Severity:</span>
        {(["mild", "moderate", "severe"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeverity(s)}
            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
              severity === s
                ? s === "mild" ? "bg-green-100 text-green-700" : s === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <input type="text" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="Reaction (e.g. hives, swelling)" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">Save Allergy</button>
    </form>
  );
}

function MedicationList({ medications, onDelete }: { medications: Medication[]; onDelete: (id: string) => void }) {
  const current = medications.filter((m) => !m.endDate);
  const past = medications.filter((m) => m.endDate);

  if (medications.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No medications recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {current.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Current</h4>
          <div className="space-y-2">
            {current.map((m) => <MedicationCard key={m.id} med={m} onDelete={() => onDelete(m.id)} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Past</h4>
          <div className="space-y-2">
            {past.map((m) => <MedicationCard key={m.id} med={m} onDelete={() => onDelete(m.id)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationCard({ med, onDelete }: { med: Medication; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{med.name}</p>
          <p className="text-sm text-gray-500">
            {[med.dosage, med.frequency].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Started {new Date(med.startDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            {med.endDate && ` · Ended ${new Date(med.endDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
          {med.notes && <p className="text-sm text-gray-500 mt-1">{med.notes}</p>}
        </div>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg">&times;</button>
      </div>
    </div>
  );
}

function SurgeryList({ surgeries, onDelete }: { surgeries: Surgery[]; onDelete: (id: string) => void }) {
  if (surgeries.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No surgeries recorded yet.</p>;
  }

  const sorted = [...surgeries].sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0));

  return (
    <div className="space-y-2">
      {sorted.map((s) => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{s.name}</p>
              <p className="text-sm text-gray-500">
                {s.date && new Date(s.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                {s.hospital && ` · ${s.hospital}`}
              </p>
              {s.notes && <p className="text-sm text-gray-500 mt-1">{s.notes}</p>}
            </div>
            <button onClick={() => onDelete(s.id)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg">&times;</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AllergyList({ allergies, onDelete }: { allergies: Allergy[]; onDelete: (id: string) => void }) {
  if (allergies.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No allergies recorded yet.</p>;
  }

  const severityColors = {
    mild: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700",
    severe: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-2">
      {allergies.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 group">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{a.name}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${severityColors[a.severity]}`}>{a.severity}</span>
              </div>
              {a.reaction && <p className="text-sm text-gray-500 mt-1">Reaction: {a.reaction}</p>}
              {a.notes && <p className="text-sm text-gray-500 mt-1">{a.notes}</p>}
            </div>
            <button onClick={() => onDelete(a.id)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg">&times;</button>
          </div>
        </div>
      ))}
    </div>
  );
}
