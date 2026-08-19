"use client";

import Link from "next/link";
import { teams } from "@/data/teams";
import { getCollectiveProgress, getOverallProgress } from "@/lib/progress";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [collective, setCollective] = useState({
    pesquisa: 0,
    produto: 0,
    design: 0,
    testes: 0,
    comunicacao: 0,
  });
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    setCollective(getCollectiveProgress());
    setOverall(getOverallProgress());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-xl font-bold text-white">
              MC
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Missão Construtores</h1>
              <p className="text-xs text-slate-400">Carbono Zero</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Progresso coletivo</p>
            <p className="font-bold text-emerald-400">{overall}%</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Plataforma de criação colaborativa
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Construam o aplicativo<br />
            <span className="text-emerald-400">Missão Carbono Zero</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cada equipe tem um papel essencial. Completem as missões, tomem decisões reais
            e vejam o aplicativo nascer a partir das suas contribuições.
          </p>
        </section>

        {/* Collective progress bar */}
        <section className="mb-12 bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Construção da Missão Carbono Zero
          </h3>
          <div className="space-y-3">
            {teams.map((team) => {
              const pct = collective[team.slug] || 0;
              return (
                <div key={team.slug} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium flex items-center gap-2">
                    <span>{team.icon}</span>
                    <span>{team.shortName}</span>
                  </div>
                  <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: team.color,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-mono text-slate-300">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            O aplicativo só estará completo quando todas as equipes cumprirem sua missão.
          </p>
        </section>

        {/* Teams grid */}
        <section>
          <h3 className="text-xl font-bold mb-6">Escolha sua equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => {
              const pct = collective[team.slug] || 0;
              return (
                <Link
                  key={team.slug}
                  href={`/equipe/${team.slug}`}
                  className="group relative bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{team.icon}</span>
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                      {pct}%
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-white transition-colors">
                    {team.name}
                  </h4>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {team.mission}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: team.color }}>
                    Entrar na equipe
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer note */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>
            Desenvolvido por <span className="text-emerald-400 font-medium">Ubongo</span> · 
            Os alunos decidem · A Ubongo constrói
          </p>
        </footer>
      </main>
    </div>
  );
}
