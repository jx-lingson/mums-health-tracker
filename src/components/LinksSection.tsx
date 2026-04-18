"use client";

import { useState } from "react";
import { HealthData, SavedLink } from "@/lib/types";

interface LinksSectionProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

const categories = [
  { id: "consult" as const, label: "Consult Recordings", icon: "🎙️", description: "Granola links, call recordings" },
  { id: "referral" as const, label: "Referrals", icon: "📋", description: "Specialist referral letters" },
  { id: "document" as const, label: "Medical Documents", icon: "📄", description: "Test results, histories, reports" },
];

export default function LinksSection({ data, onUpdate }: LinksSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"consult" | "referral" | "document">("consult");
  const [notes, setNotes] = useState("");
  const [filterCat, setFilterCat] = useState<"all" | "consult" | "referral" | "document">("all");

  const links = data.links || [];
  const filtered = filterCat === "all" ? links : links.filter((l) => l.category === filterCat);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const link: SavedLink = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: url.trim(),
      category,
      date: new Date().toISOString(),
      notes: notes.trim(),
    };
    onUpdate((prev) => ({ ...prev, links: [...(prev.links || []), link] }));
    setTitle("");
    setUrl("");
    setNotes("");
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    onUpdate((prev) => ({ ...prev, links: (prev.links || []).filter((l) => l.id !== id) }));
  }

  const catIcon = { consult: "🎙️", referral: "📋", document: "📄" };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterCat === "all" ? "bg-orange-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All ({links.length})
          </button>
          {categories.map((c) => {
            const count = links.filter((l) => l.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCat(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterCat === c.id ? "bg-orange-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c.icon} {c.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex-shrink-0"
        >
          {showAdd ? "Cancel" : "+ Add Link"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="space-y-3 pb-4 mb-4 border-b border-stone-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Dr Smith consult, Knee MRI results)"
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste link here..."
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Type:</span>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  category === c.id ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-500"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!title.trim() || !url.trim()}
            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-40 transition-colors"
          >
            Save Link
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">
          {links.length === 0
            ? "No links saved yet. Add Granola consult recordings, referrals, or medical documents."
            : "No links in this category."}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link) => (
            <div key={link.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
              <span className="text-base mt-0.5">{catIcon[link.category]}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-stone-900 hover:text-orange-600 transition-colors"
                >
                  {link.title}
                  <span className="text-stone-300 ml-1">↗</span>
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-400">
                    {new Date(link.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {link.notes && <span className="text-xs text-stone-400">· {link.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-stone-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
