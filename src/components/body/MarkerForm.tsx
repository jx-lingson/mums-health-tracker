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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(label, note, color);
  }

  return (
    <div className="border-t border-stone-100 pt-4">
      <h3 className="text-sm font-semibold text-stone-900 mb-3">
        {marker ? "Edit Marker" : "New Marker"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Bruise, Rash)"
          className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          autoFocus
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes..."
          className="w-full border border-stone-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Color:</span>
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setColor(opt.value)}
              className={`w-5 h-5 rounded-full ${opt.bg} ${color === opt.value ? "ring-2 ring-offset-2 ring-stone-400" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors">
            {marker ? "Update" : "Place Marker"}
          </button>
          {marker && onDelete && (
            <button type="button" onClick={onDelete} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">Delete</button>
          )}
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-stone-500 text-sm font-medium rounded-lg hover:bg-stone-100 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
