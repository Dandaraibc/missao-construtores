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
      <div className="min-h-screen flex items-center justify-center bg-marfim text-carvao">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Equipe não encontrada</h1>
          <Link href="/" className="text-verde-escuro hover:underline">
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
      <div className="min-h-screen bg-marfim text-carvao">
        <header className="border-b border-argila bg-marfim/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleCloseMission}
              className="text-carvao/60 hover:text-verde-escuro flex items-center gap-2 text-sm transition-colors"
            >
              ← Voltar
            </button>
            <div className="text-sm font-bold text-verde-escuro flex items-center gap-1">
              {team.icon} {team.shortName}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {showSuccess ? (
            <div className="text-center py-16 bg-mint border border-argila rounded-2xl">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Missão concluída!</h2>
              <p className="text-verde-escuro font-bold mb-2">
                +{activeMission.xpReward} XP
              </p>
              {activeMission.badge && (
                <p className="text-verde-escuro font-bold mb-6">
                  Badge desbloqueada: {activeMission.badge}
                </p>
              )}
              <p className="text-carvao/80 mb-8 max-w-md mx-auto">
                A entrega <strong>{activeMission.deliveryLabel}</strong> foi registrada e será usada no aplicativo final.
              </p>
              <button
                onClick={handleCloseMission}
                className="px-6 py-3 rounded-xl font-semibold text-marfim bg-verde-escuro hover:bg-carvao transition-colors"
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-sm font-bold text-verde-escuro mb-2">
                  MISSÃO {activeMission.number}
                </div>
                <h1 className="text-3xl font-bold mb-3">{activeMission.title}</h1>
                <p className="text-carvao/70">{activeMission.description}</p>
              </div>

              {/* Context */}
              <div className="bg-mint border border-argila rounded-xl p-5 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-verde-escuro mb-2">
                  Contexto
                </h3>
                <p className="text-carvao">{activeMission.context}</p>
              </div>

              {/* Challenge */}
              <div className="bg-mint border border-argila rounded-xl p-5 mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-verde-escuro mb-2">
                  Desafio
                </h3>
                <p className="text-carvao">{activeMission.challenge}</p>
              </div>

              {/* Form fields */}
              <div className="space-y-6 mb-10">
                {activeMission.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold mb-2">
                      {field.label}
                      {field.required && <span className="text-verde-escuro ml-1">*</span>}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-marfim border border-argila rounded-xl px-4 py-3 text-carvao placeholder-carvao/40 focus:outline-none focus:ring-2 focus:ring-verde-escuro/50 focus:border-verde-escuro transition-colors"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-marfim border border-argila rounded-xl px-4 py-3 text-carvao placeholder-carvao/40 focus:outline-none focus:ring-2 focus:ring-verde-escuro/50 focus:border-verde-escuro resize-y transition-colors"
                      />
                    )}

                    {field.type === "radio" && field.options && (
                      <div className="space-y-2">
                        {field.options.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-3 p-3 rounded-xl bg-marfim border border-argila cursor-pointer hover:border-verde-escuro/50 transition-colors"
                          >
                            <input
                              type="radio"
                              name={field.id}
                              checked={answers[field.id] === opt}
                              onChange={() => handleFieldChange(field.id, opt)}
                              className="w-4 h-4 text-verde-escuro focus:ring-verde-escuro border-argila"
                            />
                            <span className="text-sm font-medium">{opt}</span>
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
                              className="flex items-center gap-3 p-3 rounded-xl bg-marfim border border-argila cursor-pointer hover:border-verde-escuro/50 transition-colors"
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
                                className="w-4 h-4 rounded text-verde-escuro focus:ring-verde-escuro border-argila"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.help && (
                      <p className="text-xs text-carvao/60 mt-1 font-medium">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="sticky bottom-0 bg-marfim/90 backdrop-blur border-t border-argila py-4 -mx-4 px-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl font-bold text-marfim text-lg bg-verde-escuro hover:bg-carvao transition-all active:scale-[0.98]"
                >
                  Enviar entrega · +{activeMission.xpReward} XP
                </button>
                <p className="text-center text-xs text-carvao/60 mt-2 font-medium">
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
    <div className="min-h-screen bg-marfim text-carvao">
      <header className="border-b border-argila bg-marfim/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-carvao/60 hover:text-verde-escuro text-sm flex items-center gap-1 font-medium transition-colors">
            ← Todas as equipes
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{team.icon}</span>
            <span className="font-bold text-verde-escuro">{team.shortName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Team header */}
        <div className="mb-10 bg-mint border border-argila rounded-2xl p-8">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 bg-verde-escuro/10 text-verde-escuro border border-verde-escuro/20"
          >
            Sua equipe
          </div>
          <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
          <p className="text-carvao/70 text-lg mb-6">{team.mission}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-marfim border border-argila rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-verde-escuro">
                {progress?.xp || 0}
              </div>
              <div className="text-xs font-semibold text-carvao/60">XP</div>
            </div>
            <div className="bg-marfim border border-argila rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-carvao">
                {progress?.completedMissions.length || 0}/{team.missions.length}
              </div>
              <div className="text-xs font-semibold text-carvao/60">Missões</div>
            </div>
            <div className="bg-marfim border border-argila rounded-xl px-5 py-3">
              <div className="text-2xl font-bold text-verde-escuro">
                {progress?.badges.length || 0}
              </div>
              <div className="text-xs font-semibold text-carvao/60">Badges</div>
            </div>
          </div>
        </div>

        {/* Missions list */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-carvao">Missões</h2>
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
                      ? "bg-mint border-verde-escuro/40 hover:border-verde-escuro"
                      : unlocked
                      ? "bg-marfim border-argila hover:border-verde-escuro/50 hover:shadow-sm cursor-pointer"
                      : "bg-marfim/50 border-argila opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        completed
                          ? "bg-verde-escuro text-marfim"
                          : unlocked
                          ? "bg-argila text-verde-escuro"
                          : "bg-argila text-carvao/30"
                      }`}
                    >
                      {completed ? "✓" : unlocked ? mission.number : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-carvao">{mission.title}</h3>
                        {completed && (
                          <span className="text-xs text-verde-escuro font-bold">Concluída</span>
                        )}
                      </div>
                      <p className="text-sm text-carvao/70 line-clamp-1">
                        {mission.description}
                      </p>
                      {unlocked && !completed && (
                        <p className="text-xs mt-2 font-bold text-verde-escuro">
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
            <h2 className="text-xl font-bold mb-4 text-carvao">Badges conquistadas</h2>
            <div className="flex flex-wrap gap-3">
              {progress.badges.map((badge) => (
                <div
                  key={badge}
                  className="px-4 py-2 rounded-full bg-verde-escuro/10 border border-verde-escuro/20 text-verde-escuro text-sm font-bold shadow-sm"
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
