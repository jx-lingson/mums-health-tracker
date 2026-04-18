"use client";

import { useState } from "react";
import { BodyPartEntry, BodyNote } from "@/lib/types";
import { BODY_PARTS } from "@/lib/constants";

interface BodyPartPanelProps {
  partId: string;
  entry: BodyPartEntry | undefined;
  onAddNote: (partId: string, text: string) => void;
  onDeleteNote: (partId: string, noteId: string) => void;
  onClose: () => void;
}

export default function BodyPartPanel({ partId, entry, onAddNote, onDeleteNote, onClose }: BodyPartPanelProps) {
  const [text, setText] = useState("");
  const part = BODY_PARTS.find((p) => p.id === partId);
  const notes = entry?.notes || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddNote(partId, text.trim());
    setText("");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{part?.label || partId}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this area..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Note
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet for this area.</p>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500">History</h4>
          {[...notes].reverse().map((note: BodyNote) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3 group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700 flex-1">{note.text}</p>
                <button
                  onClick={() => onDeleteNote(partId, note.id)}
                  className="text-gray-300 hover:text-red-500 ml-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(note.date).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
