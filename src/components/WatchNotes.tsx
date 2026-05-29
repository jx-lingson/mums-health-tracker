"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function WatchNotes({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [local]);

  return (
    <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
          <path d="M12 9v4" /><path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Things to Look Out For</h2>
      </div>
      <textarea
        ref={textareaRef}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Notes to yourself — symptoms to watch, questions for the doctor, reminders..."
        rows={2}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-600/60 focus:ring-1 focus:ring-orange-600/30 resize-none leading-relaxed"
      />
    </section>
  );
}
