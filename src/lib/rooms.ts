import { RoomPresence, ChatMessage, PresenceStatus } from "@/types/room";

const PRESENCE_KEY = "missao-presence";
const CHAT_KEY = "missao-chat";

export function getPresence(): RoomPresence[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESENCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePresence(list: RoomPresence[]) {
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(list));
}

export function setMyPresence(data: Omit<RoomPresence, "lastSeen">) {
  const list = getPresence().filter((p) => p.studentId !== data.studentId);
  list.push({ ...data, lastSeen: new Date().toISOString() });
  const cutoff = Date.now() - 2 * 60 * 1000;
  const cleaned = list.filter((p) => new Date(p.lastSeen).getTime() > cutoff);
  savePresence(cleaned);
  return cleaned;
}

export function removeMyPresence(studentId: string) {
  const list = getPresence().filter((p) => p.studentId !== studentId);
  savePresence(list);
}

export function getPresenceInRoom(roomId: string): RoomPresence[] {
  const cutoff = Date.now() - 2 * 60 * 1000;
  return getPresence().filter(
    (p) => p.roomId === roomId && new Date(p.lastSeen).getTime() > cutoff
  );
}

export function getChat(roomId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
    return all
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-100);
  } catch {
    return [];
  }
}

export function fetchChatHistory(roomId: string): Promise<ChatMessage[]> {
  return fetch(`/api/chat?channel=${roomId}`)
    .then((res) => res.json())
    .then((data) => data.success ? data.data : []);
}

export async function sendChatMessage(
  roomId: string,
  studentId: string,
  name: string,
  text: string
): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    roomId,
    studentId,
    name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  // 1. Instant optimistic UI update
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("new_chat_message", { detail: msg }));
  }

  // 2. Persist to Postgres API
  try {
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: roomId, text: text.trim() }),
    });
  } catch (e) {
    console.error("Erro ao enviar mensagem", e);
  }

  return msg;
}

export function updateMyStatus(studentId: string, status: PresenceStatus) {
  const list = getPresence();
  const me = list.find((p) => p.studentId === studentId);
  if (me) {
    me.status = status;
    me.lastSeen = new Date().toISOString();
    savePresence(list);
  }
}
