"use client";

import { useState, useRef } from "react";
import { HealthData, SavedLink } from "@/lib/types";
import { findMarkerDef, getStatus } from "@/lib/bloodMarkers";

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

interface ExtractionResult {
  date: string | null;
  documentTitle: string;
  findings: { bodyPart: string; note: string }[];
  bloodMarkers?: { type: string; value: string; unit: string; status: "normal" | "low" | "high" }[];
  takeaways?: string[];
}

export default function LinksSection({ data, onUpdate }: LinksSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [category, setCategory] = useState<"consult" | "referral" | "document">("consult");
  const [notes, setNotes] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileError, setFileError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<ExtractionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterCat, setFilterCat] = useState<"all" | "consult" | "referral" | "document">("all");

  const links = data.links || [];
  const filtered = filterCat === "all" ? links : links.filter((l) => l.category === filterCat);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function resetForm() {
    setTitle(""); setUrl(""); setPastedContent(""); setNotes("");
    setFileData(null); setFileName(""); setFileType(""); setFileError("");
    setExtractResult(null); setShowAdd(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setFileError("File must be under 4MB"); return; }
    setFileError("");
    setFileName(file.name);
    setFileType(file.type);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveAndExtract(linkData: SavedLink) {
    // Save the link first
    onUpdate((prev) => ({ ...prev, links: [...(prev.links || []), linkData] }));

    // Then extract findings
    setExtracting(true);
    try {
      const body: Record<string, string> = {};
      if (linkData.fileData) {
        body.fileData = linkData.fileData;
        body.fileType = linkData.fileType || "";
        body.fileName = linkData.fileName || "";
      } else if (pastedContent) {
        body.content = pastedContent;
      }

      // Only extract if we have content to analyze
      if (body.fileData || body.content) {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const result: ExtractionResult = await res.json();
          setExtractResult(result);

          const docDate = result.date || new Date().toISOString().split("T")[0];
          onUpdate((prev) => {
            const newBodyParts = { ...prev.bodyParts };
            if (result.findings.length > 0) {
              for (const finding of result.findings) {
                const existing = newBodyParts[finding.bodyPart]?.notes || [];
                newBodyParts[finding.bodyPart] = {
                  notes: [...existing, {
                    id: crypto.randomUUID(),
                    text: finding.note,
                    date: docDate + "T12:00:00.000Z",
                    source: "extracted" as const,
                  }],
                };
              }
            }
            // Save blood markers
            const newBloodMarkers = [...(prev.bloodMarkers || [])];
            if (result.bloodMarkers && result.bloodMarkers.length > 0) {
              for (const bm of result.bloodMarkers) {
                const def = findMarkerDef(bm.type);
                const numVal = parseFloat(bm.value);
                const autoStatus = def && !isNaN(numVal) ? getStatus(def, numVal) : bm.status;
                newBloodMarkers.push({
                  id: crypto.randomUUID(),
                  type: def?.name || bm.type,
                  value: bm.value,
                  unit: def?.unit || bm.unit,
                  date: docDate + "T12:00:00.000Z",
                  status: autoStatus,
                });
              }
            }
            // Save takeaways to the link
            const newLinks = (prev.links || []).map((l) =>
              l.id === linkData.id ? { ...l, takeaways: result.takeaways || [] } : l
            );
            return { ...prev, bodyParts: newBodyParts, bloodMarkers: newBloodMarkers, links: newLinks };
          });
        }
      }
    } catch {
      // Extraction failed silently, link is still saved
    }
    setExtracting(false);
  }

  function handleSubmitLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const link: SavedLink = {
      id: crypto.randomUUID(), title: title.trim(), url: url.trim(),
      category, date: new Date().toISOString(), notes: notes.trim(),
    };
    handleSaveAndExtract(link);
  }

  function handleSubmitFile(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !fileData) return;
    const link: SavedLink = {
      id: crypto.randomUUID(), title: title.trim(), url: "",
      category, date: new Date().toISOString(), notes: notes.trim(),
      fileData, fileName, fileType,
    };
    handleSaveAndExtract(link);
  }

  function handleEdit(updated: SavedLink) {
    onUpdate((prev) => ({ ...prev, links: (prev.links || []).map((l) => l.id === updated.id ? updated : l) }));
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
          <button onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCat === "all" ? "bg-orange-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}>
            All ({links.length})
          </button>
          {categories.map((c) => {
            const count = links.filter((l) => l.category === c.id).length;
            return (
              <button key={c.id} onClick={() => setFilterCat(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCat === c.id ? "bg-orange-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}>
                {c.icon} {c.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
        <button onClick={() => { setShowAdd(!showAdd); if (showAdd) resetForm(); }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors flex-shrink-0">
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && !extracting && !extractResult && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setAddMode("link")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${addMode === "link" ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}>
              Paste Link / Content
            </button>
            <button onClick={() => setAddMode("file")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${addMode === "file" ? "bg-neutral-700 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}>
              Upload File
            </button>
          </div>

          {addMode === "link" ? (
            <form onSubmit={handleSubmitLink} className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Dr Smith consult 18 Apr)"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link (optional)"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <textarea value={pastedContent} onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Paste transcript, consult notes, or test results here for auto-extraction..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" rows={5} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">Type:</span>
                {categories.map((c) => (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${category === c.id ? "bg-orange-950 text-orange-400" : "bg-neutral-800 text-neutral-400"}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!title.trim()}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">
                {pastedContent ? "Save & Extract Findings" : "Save Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitFile} className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
              <div onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${fileData ? "border-orange-800 bg-orange-950/30" : "border-neutral-700 hover:border-neutral-600"}`}>
                {fileData ? (
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{fileName}</p>
                    <p className="text-xs text-neutral-500 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-neutral-400">Click to select a file</p>
                    <p className="text-xs text-neutral-600 mt-1">PDF, images, documents (max 4MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" className="hidden" />
              {fileError && <p className="text-xs text-red-400">{fileError}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">Type:</span>
                {categories.map((c) => (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${category === c.id ? "bg-orange-950 text-orange-400" : "bg-neutral-800 text-neutral-400"}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!title.trim() || !fileData}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 disabled:opacity-40 transition-colors">
                Upload & Extract Findings
              </button>
            </form>
          )}
        </div>
      )}

      {/* Extraction in progress */}
      {extracting && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3 py-6 justify-center">
            <div className="w-5 h-5 border-2 border-orange-800 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Analyzing document for abnormal findings...</p>
          </div>
        </div>
      )}

      {/* Extraction results */}
      {extractResult && (
        <div className="pb-4 mb-4 border-b border-neutral-800">
          <div className="bg-orange-950/30 border border-orange-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-orange-400">Extraction Complete</h4>
              <button onClick={() => { setExtractResult(null); resetForm(); }}
                className="text-xs text-neutral-500 hover:text-neutral-300">Dismiss</button>
            </div>
            <div className="space-y-3">
              {extractResult.findings.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">{extractResult.findings.length} body finding{extractResult.findings.length > 1 ? "s" : ""} added
                    {extractResult.date && ` (${new Date(extractResult.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })})`}
                  </p>
                  {extractResult.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-neutral-300 capitalize">{f.bodyPart.replace(/-/g, " ")}</span>
                        <p className="text-xs text-neutral-500">{f.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {extractResult.bloodMarkers && extractResult.bloodMarkers.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">{extractResult.bloodMarkers.length} blood marker{extractResult.bloodMarkers.length > 1 ? "s" : ""} recorded</p>
                  <div className="flex flex-wrap gap-1.5">
                    {extractResult.bloodMarkers.map((bm, i) => (
                      <span key={i} className={`px-2 py-0.5 text-[10px] rounded-full border ${bm.status === "high" ? "bg-red-500/10 border-red-500/20 text-red-400" : bm.status === "low" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-green-500/10 border-green-500/20 text-green-400"}`}>
                        {bm.type} {bm.value} {bm.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {extractResult.findings.length === 0 && (!extractResult.bloodMarkers || extractResult.bloodMarkers.length === 0) && (
                <p className="text-sm text-neutral-400">No abnormal findings detected.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {sorted.length === 0 && !showAdd && !extracting && !extractResult ? (
        <p className="text-sm text-neutral-600 text-center py-4">
          No documents saved yet. Upload medical documents to auto-extract body annotations.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link) => (
            <LinkItem key={link.id} link={link} catIcon={catIcon} onEdit={handleEdit} onDelete={() => handleDelete(link.id)} onOpenFile={handleOpenFile} />
          ))}
        </div>
      )}
    </div>
  );
}

function LinkItem({ link, catIcon, onEdit, onDelete, onOpenFile }: {
  link: SavedLink; catIcon: Record<string, string>;
  onEdit: (l: SavedLink) => void; onDelete: () => void; onOpenFile: (l: SavedLink) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [showTakeaways, setShowTakeaways] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [date, setDate] = useState(new Date(link.date).toISOString().split("T")[0]);
  const [notes, setNotes] = useState(link.notes);
  const [url, setUrl] = useState(link.url);
  const [category, setCategory] = useState(link.category);

  if (editing) {
    return (
      <div className="bg-neutral-800/50 rounded-xl p-3 space-y-2">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {!link.fileData && (
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-500">Type:</span>
          {([
            { id: "consult" as const, label: "Consult", icon: "🎙️" },
            { id: "referral" as const, label: "Referral", icon: "📋" },
            { id: "document" as const, label: "Document", icon: "📄" },
          ]).map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${category === c.id ? "bg-orange-950 text-orange-400" : "bg-neutral-800 text-neutral-500"}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white resize-none placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <div className="flex gap-2">
          <button onClick={() => { onEdit({ ...link, title, date: new Date(date + "T12:00:00").toISOString(), notes, url, category }); setEditing(false); }}
            className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-500">Save</button>
          <button onClick={() => { setEditing(false); setTitle(link.title); setDate(new Date(link.date).toISOString().split("T")[0]); setNotes(link.notes); setUrl(link.url); }}
            className="px-3 py-1 text-neutral-400 text-xs rounded-lg hover:bg-neutral-800">Cancel</button>
        </div>
      </div>
    );
  }

  const hasTakeaways = link.takeaways && link.takeaways.length > 0;

  return (
    <div className={`rounded-xl transition-colors ${showTakeaways ? "bg-neutral-800/30" : ""}`}>
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors group">
        <span className="text-base mt-0.5">{catIcon[link.category]}</span>
        <div className="flex-1 min-w-0">
          {link.fileData ? (
            <button onClick={() => onOpenFile(link)}
              className="text-sm font-medium text-neutral-200 hover:text-orange-400 transition-colors text-left">
              {link.title}
              <span className="ml-1.5 text-xs text-neutral-600 font-normal">{link.fileName}</span>
            </button>
          ) : link.url ? (
            <a href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-200 hover:text-orange-400 transition-colors">
              {link.title}<span className="text-neutral-600 ml-1">↗</span>
            </a>
          ) : (
            <p className="text-sm font-medium text-neutral-200">{link.title}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-neutral-600">
              {new Date(link.date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {link.notes && <span className="text-xs text-neutral-600">· {link.notes}</span>}
            {hasTakeaways && (
              <button onClick={() => setShowTakeaways(!showTakeaways)}
                className="text-xs text-orange-500/70 hover:text-orange-400 transition-colors flex items-center gap-0.5">
                Key takeaways
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${showTakeaways ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing(true)}
            className="text-neutral-700 hover:text-orange-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-xs">Edit</button>
          <button onClick={() => { if (confirm("Delete this record?")) onDelete(); }}
            className="text-neutral-700 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-lg">&times;</button>
        </div>
      </div>
      {showTakeaways && hasTakeaways && (
        <div className="px-3 pb-3 ml-9 space-y-1.5">
          {link.takeaways!.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-orange-500/50 text-xs mt-0.5">{i + 1}.</span>
              <p className="text-xs text-neutral-400">{t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
