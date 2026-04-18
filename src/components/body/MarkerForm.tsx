"use client";

import { useState } from "react";
import { Marker } from "@/lib/types";

interface MarkerFormProps {
  marker?: Marker;
  onSave: (label: string, note: string, color: "red" | "orange" | "yellow") => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const colorOptions: { value: "red" | "orange" | "yellow"; label: string; bg: string }[] = [
  { value: "red", label: "Red", bg: "bg-red-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
  { value: "yellow", label: "Yellow", bg: "bg-yellow-500" },
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {marker ? "Edit Marker" : "New Marker"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Bruise, Rash)"
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Color:</span>
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setColor(opt.value)}
              className={`w-6 h-6 rounded-full ${opt.bg} ${color === opt.value ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {marker ? "Update" : "Place Marker"}
          </button>
          {marker && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
