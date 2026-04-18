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
    <div className="border-t border-stone-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-900">{part?.label || partId}</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-lg leading-none">&times;</button>
      </div>

      <form onSubmit={handleSubmit} className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this area..."
          className="w-full border border-stone-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows={2}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="mt-2 px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-40 transition-colors"
        >
          Save Note
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-xs text-stone-400">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {[...notes].reverse().map((note: BodyNote) => (
            <div key={note.id} className="bg-stone-50 rounded-lg p-2.5 group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-stone-700 flex-1">{note.text}</p>
                <button
                  onClick={() => onDeleteNote(partId, note.id)}
                  className="text-stone-300 hover:text-red-500 ml-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {new Date(note.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
