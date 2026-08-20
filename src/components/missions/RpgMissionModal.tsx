"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  teamSlug?: string;
}

export default function RpgMissionModal({ onClose, teamSlug = "pesquisa" }: Props) {
  const [step, setStep] = useState<"story" | "choice" | "submission" | "completed">("story");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [deliverableText, setDeliverableText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (!deliverableText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("completed");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-purple-500/40 bg-[#182333]/90 p-6 text-white shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-400 font-bold text-sm">
              RPG
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Modo RPG 2D - Missão da Equipe {teamSlug.toUpperCase()}</h2>
              <p className="text-xs text-purple-300">Desafio Carbono Zero - Feira de Ciências Colégio 24 de Maio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20 transition-all font-semibold"
          >
            Fechar
          </button>
        </div>

        {/* Step 1: Story & Context */}
        {step === "story" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 leading-relaxed text-sm">
              <h3 className="font-bold text-purple-300 mb-2">Capítulo 1: O Desafio da Pegada de Carbono</h3>
              <p className="text-white/90">
                Sua equipe precisa definir como o aplicativo da feira irá calcular a economia de carbono gerada pelo transporte dos alunos.
                O tempo é curto e a comissão avaliadora da Ubongo aguarda o relatório de especificação inicial.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Recompensa XP:</span>
                <span className="font-bold text-amber-400">+250 XP</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Supervisão:</span>
                <span className="font-bold text-emerald-400">Prof. Niltes & Prof. Diego</span>
              </div>
            </div>

            <button
              onClick={() => setStep("choice")}
              className="w-full rounded-2xl bg-purple-600 py-3.5 font-extrabold text-white hover:bg-purple-500 transition-all shadow-lg active:scale-95 text-sm"
            >
              Avançar para Decisão da Equipe
            </button>
          </div>
        )}

        {/* Step 2: Decision Tree */}
        {step === "choice" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-purple-300">Escolha a Decisão Técnica da Sua Equipe:</h3>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedChoice("A")}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedChoice === "A"
                    ? "border-purple-400 bg-purple-600/30 shadow-lg"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="font-bold text-sm text-purple-200">Opção A: Calculadora baseada em KM percorrido</div>
                <div className="text-xs text-white/70 mt-1">
                  Os alunos inserem a distância da escola e o meio de transporte (ônibus, bike, caminhada).
                </div>
              </button>

              <button
                onClick={() => setSelectedChoice("B")}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedChoice === "B"
                    ? "border-purple-400 bg-purple-600/30 shadow-lg"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="font-bold text-sm text-purple-200">Opção B: Gamificação por Check-in diário sustentável</div>
                <div className="text-xs text-white/70 mt-1">
                  Os alunos acumulam moedas virtuais ao confirmar hábitos ecológicos diariamente.
                </div>
              </button>
            </div>

            <button
              disabled={!selectedChoice}
              onClick={() => setStep("submission")}
              className="w-full rounded-2xl bg-purple-600 py-3.5 font-extrabold text-white hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg text-sm"
            >
              Confirmar Escolha e Preparar Entrega
            </button>
          </div>
        )}

        {/* Step 3: Submission & Deliverable */}
        {step === "submission" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-purple-300">Redigir Entregável da Missão:</h3>

            <div>
              <label className="text-xs text-white/60 font-bold block mb-1">
                Descrição e Justificativa da Entrega:
              </label>
              <textarea
                rows={4}
                value={deliverableText}
                onChange={(e) => setDeliverableText(e.target.value)}
                placeholder="Descreva aqui o documento de especificação produzido pela equipe..."
                className="w-full rounded-2xl border border-white/20 bg-black/30 p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs text-white/60 font-bold block mb-1">
                Anexar Arquivo de Evidência (PDF, PNG, ZIP):
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/20 p-3">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                >
                  Selecionar Arquivo
                </label>
                <span className="text-xs text-white/60 font-mono">
                  {fileName || "Nenhum arquivo selecionado"}
                </span>
              </div>
            </div>

            <button
              disabled={!deliverableText.trim() || isSubmitting}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-emerald-600 py-3.5 font-extrabold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Enviando para Ubongo..." : "Submeter Entregável para Aprovação"}
            </button>
          </div>
        )}

        {/* Step 4: Mission Completed */}
        {step === "completed" && (
          <div className="text-center py-6 space-y-4">
            <h3 className="text-2xl font-extrabold text-emerald-400">Entregável Submetido com Sucesso</h3>
            <p className="text-xs text-white/70 max-w-md mx-auto">
              Sua entrega foi enviada para o painel de revisão dos Professores e da comissão da Ubongo.
              Você recebeu <span className="text-amber-400 font-bold">+250 XP</span> para sua equipe!
            </p>
            <button
              onClick={onClose}
              className="rounded-2xl bg-[#8ee85f] px-8 py-3 font-extrabold text-[#10160e] hover:bg-[#a6f07b] transition-all text-sm shadow-xl"
            >
              Concluir e Voltar ao Office
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
