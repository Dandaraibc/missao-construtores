"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeam } from "@/data/teams";
import { getTeamProgress, completeMission } from "@/lib/progress";
import { TeamProgress, Mission } from "@/types";

export default function EquipePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const team = getTeam(slug);

  const [progress, setProgress] = useState<TeamProgress | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!team) return;
    setProgress(getTeamProgress(team.slug));
  }, [team]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f17] text-white">
        <div className="text-center p-8 rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
          <h1 className="text-2xl font-bold mb-4">Portal de Equipe Não Encontrado</h1>
          <Link href="/campus" className="inline-block px-6 py-2.5 rounded-xl bg-[#10b981] font-bold text-black hover:bg-[#34d399] transition-all">
            ← Voltar ao Campus Virtual
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = progress?.completedMissions.length || 0;
  const totalMissions = team.missions.length;
  const percent = Math.round((completedCount / totalMissions) * 100);

  const isMissionUnlocked = (mission: Mission, index: number) => {
    if (index === 0) return true;
    const prev = team.missions[index - 1];
    return progress?.completedMissions.includes(prev.id) ?? false;
  };

  const isMissionCompleted = (missionId: string) => {
    return progress?.completedMissions.includes(missionId) ?? false;
  };

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setAnswers(progress?.answers[mission.id] || {});
    setShowSuccess(false);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = () => {
    if (!activeMission || !team) return;

    const requiredFields = activeMission.fields.filter((f) => f.required);
    for (const field of requiredFields) {
      const val = answers[field.id];
      if (
        !val ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === "string" && !val.trim())
      ) {
        alert(`Por favor, preencha o campo obrigatório: ${field.label}`);
        return;
      }
    }

    const updated = completeMission(
      team.slug,
      activeMission.id,
      answers,
      activeMission.xpReward,
      activeMission.badge
    );
    setProgress(updated);
    setShowSuccess(true);
  };

  const handleCloseMission = () => {
    setActiveMission(null);
    setShowSuccess(false);
  };

  // ========== ACTIVE MISSION DETAIL VIEW ==========
  if (activeMission) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white">
        <header className="border-b border-white/10 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleCloseMission}
              className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all"
            >
              ← Voltar para as Quests da Equipe
            </button>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/30">
              <span>{team.icon}</span>
              <span>{team.shortName}</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">
          {showSuccess ? (
            <div className="text-center py-16 space-y-6 rounded-3xl border border-[#10b981]/30 bg-[#111827] p-8 shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#10b981]/20 border-2 border-[#10b981] flex items-center justify-center text-4xl text-[#10b981] animate-bounce">
                ✓
              </div>
              <h2 className="text-3xl font-extrabold text-white">Quest Concluída com Sucesso!</h2>
              <div className="inline-block px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-base">
                +{activeMission.xpReward} XP Recompensados
              </div>
              {activeMission.badge && (
                <p className="text-sm text-white/70">
                  Relíquia de Conquista: <span className="font-bold text-[#10b981]">{activeMission.badge}</span>
                </p>
              )}
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Sua entrega de <strong className="text-white">{activeMission.deliveryLabel}</strong> foi gravada e sincronizada no campus!
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={handleCloseMission}
                  className="px-6 py-3 rounded-xl font-extrabold text-black bg-[#10b981] hover:bg-[#34d399] transition-all shadow-lg text-xs"
                >
                  Próximas Quests ➔
                </button>
                <button
                  onClick={() => router.push("/campus")}
                  className="px-6 py-3 rounded-xl font-bold border border-white/20 text-white hover:bg-white/10 transition-all text-xs"
                >
                  Voltar ao Campus
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-2 font-mono">
                  Quest {activeMission.number} de {totalMissions}
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                  {activeMission.title}
                </h1>
                <p className="text-sm text-white/70 leading-relaxed">{activeMission.description}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 font-mono">
                  📜 Contexto do Problema
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">{activeMission.context}</p>
              </div>

              <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/10 p-5 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#10b981] mb-2 font-mono">
                  🎯 Desafio da Equipe
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-semibold">{activeMission.challenge}</p>
              </div>

              <div className="space-y-6 pt-4">
                {activeMission.fields.map((field) => (
                  <div key={field.id} className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <label className="block text-xs font-bold text-white mb-3">
                      {field.label}
                      {field.required && <span className="text-rose-400 ml-1">*</span>}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#10b981]"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#10b981] resize-y"
                      />
                    )}

                    {field.type === "radio" && field.options && (
                      <div className="space-y-2">
                        {field.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              answers[field.id] === opt
                                ? "bg-[#10b981]/20 border-[#10b981] text-white font-bold"
                                : "bg-black/20 border-white/10 text-white/70 hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.id}
                              checked={answers[field.id] === opt}
                              onChange={() => handleFieldChange(field.id, opt)}
                              className="w-4 h-4 accent-[#10b981]"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "checklist" && field.options && (
                      <div className="space-y-2">
                        {field.options.map((opt) => {
                          const current: string[] = answers[field.id] || [];
                          const checked = current.includes(opt);
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                checked
                                  ? "bg-[#10b981]/20 border-[#10b981] text-white font-bold"
                                  : "bg-black/20 border-white/10 text-white/70 hover:bg-white/5"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    handleFieldChange(
                                      field.id,
                                      current.filter((c) => c !== opt)
                                    );
                                  } else {
                                    handleFieldChange(field.id, [...current, opt]);
                                  }
                                }}
                                className="w-4 h-4 accent-[#10b981]"
                              />
                              <span className="text-xs">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="sticky bottom-4 bg-[#111827]/95 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl font-black text-black text-sm bg-[#10b981] hover:bg-[#34d399] transition-all shadow-lg uppercase tracking-wider active:scale-95"
                >
                  Concluir Quest · +{activeMission.xpReward} XP
                </button>
                <p className="text-center text-[10px] text-white/40 mt-2 font-mono">
                  Entrega esperada: {activeMission.deliveryLabel}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ========== TEAM DASHBOARD & QUEST LIST VIEW ==========
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <header className="border-b border-white/10 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/campus"
            className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 transition-all"
          >
            ← Voltar ao Campus Virtual
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{team.icon}</span>
            <span className="font-extrabold text-sm text-[#10b981]">{team.shortName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header Card */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#111827] to-[#0f172a] p-8 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-3 rounded-2xl bg-white/5 border border-white/10">{team.icon}</span>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981]">
                Portal de Equipe
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">{team.name}</h1>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{team.mission}</p>

          {/* Progress Bar */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between mb-2 text-xs font-bold">
              <span className="text-white/60">Progresso Geral da Equipe:</span>
              <span className="text-[#10b981] font-mono">
                {completedCount}/{totalMissions} Quests · {percent}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{progress?.xp || 0}</div>
              <div className="text-[10px] text-white/50 font-bold uppercase">Total XP</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl font-black text-white">
                {completedCount}/{totalMissions}
              </div>
              <div className="text-[10px] text-white/50 font-bold uppercase">Quests</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl font-black text-[#10b981]">
                {progress?.badges.length || 0}
              </div>
              <div className="text-[10px] text-white/50 font-bold uppercase">Relíquias</div>
            </div>
          </div>
        </div>

        {/* Quests List */}
        <div>
          <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
            <span>🗡️</span> Quests da Missão
          </h2>
          <div className="space-y-3">
            {team.missions.map((mission, index) => {
              const unlocked = isMissionUnlocked(mission, index);
              const completed = isMissionCompleted(mission.id);

              return (
                <button
                  key={mission.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && handleStartMission(mission)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    completed
                      ? "bg-[#10b981]/15 border-[#10b981]/40"
                      : unlocked
                      ? "bg-[#111827] border-white/15 hover:border-[#10b981]/60 hover:shadow-xl cursor-pointer"
                      : "bg-[#0b0f17] border-white/5 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                        completed
                          ? "bg-[#10b981] text-black"
                          : unlocked
                          ? "bg-white/10 text-[#10b981] border border-[#10b981]/40"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {completed ? "✓" : unlocked ? mission.number : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-white">{mission.title}</h3>
                        {completed && (
                          <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full font-bold border border-[#10b981]/30">
                            Concluída
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1">{mission.description}</p>
                      {unlocked && !completed && (
                        <p className="text-[11px] mt-2 font-bold text-[#10b981]">
                          +{mission.xpReward} XP · {mission.deliveryLabel}
                        </p>
                      )}
                      {completed && (
                        <p className="text-[10px] mt-2 text-white/40">
                          Clique para revisar entregas registradas
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Relíquias */}
        {progress && progress.badges.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 space-y-3">
            <h2 className="text-sm font-extrabold text-white">🏆 Relíquias Conquistadas:</h2>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((badge) => (
                <div
                  key={badge}
                  className="px-3.5 py-2 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <span>🏅</span>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
