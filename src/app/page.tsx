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
    <div className="min-h-screen bg-marfim text-carvao">
      {/* Header */}
      <header className="border-b border-argila bg-marfim/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-verde-escuro flex items-center justify-center text-xl font-bold text-marfim">
              MC
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Missão Construtores</h1>
              <p className="text-xs text-verde-escuro/70">Carbono Zero</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-carvao/60">Progresso coletivo</p>
            <p className="font-bold text-verde-escuro">{overall}%</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint border border-verde-escuro/20 text-verde-escuro text-sm mb-6 font-medium">
            <span className="w-2 h-2 rounded-full bg-verde-escuro animate-pulse"></span>
            Plataforma de criação colaborativa
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-carvao">
            Construam o aplicativo<br />
            <span className="text-verde-escuro">Missão Carbono Zero</span>
          </h2>
          <p className="text-carvao/70 text-lg max-w-2xl mx-auto">
            Cada equipe tem um papel essencial. Completem as missões, tomem decisões reais
            e vejam o aplicativo nascer a partir das suas contribuições.
          </p>
        </section>

        {/* Collective progress bar */}
        <section className="mb-12 bg-mint rounded-2xl border border-argila p-6">
          <h3 className="text-sm font-semibold text-verde-escuro mb-4 uppercase tracking-wider">
            Construção da Missão Carbono Zero
          </h3>
          <div className="space-y-3">
            {teams.map((team) => {
              const pct = collective[team.slug] || 0;
              return (
                <div key={team.slug} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium flex items-center gap-2 text-carvao">
                    <span>{team.icon}</span>
                    <span>{team.shortName}</span>
                  </div>
                  <div className="flex-1 h-3 bg-argila rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-verde-escuro"
                      style={{
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-mono text-verde-escuro font-medium">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-carvao/60 mt-4 text-center">
            O aplicativo só estará completo quando todas as equipes cumprirem sua missão.
          </p>
        </section>

        {/* Teams grid */}
        <section>
          <h3 className="text-xl font-bold mb-6 text-carvao">Escolha sua equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => {
              const pct = collective[team.slug] || 0;
              return (
                <Link
                  key={team.slug}
                  href={`/equipe/${team.slug}`}
                  className="group relative bg-marfim hover:bg-mint border border-argila hover:border-verde-escuro/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-verde-escuro/5"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80 bg-verde-escuro"
                  />
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{team.icon}</span>
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-argila text-verde-escuro font-semibold">
                      {pct}%
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-1 text-carvao group-hover:text-verde-escuro transition-colors">
                    {team.name}
                  </h4>
                  <p className="text-sm text-carvao/70 line-clamp-2 mb-4">
                    {team.mission}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-verde-escuro">
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
        <footer className="mt-16 pt-8 border-t border-argila text-center text-sm text-carvao/60">
          <p>
            Desenvolvido por <span className="text-verde-escuro font-semibold">Ubongo</span> · 
            Os alunos decidem · A Ubongo constrói
          </p>
        </footer>
      </main>
    </div>
  );
}
