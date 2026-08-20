"use client";

import { useState } from "react";
import LiveKitAudio from "./LiveKitAudio";

interface Props {
  onClose: () => void;
  userRole?: string;
  displayName?: string;
}

export default function MeetingModal({ onClose, userRole = "STUDENT", displayName = "Visitante" }: Props) {
  const [isClosed, setIsClosed] = useState(false);
  const [agenda, setAgenda] = useState("Reunião Geral da Feira Carbono Zero - Alinhamento de Entregáveis");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-500/40 bg-[#182333]/90 p-6 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h2 className="font-bold text-lg">Sala de Reunião Central (LiveKit)</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20 transition-all font-semibold"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex justify-between items-center rounded-2xl bg-white/5 p-3">
            <div>
              <span className="text-white/50 block">Status da Sala:</span>
              <span className={`font-bold ${isClosed ? "text-amber-400" : "text-emerald-400"}`}>
                {isClosed ? "Sala Fechada (Privada)" : "Sala Aberta (Pública)"}
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

          {/* LiveKit Video Meeting Link */}
          <div className="h-72 mt-4">
            <LiveKitAudio 
              roomName="ReuniaoCentral"
              identity={displayName.replace(/[^a-zA-Z0-9]/g, "") + "_" + Math.floor(Math.random()*1000)}
              displayName={displayName}
              isVideoEnabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
