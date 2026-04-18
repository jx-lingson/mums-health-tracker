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
    <div className="border-t border-neutral-800 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{part?.label || partId}</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 text-lg leading-none">&times;</button>
      </div>
      <form onSubmit={handleSubmit} className="mb-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note about this area..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows={2} />
        <button type="submit" disabled={!text.trim()}
          className="mt-2 px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">Save Note</button>
      </form>
      {notes.length === 0 ? (
        <p className="text-xs text-neutral-600">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {[...notes].reverse().map((note: BodyNote) => (
            <div key={note.id} className="bg-neutral-800/50 rounded-lg p-2.5 group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-neutral-300 flex-1">{note.text}</p>
                <button onClick={() => onDeleteNote(partId, note.id)}
                  className="text-neutral-600 hover:text-red-400 ml-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {new Date(note.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
