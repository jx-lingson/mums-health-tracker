"use client";

import { useState } from "react";
import { HealthData, EMPTY_HEALTH_DATA } from "@/lib/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import BodyView from "./body/BodyView";
import VitalsView from "./vitals/VitalsView";
import HistoryView from "./history/HistoryView";

type Tab = "body" | "vitals" | "history";

const tabs: { id: Tab; label: string }[] = [
  { id: "body", label: "Body Map" },
  { id: "vitals", label: "Vitals" },
  { id: "history", label: "Medical History" },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("body");
  const [data, setData] = useLocalStorage<HealthData>("health-tracker-data", EMPTY_HEALTH_DATA);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mum&apos;s Health Tracker</h1>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "body" && <BodyView data={data} onUpdate={setData} />}
        {activeTab === "vitals" && <VitalsView data={data} onUpdate={setData} />}
        {activeTab === "history" && <HistoryView data={data} onUpdate={setData} />}
      </main>
    </div>
  );
}
