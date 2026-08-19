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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-[#1C1C1C]">Portal não encontrado</h1>
          <Link href="/mapa" className="text-[#315F4C] hover:underline">
            Voltar ao mapa
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
        alert(`Por favor, preencha: ${field.label}`);
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

  // ========== MISSION DETAIL ==========
  if (activeMission) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <header className="border-b border-[#EDE7DC] bg-white/90 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <button
              onClick={handleCloseMission}
              className="text-[#1C1C1C]/50 hover:text-[#1C1C1C] flex items-center gap-2 text-sm"
            >
              ← Voltar às quests
            </button>
            <div className="text-sm font-medium text-[#315F4C]">
              {team.icon} {team.shortName}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-5 py-8">
          {showSuccess ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E8F6F0] flex items-center justify-center text-4xl">
                ✓
              </div>
              <h2 className="text-3xl font-semibold text-[#1C1C1C] mb-2">Quest concluída!</h2>
              <p className="text-[#315F4C] font-medium mb-1">
                +{activeMission.xpReward} XP
              </p>
              {activeMission.badge && (
                <p className="text-[#1C1C1C]/60 mb-6">
                  Relíquia: <span className="font-medium text-[#315F4C]">{activeMission.badge}</span>
                </p>
              )}
              <p className="text-[#1C1C1C]/55 mb-8 max-w-md mx-auto">
                Entrega registrada: <strong>{activeMission.deliveryLabel}</strong>
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCloseMission}
                  className="px-6 py-3 rounded-xl font-medium text-white bg-[#315F4C] hover:bg-[#2a5240]"
                >
                  Próximas quests
                </button>
                <button
                  onClick={() => router.push("/mapa")}
                  className="px-6 py-3 rounded-xl font-medium border border-[#EDE7DC] text-[#1C1C1C]"
                >
                  Voltar ao mapa
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-xs font-medium text-[#315F4C] uppercase tracking-wider mb-2">
                  Quest {activeMission.number} de {totalMissions}
                </div>
                <h1 className="text-3xl font-semibold text-[#1C1C1C] mb-3">
                  {activeMission.title}
                </h1>
                <p className="text-[#1C1C1C]/60">{activeMission.description}</p>
              </div>

              <div className="bg-white border border-[#EDE7DC] rounded-2xl p-5 mb-5">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[#1C1C1C]/40 mb-2">
                  Contexto
                </h3>
                <p className="text-[#1C1C1C]/80 leading-relaxed">{activeMission.context}</p>
              </div>

              <div className="bg-[#E8F6F0] border border-[#315F4C]/15 rounded-2xl p-5 mb-8">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[#315F4C] mb-2">
                  Desafio
                </h3>
                <p className="text-[#1C1C1C]/80 leading-relaxed">{activeMission.challenge}</p>
              </div>

              <div className="space-y-6 mb-10">
                {activeMission.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-white border border-[#EDE7DC] rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-[#1C1C1C]/30 focus:outline-none focus:ring-2 focus:ring-[#315F4C]/30"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-white border border-[#EDE7DC] rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-[#1C1C1C]/30 focus:outline-none focus:ring-2 focus:ring-[#315F4C]/30 resize-y"
                      />
                    )}

                    {field.type === "radio" && field.options && (
                      <div className="space-y-2">
                        {field.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                              answers[field.id] === opt
                                ? "bg-[#E8F6F0] border-[#315F4C]/40"
                                : "bg-white border-[#EDE7DC] hover:border-[#315F4C]/25"
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.id}
                              checked={answers[field.id] === opt}
                              onChange={() => handleFieldChange(field.id, opt)}
                              className="w-4 h-4 accent-[#315F4C]"
                            />
                            <span className="text-sm text-[#1C1C1C]">{opt}</span>
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
                              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                                checked
                                  ? "bg-[#E8F6F0] border-[#315F4C]/40"
                                  : "bg-white border-[#EDE7DC] hover:border-[#315F4C]/25"
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
                                className="w-4 h-4 accent-[#315F4C]"
                              />
                              <span className="text-sm text-[#1C1C1C]">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-[#FAF7F2]/95 backdrop-blur border-t border-[#EDE7DC] py-4 -mx-5 px-5">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl font-semibold text-white text-base bg-[#315F4C] hover:bg-[#2a5240] transition-colors"
                >
                  Concluir quest · +{activeMission.xpReward} XP
                </button>
                <p className="text-center text-xs text-[#1C1C1C]/40 mt-2">
                  Entrega: {activeMission.deliveryLabel}
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ========== TEAM DASHBOARD / QUEST LIST ==========
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#EDE7DC] bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/mapa"
            className="text-[#1C1C1C]/50 hover:text-[#1C1C1C] text-sm flex items-center gap-1"
          >
            ← Voltar ao mapa
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{team.icon}</span>
            <span className="font-semibold text-[#1C1C1C]">{team.shortName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 bg-[#E8F6F0] text-[#315F4C]">
            Portal da equipe
          </div>
          <h1 className="text-3xl font-semibold text-[#1C1C1C] mb-2">{team.name}</h1>
          <p className="text-[#1C1C1C]/60 text-lg mb-6 leading-relaxed">{team.mission}</p>

          {/* Progress */}
          <div className="bg-white border border-[#EDE7DC] rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#1C1C1C]">Progresso das quests</span>
              <span className="text-sm font-semibold text-[#315F4C]">
                {completedCount}/{totalMissions} · {percent}%
              </span>
            </div>
            <div className="h-3 bg-[#EDE7DC] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: percent === 100 ? "#39FF14" : "#315F4C",
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-[#EDE7DC] rounded-xl px-5 py-3">
              <div className="text-2xl font-semibold text-[#315F4C]">{progress?.xp || 0}</div>
              <div className="text-xs text-[#1C1C1C]/45">XP</div>
            </div>
            <div className="bg-white border border-[#EDE7DC] rounded-xl px-5 py-3">
              <div className="text-2xl font-semibold text-[#1C1C1C]">
                {completedCount}/{totalMissions}
              </div>
              <div className="text-xs text-[#1C1C1C]/45">Quests</div>
            </div>
            <div className="bg-white border border-[#EDE7DC] rounded-xl px-5 py-3">
              <div className="text-2xl font-semibold text-[#315F4C]">
                {progress?.badges.length || 0}
              </div>
              <div className="text-xs text-[#1C1C1C]/45">Relíquias</div>
            </div>
          </div>
        </div>

        {/* Quest list */}
        <div>
          <h2 className="text-lg font-semibold text-[#1C1C1C] mb-4">Quests disponíveis</h2>
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
                      ? "bg-[#E8F6F0] border-[#315F4C]/25"
                      : unlocked
                      ? "bg-white border-[#EDE7DC] hover:border-[#315F4C]/40 hover:shadow-md cursor-pointer"
                      : "bg-[#FAF7F2] border-[#EDE7DC]/60 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 ${
                        completed
                          ? "bg-[#315F4C] text-white"
                          : unlocked
                          ? "bg-[#E8F6F0] text-[#315F4C]"
                          : "bg-[#EDE7DC] text-[#1C1C1C]/30"
                      }`}
                    >
                      {completed ? "✓" : unlocked ? mission.number : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1C1C1C]">{mission.title}</h3>
                        {completed && (
                          <span className="text-xs text-[#315F4C] font-medium">Concluída</span>
                        )}
                      </div>
                      <p className="text-sm text-[#1C1C1C]/50 line-clamp-1">
                        {mission.description}
                      </p>
                      {unlocked && !completed && (
                        <p className="text-xs mt-2 font-medium text-[#315F4C]">
                          +{mission.xpReward} XP · {mission.deliveryLabel}
                        </p>
                      )}
                      {completed && (
                        <p className="text-xs mt-2 text-[#1C1C1C]/40">
                          Clique para revisar respostas
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        {progress && progress.badges.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#1C1C1C] mb-4">Relíquias conquistadas</h2>
            <div className="flex flex-wrap gap-3">
              {progress.badges.map((badge) => (
                <div
                  key={badge}
                  className="px-4 py-2 rounded-full bg-[#E8F6F0] border border-[#315F4C]/20 text-[#315F4C] text-sm font-medium"
                >
                  🏅 {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {percent === 100 && (
          <div className="mt-10 bg-[#E8F6F0] border border-[#315F4C]/20 rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold text-[#315F4C] mb-1">
              Território 100% restaurado!
            </p>
            <p className="text-sm text-[#1C1C1C]/60">
              Todas as quests desta equipe foram concluídas.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
