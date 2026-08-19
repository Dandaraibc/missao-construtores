"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { teams } from "@/data/teams";
import { getAllProgress, getCollectiveProgress, exportAllData } from "@/lib/progress";
import {
  getStudents,
  addStudent,
  removeStudent,
  updateStudent,
  Student,
} from "@/lib/students";
import { CollectiveProgress, TeamProgress, TeamSlug } from "@/types";

export default function AdminPage() {
  const [progress, setProgress] = useState<Record<string, TeamProgress>>({});
  const [collective, setCollective] = useState<CollectiveProgress>({ pesquisa: 0, produto: 0, design: 0, testes: 0, comunicacao: 0 });
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState<TeamSlug>("pesquisa");
  const [tab, setTab] = useState<"alunos" | "progresso">("alunos");

  const refresh = () => {
    setProgress(getAllProgress());
    setCollective(getCollectiveProgress());
    setStudents(getStudents());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) {
      alert("Digite o nome do aluno");
      return;
    }
    addStudent(newName, newTeam);
    setNewName("");
    refresh();
  };

  const handleRemove = (id: string) => {
    if (confirm("Remover este aluno?")) {
      removeStudent(id);
      refresh();
    }
  };

  const handleChangeTeam = (id: string, teamSlug: TeamSlug) => {
    updateStudent(id, { teamSlug });
    refresh();
  };

  const handleExport = () => {
    const data = {
      ...exportAllData(),
      students: getStudents(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missao-construtores-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C]">
      <header className="border-b border-[#EDE7DC] bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#1C1C1C]/50 hover:text-[#1C1C1C] text-sm">
            ← Voltar
          </Link>
          <h1 className="font-semibold text-lg">Painel do Professor</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-[#315F4C] hover:bg-[#2a5240] text-white text-sm font-medium transition-colors"
        >
          Exportar tudo
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("alunos")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "alunos"
                ? "bg-[#315F4C] text-white"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            Cadastro de Alunos
          </button>
          <button
            onClick={() => setTab("progresso")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "progresso"
                ? "bg-[#315F4C] text-white"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            Progresso das Equipes
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-10">
        {tab === "alunos" && (
          <div>
            <div className="bg-white border border-[#EDE7DC] rounded-2xl p-5 mb-6">
              <h2 className="font-semibold mb-4">Adicionar aluno</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do aluno"
                  className="flex-1 bg-[#FAF7F2] border border-[#EDE7DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#315F4C]/30"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <select
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value as TeamSlug)}
                  className="bg-[#FAF7F2] border border-[#EDE7DC] rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  className="px-6 py-3 rounded-xl bg-[#315F4C] text-white text-sm font-medium hover:bg-[#2a5240]"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {teams.map((team) => {
                const teamStudents = students.filter((s) => s.teamSlug === team.slug);
                return (
                  <div
                    key={team.slug}
                    className="bg-white border border-[#EDE7DC] rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span>{team.icon}</span> {team.name}
                      </h3>
                      <span className="text-sm text-[#1C1C1C]/45">
                        {teamStudents.length} aluno{teamStudents.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {teamStudents.length === 0 ? (
                      <p className="text-sm text-[#1C1C1C]/40">Nenhum aluno nesta equipe ainda.</p>
                    ) : (
                      <ul className="space-y-2">
                        {teamStudents.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-[#FAF7F2]"
                          >
                            <span className="text-sm font-medium">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={student.teamSlug}
                                onChange={(e) =>
                                  handleChangeTeam(student.id, e.target.value as TeamSlug)
                                }
                                className="text-xs bg-white border border-[#EDE7DC] rounded-lg px-2 py-1"
                              >
                                {teams.map((t) => (
                                  <option key={t.slug} value={t.slug}>
                                    {t.shortName}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemove(student.id)}
                                className="text-xs text-red-500 hover:text-red-700 px-2"
                              >
                                Remover
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "progresso" && (
          <div className="grid gap-5">
            {teams.map((team) => {
              const p = progress[team.slug];
              const pct = collective[team.slug] || 0;
              return (
                <div
                  key={team.slug}
                  className="bg-white border border-[#EDE7DC] rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{team.icon}</span>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-[#1C1C1C]/50">
                          {p?.completedMissions.length || 0} / {team.missions.length} quests ·{" "}
                          {p?.xp || 0} XP
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-[#315F4C]">{pct}%</div>
                  </div>

                  <div className="h-2 bg-[#EDE7DC] rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#39FF14" : "#315F4C",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
