"use client";

import { useEffect, useState } from "react";
// import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
// import "@livekit/components-styles";

interface Props {
  roomName: string;
  identity: string;
  displayName: string;
  isVideoEnabled?: boolean;
}

export default function LiveKitAudio({ roomName, identity, displayName, isVideoEnabled = false }: Props) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, identity, displayName }),
        });
        const data = await res.json();
        if (data.success) {
          setToken(data.token);
          setServerUrl(data.url);
        }
      } catch (e) {
        console.error("Erro ao obter token do LiveKit", e);
      }
    }
    void getToken();
  }, [roomName, identity, displayName]);

  if (!token) return <div className="text-xs text-white/50 animate-pulse">Conectando áudio...</div>;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/50 border border-white/10">
      <div className="p-4 text-center">
        <h3 className="font-bold text-emerald-400 mb-2">LiveKit Preparado</h3>
        <p className="text-xs text-white/70">
          Para ativar o WebRTC, instale as dependências executando: <br />
          <code className="bg-black/60 px-2 py-1 rounded text-amber-300 mt-2 block">
            npm install livekit-client @livekit/components-react
          </code>
        </p>
      </div>

      {/* 
        Para ativar o LiveKit completo (Áudio por Proximidade e Vídeo), descomente o bloco abaixo 
        e os imports no topo do arquivo após a instalação das dependências.
      */}

      {/* 
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={isVideoEnabled}
        audio={true}
      >
        {isVideoEnabled ? <VideoConference /> : <RoomAudioRenderer />}
      </LiveKitRoom> 
      */}
    </div>
  );
}
