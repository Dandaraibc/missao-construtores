"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { teams } from "@/data/teams";
import { getAllProgress, getCollectiveProgress, exportAllData } from "@/lib/progress";
import { TeamProgress } from "@/types";

export default function AdminPage() {
  const [progress, setProgress] = useState<Record<string, TeamProgress>>({});
  const [collective, setCollective] = useState<Record<string, number>>({});

  useEffect(() => {
    setProgress(getAllProgress());
    setCollective(getCollectiveProgress());
  }, []);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missao-construtores-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm">
            ← Voltar
          </Link>
          <h1 className="font-bold text-lg">Painel Ubongo / Professor</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
        >
          Exportar JSON
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold mb-6">Progresso das equipes</h2>

        <div className="grid gap-6">
          {teams.map((team) => {
            const p = progress[team.slug];
            const pct = collective[team.slug] || 0;
            return (
              <div
                key={team.slug}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.icon}</span>
                    <div>
                      <h3 className="font-bold">{team.name}</h3>
                      <p className="text-sm text-slate-400">
                        {p?.completedMissions.length || 0} / {team.missions.length} missões · {p?.xp || 0} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: team.color }}>
                    {pct}%
                  </div>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: team.color }}
                  />
                </div>

                {p && p.completedMissions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Entregas</p>
                    {p.completedMissions.map((mid) => {
                      const mission = team.missions.find((m) => m.id === mid);
                      return (
                        <details key={mid} className="bg-slate-800/50 rounded-lg p-3">
                          <summary className="cursor-pointer text-sm font-medium">
                            {mission?.title || mid}
                          </summary>
                          <pre className="mt-3 text-xs text-slate-400 overflow-auto max-h-48">
                            {JSON.stringify(p.answers[mid], null, 2)}
                          </pre>
                        </details>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
