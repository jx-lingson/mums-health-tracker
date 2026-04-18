"use client";

import { useState, useRef } from "react";
import { HealthData, SavedLink } from "@/lib/types";

interface LinksSectionProps {
  data: HealthData;
  onUpdate: (fn: (prev: HealthData) => HealthData) => void;
}

const categories = [
  { id: "consult" as const, label: "Consult Recordings", icon: "🎙️" },
  { id: "referral" as const, label: "Referrals", icon: "📋" },
  { id: "document" as const, label: "Medical Documents", icon: "📄" },
];

type AddMode = "link" | "file";

export default function LinksSection({ data, onUpdate }: LinksSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"consult" | "referral" | "document">("consult");
  const [notes, setNotes] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterCat, setFilterCat] = useState<"all" | "consult" | "referral" | "document">("all");

  const links = data.links || [];
  const filtered = filterCat === "all" ? links : links.filter((l) => l.category === filterCat);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function resetForm() {
    setTitle("");
    setUrl("");
    setNotes("");
    setFileData(null);
    setFileName("");
    setFileType("");
    setFileError("");
    setShowAdd(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setFileError("File must be under 4MB");
      return;
    }

    setFileError("");
    setFileName(file.name);
    setFileType(file.type);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmitLink(e: React.FormEvent) {
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
    resetForm();
  }

  function handleSubmitFile(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !fileData) return;
    const link: SavedLink = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: "",
      category,
      date: new Date().toISOString(),
      notes: notes.trim(),
      fileData,
      fileName,
      fileType,
    };
    onUpdate((prev) => ({ ...prev, links: [...(prev.links || []), link] }));
    resetForm();
  }

  function handleDelete(id: string) {
    onUpdate((prev) => ({ ...prev, links: (prev.links || []).filter((l) => l.id !== id) }));
  }

  function handleOpenFile(link: SavedLink) {
    if (link.fileData) {
      const win = window.open();
      if (win) {
        if (link.fileType?.startsWith("image/")) {
          win.document.write(`<img src="${link.fileData}" style="max-width:100%" />`);
        } else {
          win.document.write(`<iframe src="${link.fileData}" style="width:100%;height:100%;border:none" />`);
        }
        win.document.title = link.title;
      }
    }
  }

  const catIcon: Record<string, string> = { consult: "🎙️", referral: "📋", document: "📄" };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterCat === "all" ? "bg-orange-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
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
                  filterCat === c.id ? "bg-orange-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {c.icon} {c.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); if (showAdd) resetForm(); }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors flex-shrink-0"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAddMode("link")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                addMode === "link" ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Paste Link
            </button>
            <button
              onClick={() => setAddMode("file")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                addMode === "file" ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Upload File
            </button>
          </div>

          {addMode === "link" ? (
            <form onSubmit={handleSubmitLink} className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g. Dr Smith consult, Knee MRI results)"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste link here..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">Type:</span>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      category === c.id ? "bg-orange-950 text-orange-400" : "bg-stone-100 text-neutral-500"
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
          ) : (
            <form onSubmit={handleSubmitFile} className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  fileData ? "border-orange-800 bg-orange-950/30" : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                {fileData ? (
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{fileName}</p>
                    <p className="text-xs text-neutral-400 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-500">Click to select a file</p>
                    <p className="text-xs text-neutral-400 mt-1">PDF, images, documents (max 4MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                className="hidden"
              />
              {fileError && <p className="text-xs text-red-500">{fileError}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">Type:</span>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      category === c.id ? "bg-orange-950 text-orange-400" : "bg-stone-100 text-neutral-500"
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
                disabled={!title.trim() || !fileData}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-40 transition-colors"
              >
                Upload File
              </button>
            </form>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">
          {links.length === 0
            ? "No links or documents saved yet. Add Granola consult recordings, referrals, or upload medical documents."
            : "No items in this category."}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link) => (
            <div key={link.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors group">
              <span className="text-base mt-0.5">{catIcon[link.category]}</span>
              <div className="flex-1 min-w-0">
                {link.fileData ? (
                  <button
                    onClick={() => handleOpenFile(link)}
                    className="text-sm font-medium text-neutral-200 hover:text-orange-600 transition-colors text-left"
                  >
                    {link.title}
                    <span className="ml-1.5 text-xs text-neutral-400 font-normal">{link.fileName}</span>
                  </button>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-neutral-200 hover:text-orange-600 transition-colors"
                  >
                    {link.title}
                    <span className="text-neutral-300 ml-1">↗</span>
                  </a>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-400">
                    {new Date(link.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {link.notes && <span className="text-xs text-neutral-400">· {link.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-neutral-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg"
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
