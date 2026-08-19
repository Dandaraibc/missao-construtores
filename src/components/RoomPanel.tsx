"use client";

import { useEffect, useState, useRef } from "react";
import {
  getPresenceInRoom,
  setMyPresence,
  removeMyPresence,
  getChat,
  sendChatMessage,
  updateMyStatus,
} from "@/lib/rooms";
import {
  RoomPresence,
  ChatMessage,
  PresenceStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/types/room";

interface Props {
  roomId: string;
  roomName: string;
  studentId: string;
  studentName: string;
  teamSlug?: string;
  onClose: () => void;
  onEnterPortal?: () => void;
  hasPortal?: boolean;
}

export default function RoomPanel({
  roomId,
  roomName,
  studentId,
  studentName,
  teamSlug,
  onClose,
  onEnterPortal,
  hasPortal,
}: Props) {
  const [presence, setPresence] = useState<RoomPresence[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [myStatus, setMyStatus] = useState<PresenceStatus>("listening");
  const [micOn, setMicOn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Join room presence
  useEffect(() => {
    setMyPresence({
      studentId,
      name: studentName,
      teamSlug,
      status: myStatus,
      roomId,
    });

    const interval = setInterval(() => {
      setMyPresence({
        studentId,
        name: studentName,
        teamSlug,
        status: myStatus,
        roomId,
      });
      setPresence(getPresenceInRoom(roomId));
      setMessages(getChat(roomId));
    }, 1500);

    setPresence(getPresenceInRoom(roomId));
    setMessages(getChat(roomId));

    return () => {
      clearInterval(interval);
      removeMyPresence(studentId);
    };
  }, [roomId, studentId, studentName, teamSlug, myStatus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatus = (status: PresenceStatus) => {
    setMyStatus(status);
    updateMyStatus(studentId, status);
    if (status === "muted" || status === "focused") {
      setMicOn(false);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage(roomId, studentId, studentName, text);
    setText("");
    setMessages(getChat(roomId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-3">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#315F4C] text-white px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{roomName}</h2>
            <p className="text-xs text-white/70">{presence.length} pessoa(s) aqui</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-sm px-2"
          >
            Sair
          </button>
        </div>

        {/* Status + Mic */}
        <div className="px-4 py-3 border-b border-[#EDE7DC] flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[#1C1C1C]/50 mr-1">Status:</span>
          {(["listening", "muted", "focused"] as PresenceStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                myStatus === s
                  ? "border-transparent text-white"
                  : "border-[#EDE7DC] text-[#1C1C1C]"
              }`}
              style={{
                backgroundColor: myStatus === s ? STATUS_COLORS[s] : "transparent",
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                micOn
                  ? "bg-red-500 text-white"
                  : "bg-[#EDE7DC] text-[#1C1C1C]"
              }`}
            >
              {micOn ? "Mic ligado" : "Mic mudo"}
            </button>
          </div>
        </div>

        {/* Presence list */}
        <div className="px-4 py-2 border-b border-[#EDE7DC] flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {presence.map((p) => (
            <div
              key={p.studentId}
              className="flex items-center gap-1.5 text-xs bg-[#FAF7F2] rounded-full px-2.5 py-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[p.status] }}
              />
              <span className="font-medium text-[#1C1C1C]">{p.name}</span>
              <span className="text-[#1C1C1C]/40">{STATUS_LABELS[p.status]}</span>
            </div>
          ))}
          {presence.length === 0 && (
            <span className="text-xs text-[#1C1C1C]/40">Só você por enquanto</span>
          )}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[160px] max-h-[240px]">
          {messages.length === 0 && (
            <p className="text-xs text-[#1C1C1C]/40 text-center py-6">
              Nenhuma mensagem ainda. Diga oi!
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm ${
                m.studentId === studentId ? "text-right" : "text-left"
              }`}
            >
              <span className="text-[10px] text-[#1C1C1C]/40">{m.name}</span>
              <div
                className={`inline-block px-3 py-1.5 rounded-xl max-w-[80%] ${
                  m.studentId === studentId
                    ? "bg-[#315F4C] text-white"
                    : "bg-[#EDE7DC] text-[#1C1C1C]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#EDE7DC] flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-[#FAF7F2] border border-[#EDE7DC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#315F4C]/30"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-xl bg-[#315F4C] text-white text-sm font-medium"
          >
            Enviar
          </button>
        </div>

        {/* Portal button */}
        {hasPortal && onEnterPortal && (
          <div className="px-4 pb-4">
            <button
              onClick={onEnterPortal}
              className="w-full py-3 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#315F4C] font-semibold text-sm hover:bg-[#39FF14]/30 transition-colors"
            >
              Entrar no Portal das Missões →
            </button>
          </div>
        )}

        <p className="text-[10px] text-center text-[#1C1C1C]/30 pb-2">
          Voz real (Daily.co) será conectada em seguida · Mic ainda é simulado
        </p>
      </div>
    </div>
  );
}
