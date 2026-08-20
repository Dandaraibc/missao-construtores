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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C]">
      <header className="border-b border-[#EDE7DC] bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campus" className="text-[#1C1C1C]/50 hover:text-[#1C1C1C] text-sm font-semibold">
            ← Voltar ao Campus
          </Link>
          <h1 className="font-bold text-lg">Painel de Gestão · Professores & Ubongo</h1>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-[#315F4C] hover:bg-[#2a5240] text-white text-sm font-semibold transition-colors"
        >
          Exportar Dados (.json)
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTab("alunos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === "alunos"
                ? "bg-[#315F4C] text-white shadow"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            👥 Cadastro de Alunos
          </button>
          <button
            onClick={() => setTab("progresso")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === "progresso"
                ? "bg-[#315F4C] text-white shadow"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            📊 Progresso das Equipes
          </button>
          <button
            onClick={() => setTab("supervisao")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === "supervisao"
                ? "bg-[#315F4C] text-white shadow"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            💬 Supervisão de Chats
          </button>
          <button
            onClick={() => setTab("aprovacoes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === "aprovacoes"
                ? "bg-[#315F4C] text-white shadow"
                : "bg-white border border-[#EDE7DC] text-[#1C1C1C]"
            }`}
          >
            ✅ Aprovações Ubongo ({pendingApprovals.filter((p) => p.status === "PENDING_UBONGO_REVIEW").length})
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-10">
        {/* Tab 1: Alunos */}
        {tab === "alunos" && (
          <div>
            <div className="bg-white border border-[#EDE7DC] rounded-2xl p-5 mb-6 shadow-sm">
              <h2 className="font-bold mb-4 text-sm">Adicionar Novo Aluno</h2>
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
                  className="px-6 py-3 rounded-xl bg-[#315F4C] text-white text-sm font-bold hover:bg-[#2a5240]"
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
                    className="bg-white border border-[#EDE7DC] rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold flex items-center gap-2 text-sm">
                        <span>{team.icon}</span> {team.name}
                      </h3>
                      <span className="text-xs text-[#1C1C1C]/45 font-mono">
                        {teamStudents.length} aluno{teamStudents.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {teamStudents.length === 0 ? (
                      <p className="text-xs text-[#1C1C1C]/40 italic">Nenhum aluno nesta equipe ainda.</p>
                    ) : (
                      <ul className="space-y-2">
                        {teamStudents.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-[#FAF7F2]"
                          >
                            <span className="text-xs font-bold">{student.name}</span>
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
                                className="text-xs text-rose-600 hover:text-rose-800 px-2 font-bold"
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
                  className="bg-white border border-[#EDE7DC] rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{team.icon}</span>
                      <div>
                        <h3 className="font-bold">{team.name}</h3>
                        <p className="text-xs text-[#1C1C1C]/50 font-mono">
                          {p?.completedMissions.length || 0} / {team.missions.length} missões concluídas ·{" "}
                          {p?.xp || 0} XP
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-[#315F4C]">{pct}%</div>
                  </div>

                  <div className="h-2.5 bg-[#EDE7DC] rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#10b981" : "#315F4C",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Supervisão de Chats */}
        {tab === "supervisao" && (
          <div className="bg-white border border-[#EDE7DC] rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-sm mb-4">Monitoramento e Moderação dos Chats do Office</h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setChatChannel("area")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  chatChannel === "area" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                🌐 Chat da Área
              </button>
              <button
                onClick={() => setChatChannel("team-pesquisa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  chatChannel === "team-pesquisa" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                🛡️ Chat Pesquisa
              </button>
              <button
                onClick={() => setChatChannel("team-design")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  chatChannel === "team-design" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                🛡️ Chat Design
              </button>
              <button
                onClick={() => setChatChannel("meeting")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  chatChannel === "meeting" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                👥 Chat Reunião
              </button>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs">
              {monitoredMessages.length === 0 ? (
                <div className="text-gray-400 italic text-center pt-8">
                  Nenhuma mensagem captada neste canal durante a sessão.
                </div>
              ) : (
                monitoredMessages.map((msg) => (
                  <div key={msg.id} className="rounded-lg bg-white p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between font-bold text-purple-700 mb-1">
                      <span>👤 {msg.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-800">{msg.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Aprovações Ubongo */}
        {tab === "aprovacoes" && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm mb-2">Revisão de Entregáveis das Equipes (Ubongo Approval Flow)</h2>
            {pendingApprovals.map((item) => (
              <div key={item.id} className="bg-white border border-[#EDE7DC] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-purple-600 uppercase font-mono">Equipe {item.team}</span>
                    <h3 className="font-bold text-base">{item.missionTitle}</h3>
                    <p className="text-xs text-gray-500">{item.choice} · Submetido por {item.author} ({item.date})</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                    }`}
                  >
                    {item.status === "APPROVED" ? "✅ APROVADO PELA UBONGO" : "⏳ AGUARDANDO REVISÃO UBONGO"}
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs text-gray-700">
                  <span className="font-bold block mb-1">Conteúdo do Entregável:</span>
                  {item.deliverable}
                </div>

                {item.status !== "APPROVED" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleApproveSubmission(item.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
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
