"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AvatarConfig,
  SKIN_TONES,
  HAIR_STYLES,
  OUTFITS,
  ACCESSORIES,
} from "@/types/avatar";
import { getStudents, Student } from "@/lib/students";
import { teams } from "@/data/teams";

export default function AvatarPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; teamId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState<AvatarConfig>({
    skinTone: "medium",
    hairStyle: "straight-short",
    outfit: "uniform",
    accessory: "none",
    name: "",
  });

  useEffect(() => {
    // Busca usuário real e perfil
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Não autenticado");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setConfig((prev) => ({ ...prev, name: data.user.name }));
          return fetch("/api/profile");
        }
        throw new Error("Não autenticado");
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setConfig({
            skinTone: data.profile.skinTone || "medium",
            hairStyle: data.profile.hair || "straight-short",
            outfit: data.profile.shirt || "uniform",
            accessory: data.profile.accessory || "none",
            name: user?.name || config.name,
          });
        }
      })
      .catch(() => {
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [router, user?.name, config.name]);

  const update = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinTone: config.skinTone,
          hair: config.hairStyle,
          shirt: config.outfit,
          accessory: config.accessory,
        }),
      });
      router.push("/campus");
    } catch (e) {
      alert("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const skinColor = SKIN_TONES.find((s) => s.id === config.skinTone)?.color || "#C68642";
  const team = user ? teams.find((t) => t.slug === user.teamId) : null;

  if (loading) return <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center font-mono text-[#10b981]">Carregando provador...</div>;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <header className="border-b border-white/10 bg-[#111827]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-lg text-white">Criar & Customizar Avatar</h1>
            <p className="text-xs text-white/50">Colégio 24 de Maio · Missão Construtores Ubongo</p>
          </div>
          <button
            onClick={() => router.push("/campus")}
            className="text-xs text-white/60 hover:text-white font-bold"
          >
            ← Pular para o Campus
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!user ? (
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <p className="text-white/70 text-sm">
              Nenhum aluno cadastrado ainda na turma.
            </p>
            <p className="text-xs text-white/50">
              Solicite ao professor o cadastro no painel{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-[#10b981]">/admin</code>
            </p>
            <button
              onClick={() => {
                const guestUser = { id: "guest-" + Date.now(), name: "Visitante Feira", role: "VISITOR", teamId: "pesquisa" };
                localStorage.setItem("missao-user", JSON.stringify(guestUser));
                router.push("/campus");
              }}
              className="px-6 py-3 rounded-xl bg-[#10b981] text-black font-extrabold text-xs uppercase"
            >
              Entrar como Visitante no Campus ➔
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Preview Card */}
            <div className="flex flex-col items-center rounded-3xl border border-white/15 bg-[#111827] p-8 shadow-2xl space-y-4">
              <div className="w-52 h-64 bg-black/40 border-2 border-white/10 rounded-2xl flex flex-col items-center justify-end relative overflow-hidden shadow-inner">
                <div
                  className="absolute top-8 w-20 h-20 rounded-full shadow-lg"
                  style={{ backgroundColor: skinColor }}
                />
                {config.hairStyle !== "bald" && (
                  <div
                    className="absolute top-4 w-24 h-10 rounded-t-full shadow-md"
                    style={{
                      backgroundColor:
                        config.hairStyle === "afro" || config.hairStyle === "curly"
                          ? "#2C1810"
                          : "#1A1A1A",
                    }}
                  />
                )}
                <div
                  className="w-28 h-32 rounded-t-2xl mb-0 flex items-center justify-center border-t border-white/20 shadow-lg"
                  style={{
                    backgroundColor: config.outfit === "uniform" ? "#3B2C7D" : "#10b981",
                  }}
                >
                  {config.outfit === "uniform" && (
                    <div className="text-amber-300 text-[10px] font-black text-center leading-tight">
                      24 DE MAIO
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Prévia do Personagem
                </p>
                <h3 className="font-black text-lg text-white mt-1">
                  {config.name || "Seu Nome"}
                </h3>
                {team && (
                  <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]">
                    {team.icon} Equipe: {team.name}
                  </span>
                )}
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6 rounded-3xl border border-white/15 bg-[#111827] p-6 shadow-2xl">
              {/* Remove Select Student, just show current user info */}
              <div className="mb-4">
                <div className="text-xs font-bold text-white/50 mb-1">Identificação:</div>
                <div className="bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white">
                  {user?.name}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Tom de Pele:</label>
                <div className="flex gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => update("skinTone", tone.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        config.skinTone === tone.id
                          ? "border-[#10b981] scale-110 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: tone.color }}
                      title={tone.label}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Cabelo:</label>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_STYLES.map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => update("hairStyle", hair.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        config.hairStyle === hair.id
                          ? "bg-[#10b981]/20 border-[#10b981] text-[#10b981]"
                          : "bg-black/30 border-white/10 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {hair.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Roupa:</label>
                <div className="space-y-2">
                  {OUTFITS.map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => update("outfit", outfit.id)}
                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold border text-left transition-all ${
                        config.outfit === outfit.id
                          ? "bg-[#10b981]/20 border-[#10b981] text-[#10b981]"
                          : "bg-black/30 border-white/10 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">Acessório:</label>
                <div className="flex gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => update("accessory", acc.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        config.accessory === acc.id
                          ? "bg-[#10b981]/20 border-[#10b981] text-[#10b981]"
                          : "bg-black/30 border-white/10 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={saving}
                className="w-full py-4 rounded-xl font-extrabold text-black bg-[#10b981] hover:bg-[#34d399] transition-all uppercase tracking-wider text-xs shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {saving ? "Salvando..." : "Salvar & Entrar no Campus ➔"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
