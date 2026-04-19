"use client";

import { useState } from "react";
import { Marker } from "@/lib/types";

interface MarkerFormProps {
  marker?: Marker;
  onSave: (label: string, note: string, color: "red" | "orange" | "yellow") => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const colorOptions: { value: "red" | "orange" | "yellow"; bg: string }[] = [
  { value: "red", bg: "bg-red-500" },
  { value: "orange", bg: "bg-orange-500" },
  { value: "yellow", bg: "bg-yellow-500" },
];

export default function MarkerForm({ marker, onSave, onDelete, onCancel }: MarkerFormProps) {
  const [label, setLabel] = useState(marker?.label || "");
  const [note, setNote] = useState(marker?.note || "");
  const [color, setColor] = useState<"red" | "orange" | "yellow">(marker?.color || "red");

  return (
    <div className="border-t border-neutral-800 pt-4">
      <h3 className="text-sm font-semibold text-white mb-3">{marker ? "Edit Marker" : "New Marker"}</h3>
      <form onSubmit={(e) => { e.preventDefault(); onSave(label, note, color); }} className="space-y-2">
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Bruise, Rash)" autoFocus
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes..." rows={2}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Color:</span>
          {colorOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setColor(opt.value)}
              className={`w-5 h-5 rounded-full ${opt.bg} ${color === opt.value ? "ring-2 ring-offset-2 ring-offset-neutral-900 ring-neutral-400" : ""}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 transition-colors">
            {marker ? "Update" : "Place Marker"}</button>
          {marker && onDelete && <button type="button" onClick={() => { if (confirm("Delete this marker?")) onDelete(); }} className="px-3 py-1.5 bg-red-950 text-red-400 text-sm font-medium rounded-lg hover:bg-red-900 transition-colors">Delete</button>}
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-neutral-400 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
