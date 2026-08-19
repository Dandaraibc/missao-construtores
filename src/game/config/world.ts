export type AudioZoneMode = "PROXIMITY" | "ROOM" | "PRIVATE_ROOM" | "DISABLED";

export interface WorldZone {
  id: string;
  kind: "VISUAL" | "AUDIO" | "INTERACTION" | "MEETING" | "GAME";
  x: number;
  y: number;
  width: number;
  height: number;
  mode?: AudioZoneMode;
  radius?: number;
  roomId?: string;
  closed?: boolean;
}

export const CAMPUS_ZONES: WorldZone[] = [
  { id: "central-meeting", kind: "MEETING", x: 760, y: 180, width: 520, height: 360, roomId: "central-meeting", mode: "PROXIMITY" },
  { id: "design-audio", kind: "AUDIO", x: 80, y: 100, width: 420, height: 300, roomId: "design", mode: "PROXIMITY" },
  { id: "game-field", kind: "GAME", x: 560, y: 640, width: 520, height: 260 },
];

export function getAudioMix(distance: number, maxDistance = 5) {
  if (distance >= maxDistance) return 0;
  if (distance <= 2) return 1;
  return 1 - (distance - 2) / (maxDistance - 2);
}
