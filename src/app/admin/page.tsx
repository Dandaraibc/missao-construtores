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
import { getChat } from "@/lib/rooms";
import { ChatMessage } from "@/types/room";

export default function AdminPage() {
  const [progress, setProgress] = useState<Record<string, TeamProgress>>({});
  const [collective, setCollective] = useState<CollectiveProgress>({ pesquisa: 0, produto: 0, design: 0, testes: 0, comunicacao: 0 });
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState<TeamSlug>("pesquisa");
  const [tab, setTab] = useState<"alunos" | "progresso" | "supervisao" | "aprovacoes">("alunos");

  // Chat Supervision States
  const [chatChannel, setChatChannel] = useState<"area" | "team-pesquisa" | "team-design" | "team-produto" | "meeting">("area");
  const [monitoredMessages, setMonitoredMessages] = useState<ChatMessage[]>([]);

  // Submissions State
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "sub-1",
      team: "Pesquisa",
      missionTitle: "Capítulo 1: Pegada de Carbono",
      choice: "Opção A: Calculadora por KM",
      deliverable: "Documento de especificação técnica com matriz de emissões por modalidade.",
      author: "Adrianno",
      status: "PENDING_UBONGO_REVIEW",
      date: "Hoje às 02:40",
    },
    {
      id: "sub-2",
      team: "Design",
      missionTitle: "Protótipo de Baixa Fidelidade",
      choice: "Opção B: UI Dark Mode Verde",
      deliverable: "Wireframe em Figma da tela principal do campus.",
      author: "Beatriz",
      status: "APPROVED",
      date: "Ontem às 18:20",
    },
  ]);

  const refresh = () => {
    setProgress(getAllProgress());
    setCollective(getCollectiveProgress());
    setStudents(getStudents());
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    setMonitoredMessages(getChat(chatChannel));
  }, [chatChannel]);

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

  const handleApproveSubmission = (id: string) => {
    setPendingApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "APPROVED" } : item))
    );
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
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <header className="border-b border-white/10 bg-[#111827]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/campus" className="text-white/60 hover:text-white text-xs font-bold transition-all">
            ← Voltar ao Campus
          </Link>
          <h1 className="font-extrabold text-base text-white">Painel de Gestão · Professores & Ubongo</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-black text-xs font-black transition-all shadow-lg uppercase"
        >
          Exportar JSON
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTab("alunos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "alunos"
                ? "bg-[#10b981] text-black shadow-lg"
                : "bg-[#111827] border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            👥 Cadastro de Alunos
          </button>
          <button
            onClick={() => setTab("progresso")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "progresso"
                ? "bg-[#10b981] text-black shadow-lg"
                : "bg-[#111827] border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            📊 Progresso das Equipes
          </button>
          <button
            onClick={() => setTab("supervisao")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "supervisao"
                ? "bg-[#10b981] text-black shadow-lg"
                : "bg-[#111827] border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            💬 Moderação dos Chats
          </button>
          <button
            onClick={() => setTab("aprovacoes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === "aprovacoes"
                ? "bg-[#10b981] text-black shadow-lg"
                : "bg-[#111827] border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            ✅ Aprovações Ubongo ({pendingApprovals.filter((p) => p.status === "PENDING_UBONGO_REVIEW").length})
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-10">
        {/* Tab 1: Alunos */}
        {tab === "alunos" && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
              <h2 className="font-bold text-sm text-[#10b981]">Cadastrar Novo Aluno</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome completo do aluno"
                  className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#10b981]"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <select
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value as TeamSlug)}
                  className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.slug} value={t.slug} className="bg-[#111827]">
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  className="px-6 py-3 rounded-xl bg-[#10b981] text-black text-xs font-extrabold hover:bg-[#34d399] transition-all uppercase"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {teams.map((team) => {
                const teamStudents = students.filter((s) => s.teamSlug === team.slug);
                return (
                  <div
                    key={team.slug}
                    className="bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-bold flex items-center gap-2 text-sm text-white">
                        <span>{team.icon}</span> {team.name}
                      </h3>
                      <span className="text-xs text-[#10b981] font-mono font-bold">
                        {teamStudents.length} Aluno(s)
                      </span>
                    </div>

                    {teamStudents.length === 0 ? (
                      <p className="text-xs text-white/40 italic">Nenhum aluno nesta equipe ainda.</p>
                    ) : (
                      <ul className="space-y-2">
                        {teamStudents.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/5"
                          >
                            <span className="text-xs font-bold text-white">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={student.teamSlug}
                                onChange={(e) =>
                                  handleChangeTeam(student.id, e.target.value as TeamSlug)
                                }
                                className="text-xs bg-black/40 border border-white/20 text-white rounded-lg px-2 py-1"
                              >
                                {teams.map((t) => (
                                  <option key={t.slug} value={t.slug} className="bg-[#111827]">
                                    {t.shortName}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemove(student.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 px-2 font-bold"
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

        {/* Tab 2: Progresso */}
        {tab === "progresso" && (
          <div className="grid gap-5">
            {teams.map((team) => {
              const p = progress[team.slug];
              const pct = collective[team.slug] || 0;
              return (
                <div
                  key={team.slug}
                  className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-white/5">{team.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-base">{team.name}</h3>
                        <p className="text-xs text-white/50 font-mono">
                          {p?.completedMissions.length || 0} / {team.missions.length} Quests Concluídas ·{" "}
                          <span className="text-amber-400 font-bold">{p?.xp || 0} XP</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-[#10b981]">{pct}%</div>
                  </div>

                  <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Moderação de Chats */}
        {tab === "supervisao" && (
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-sm text-[#10b981]">Monitoramento dos Canais de Comunicação</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setChatChannel("area")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  chatChannel === "area" ? "bg-purple-600 text-white shadow" : "bg-black/30 text-white/60"
                }`}
              >
                🌐 Chat da Área
              </button>
              <button
                onClick={() => setChatChannel("team-pesquisa")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  chatChannel === "team-pesquisa" ? "bg-purple-600 text-white shadow" : "bg-black/30 text-white/60"
                }`}
              >
                🛡️ Chat Pesquisa
              </button>
              <button
                onClick={() => setChatChannel("team-design")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  chatChannel === "team-design" ? "bg-purple-600 text-white shadow" : "bg-black/30 text-white/60"
                }`}
              >
                🛡️ Chat Design
              </button>
              <button
                onClick={() => setChatChannel("meeting")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  chatChannel === "meeting" ? "bg-purple-600 text-white shadow" : "bg-black/30 text-white/60"
                }`}
              >
                👥 Chat Reunião
              </button>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 rounded-2xl bg-black/40 p-4 border border-white/10 text-xs">
              {monitoredMessages.length === 0 ? (
                <div className="text-white/40 italic text-center pt-8">
                  Nenhuma mensagem registrada neste canal durante a sessão.
                </div>
              ) : (
                monitoredMessages.map((msg) => (
                  <div key={msg.id} className="rounded-xl bg-white/5 p-3 border border-white/5 shadow-sm space-y-1">
                    <div className="flex justify-between font-bold text-[#10b981]">
                      <span>👤 {msg.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-white/90">{msg.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Aprovações Ubongo */}
        {tab === "aprovacoes" && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-white">Revisão de Entregáveis das Equipes (Ubongo Approval Flow)</h2>
            {pendingApprovals.map((item) => (
              <div key={item.id} className="bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-extrabold text-[#10b981] uppercase font-mono">Equipe {item.team}</span>
                    <h3 className="font-extrabold text-base text-white mt-1">{item.missionTitle}</h3>
                    <p className="text-xs text-white/50">{item.choice} · Submetido por {item.author} ({item.date})</p>
                  </div>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                      item.status === "APPROVED"
                        ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse"
                    }`}
                  >
                    {item.status === "APPROVED" ? "✅ APROVADO PELA UBONGO" : "⏳ AGUARDANDO REVISÃO UBONGO"}
                  </span>
                </div>

                <div className="rounded-2xl bg-black/40 p-4 border border-white/10 text-xs text-white/80 space-y-1">
                  <span className="font-bold text-white block">Conteúdo do Entregável:</span>
                  <p>{item.deliverable}</p>
                </div>

                {item.status !== "APPROVED" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleApproveSubmission(item.id)}
                      className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-black font-extrabold text-xs shadow-lg uppercase transition-all"
                    >
                      Aprovar Entregável (+XP para a Equipe)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
