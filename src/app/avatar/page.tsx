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
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [config, setConfig] = useState<AvatarConfig>({
    skinTone: "medium",
    hairStyle: "straight-short",
    outfit: "uniform",
    accessory: "none",
    name: "",
  });

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const team = selectedStudent
    ? teams.find((t) => t.slug === selectedStudent.teamSlug)
    : null;

  const update = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find((s) => s.id === id);
    if (student) {
      setConfig((prev) => ({ ...prev, name: student.name }));
    }
  };

  const handleContinue = () => {
    if (!selectedStudentId || !selectedStudent) {
      alert("Selecione seu nome na lista (o professor precisa ter cadastrado você)");
      return;
    }
    const payload = {
      ...config,
      name: selectedStudent.name,
      studentId: selectedStudent.id,
      teamSlug: selectedStudent.teamSlug,
    };
    localStorage.setItem("missao-avatar", JSON.stringify(payload));
    router.push("/mapa");
  };

  const skinColor = SKIN_TONES.find((s) => s.id === config.skinTone)?.color || "#C68642";

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#EDE7DC] bg-white">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <h1 className="font-semibold text-[#1C1C1C]">Crie seu avatar</h1>
          <p className="text-sm text-[#1C1C1C]/50">Colégio 24 de Maio · Missão Construtores</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {students.length === 0 ? (
          <div className="bg-white border border-[#EDE7DC] rounded-2xl p-8 text-center">
            <p className="text-[#1C1C1C]/70 mb-2">
              Nenhum aluno cadastrado ainda.
            </p>
            <p className="text-sm text-[#1C1C1C]/50">
              Peça para o professor cadastrar a turma no painel{" "}
              <code className="bg-[#EDE7DC] px-1 rounded">/admin</code>
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {/* Preview */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-64 bg-white border-2 border-[#EDE7DC] rounded-2xl flex flex-col items-center justify-end relative overflow-hidden shadow-sm">
                <div
                  className="absolute top-8 w-20 h-20 rounded-full"
                  style={{ backgroundColor: skinColor }}
                />
                {config.hairStyle !== "bald" && (
                  <div
                    className="absolute top-4 w-24 h-10 rounded-t-full"
                    style={{
                      backgroundColor:
                        config.hairStyle === "afro" || config.hairStyle === "curly"
                          ? "#2C1810"
                          : "#1A1A1A",
                    }}
                  />
                )}
                <div
                  className="w-28 h-32 rounded-t-xl mb-0 flex items-center justify-center"
                  style={{
                    backgroundColor: config.outfit === "uniform" ? "#3B2C7D" : "#315F4C",
                  }}
                >
                  {config.outfit === "uniform" && (
                    <div className="text-yellow-300 text-[10px] font-bold text-center leading-tight">
                      24
                      <br />
                      DE MAIO
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-[#1C1C1C]/60 text-center">Prévia do avatar</p>
              {team && (
                <p className="mt-2 text-sm font-medium text-[#315F4C]">
                  {team.icon} Equipe: {team.name}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Select student */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                  Selecione seu nome
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full bg-white border border-[#EDE7DC] rounded-xl px-4 py-3 text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#315F4C]/30"
                >
                  <option value="">— Escolha seu nome —</option>
                  {students.map((s) => {
                    const t = teams.find((tm) => tm.slug === s.teamSlug);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({t?.shortName || s.teamSlug})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Skin */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Tom de pele</label>
                <div className="flex gap-3">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => update("skinTone", tone.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        config.skinTone === tone.id
                          ? "border-[#315F4C] scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: tone.color }}
                      title={tone.label}
                    />
                  ))}
                </div>
              </div>

              {/* Hair */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Cabelo</label>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_STYLES.map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => update("hairStyle", hair.id)}
                      className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                        config.hairStyle === hair.id
                          ? "bg-[#E8F6F0] border-[#315F4C] text-[#315F4C]"
                          : "bg-white border-[#EDE7DC] text-[#1C1C1C]"
                      }`}
                    >
                      {hair.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Roupa</label>
                <div className="space-y-2">
                  {OUTFITS.map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => update("outfit", outfit.id)}
                      className={`w-full px-4 py-3 rounded-xl text-sm border text-left transition-colors ${
                        config.outfit === outfit.id
                          ? "bg-[#E8F6F0] border-[#315F4C] text-[#315F4C]"
                          : "bg-white border-[#EDE7DC] text-[#1C1C1C]"
                      }`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Acessório</label>
                <div className="flex gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => update("accessory", acc.id)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        config.accessory === acc.id
                          ? "bg-[#E8F6F0] border-[#315F4C] text-[#315F4C]"
                          : "bg-white border-[#EDE7DC] text-[#1C1C1C]"
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedStudentId}
                className="w-full py-4 rounded-xl font-semibold text-white bg-[#315F4C] hover:bg-[#2a5240] transition-colors mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Entrar no mapa →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
