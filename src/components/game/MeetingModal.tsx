"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  userRole?: string;
  displayName?: string;
}

export default function MeetingModal({ onClose, userRole = "STUDENT", displayName = "Visitante" }: Props) {
  const [meetingUrl, setMeetingUrl] = useState("https://meet.jit.si/MissaoConstrutoresCentral");
  const [isClosed, setIsClosed] = useState(false);
  const [agenda, setAgenda] = useState("Reunião Geral da Feira Carbono Zero — Alinhamento de Entregáveis");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-emerald-500/50 bg-[#182333] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="font-bold text-lg">Sala de Reunião Central</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-xs hover:bg-white/20 transition-all"
          >
            ✖ Fechar
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex justify-between items-center rounded-2xl bg-white/5 p-3">
            <div>
              <span className="text-white/50 block">Status da Sala:</span>
              <span className={`font-bold ${isClosed ? "text-amber-400" : "text-emerald-400"}`}>
                {isClosed ? "🔒 Sala Fechada (Privada)" : "🌐 Sala Aberta (Pública)"}
              </span>
            </div>
            {userRole !== "STUDENT" && (
              <button
                onClick={() => setIsClosed((prev) => !prev)}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
              >
                {isClosed ? "Abrir Sala" : "Fechar Sala"}
              </button>
            )}
          </div>

          {/* Agenda */}
          <div>
            <label className="text-white/50 font-bold block mb-1">Pauta / Agenda da Reunião:</label>
            <input
              type="text"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/30 p-2.5 text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* External Video Meeting Link */}
          <div>
            <label className="text-white/50 font-bold block mb-1">Link da Reunião Externa (Meet / Zoom / Jitsi):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="flex-1 rounded-xl border border-white/20 bg-black/30 p-2.5 text-white focus:outline-none focus:border-emerald-400 font-mono text-[11px]"
              />
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 font-extrabold text-white hover:bg-emerald-500 flex items-center gap-1 shadow-lg"
              >
                <span>Entrar</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Participant List */}
          <div>
            <label className="text-white/50 font-bold block mb-2">Participantes na Mesa (6 Lugares):</label>
            <div className="space-y-1.5 rounded-xl bg-black/20 p-2.5 border border-white/5">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>👤 {displayName} (Você)</span>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">Membro</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>👤 Prof. Niltes</span>
                <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40">Professora</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>👤 Prietto</span>
                <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-500/40">Ubongo Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-white/10 py-2.5 font-bold hover:bg-white/20 transition-all text-xs"
          >
            Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
