"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeam } from "@/data/teams";
import { getTeamProgress, completeMission } from "@/lib/progress";
import { Team, TeamProgress, Mission } from "@/types";

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
    const p = getTeamProgress(team.slug);
    setProgress(p);
  }, [team]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Equipe não encontrada</h1>
          <Link href="/" className="text-emerald-400 hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

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

    // Simple validation
    const requiredFields = activeMission.fields.filter((f) => f.required);
    for (const field of requiredFields) {
      const val = answers[field.id];
      if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === "string" && !val.trim())) {
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

  // Mission detail view
  if (activeMission) {
    return (
      <div className="min-h-screen bg-slate-950">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleCloseMission}
              className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
            >
              ← Voltar
            </button>
            <div className="text-sm font-medium" style={{ color: team.color }}>
              {team.icon} {team.shortName}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {showSuccess ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Missão concluída!</h2>
              <p className="text-slate-400 mb-2">
                +{activeMission.xpReward} XP
              </p>
              {activeMission.badge && (
                <p className="text-amber-400 font-medium mb-6">
                  Badge desbloqueada: {activeMission.badge}
                </p>
              )}
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                A entrega <strong>{activeMission.deliveryLabel}</strong> foi registrada e será usada no aplicativo final.
              </p>
              <button
                onClick={handleCloseMission}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: team.color }}
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-sm font-mono text-slate-500 mb-2">
                  MISSÃO {activeMission.number}
                </div>
                <h1 className="text-3xl font-bold mb-3">{activeMission.title}</h1>
                <p className="text-slate-400">{activeMission.description}</p>
              </div>

              {/* Context */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Contexto
                </h3>
                <p className="text-slate-200">{activeMission.context}</p>
              </div>

              {/* Challenge */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Desafio
                </h3>
                <p className="text-slate-200">{activeMission.challenge}</p>
              </div>

              {/* Form fields */}
              <div className="space-y-6 mb-10">
                {activeMission.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                      />
                    )}

                    {field.type === "radio" && field.options && (
                      <div className="space-y-2">
                        {field.options.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors"
                          >
                            <input
                              type="radio"
                              name={field.id}
                              checked={answers[field.id] === opt}
                              onChange={() => handleFieldChange(field.id, opt)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{opt}</span>
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
                              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors"
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
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.help && (
                      <p className="text-xs text-slate-500 mt-1">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 py-4 -mx-4 px-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl font-bold text-white text-lg transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: team.color }}
                >
                  Enviar entrega · +{activeMission.xpReward} XP
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  Entrega: {activeMission.deliveryLabel}
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Team dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
            ← Todas as equipes
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{team.icon}</span>
            <span className="font-bold">{team.shortName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Team header */}
        <div className="mb-10">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: `${team.color}22`, color: team.color }}
          >
            Sua equipe
          </div>
          <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
          <p className="text-slate-400 text-lg mb-6">{team.mission}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold" style={{ color: team.color }}>
                {progress?.xp || 0}
              </div>
              <div className="text-xs text-slate-400">XP</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-white">
                {progress?.completedMissions.length || 0}/{team.missions.length}
              </div>
              <div className="text-xs text-slate-400">Missões</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-amber-400">
                {progress?.badges.length || 0}
              </div>
              <div className="text-xs text-slate-400">Badges</div>
            </div>
          </div>
        </div>

        {/* Missions list */}
        <div>
          <h2 className="text-lg font-bold mb-4">Missões</h2>
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
                      ? "bg-slate-800/40 border-emerald-500/40"
                      : unlocked
                      ? "bg-slate-800/60 border-slate-600 hover:border-slate-400 cursor-pointer"
                      : "bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : unlocked
                          ? "bg-slate-700 text-white"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {completed ? "✓" : unlocked ? mission.number : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{mission.title}</h3>
                        {completed && (
                          <span className="text-xs text-emerald-400 font-medium">Concluída</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1">
                        {mission.description}
                      </p>
                      {unlocked && !completed && (
                        <p className="text-xs mt-2 font-medium" style={{ color: team.color }}>
                          +{mission.xpReward} XP · {mission.deliveryLabel}
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
            <h2 className="text-lg font-bold mb-4">Badges conquistadas</h2>
            <div className="flex flex-wrap gap-3">
              {progress.badges.map((badge) => (
                <div
                  key={badge}
                  className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium"
                >
                  🏅 {badge}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
