export type PresenceStatus = "listening" | "muted" | "focused" | "away";

export interface RoomPresence {
  studentId: string;
  name: string;
  teamSlug?: string;
  status: PresenceStatus;
  roomId: string;
  lastSeen: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  studentId: string;
  name: string;
  text: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<PresenceStatus, string> = {
  listening: "Ouvindo",
  muted: "Mutado",
  focused: "Focado",
  away: "Ausente",
};

export const STATUS_COLORS: Record<PresenceStatus, string> = {
  listening: "#22c55e",
  muted: "#eab308",
  focused: "#3b82f6",
  away: "#94a3b8",
};
