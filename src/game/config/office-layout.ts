export type OfficeRoomKind = "TEAM" | "CENTRAL_MEETING" | "SOCIAL" | "GAMES" | "BONGO";

export interface OfficeSeat { id: string; x: number; y: number; status: "FREE" | "OCCUPIED" | "RESERVED"; }
export interface OfficeRoom { id: string; label: string; kind: OfficeRoomKind; teamSlug?: string; x: number; y: number; width: number; height: number; seats: OfficeSeat[]; }

const seats = (prefix: string, startX: number, startY: number, count: number): OfficeSeat[] => Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index + 1}`, x: startX + (index % 3) * 80, y: startY + Math.floor(index / 3) * 80, status: "FREE" }));

export const OFFICE_ROOMS: OfficeRoom[] = [
  { id: "team-research", label: "Sala das Descobertas", kind: "TEAM", teamSlug: "pesquisa", x: 80, y: 90, width: 480, height: 330, seats: seats("research-seat", 180, 260, 6) },
  { id: "team-product", label: "Sala das Ideias", kind: "TEAM", teamSlug: "produto", x: 620, y: 90, width: 500, height: 330, seats: seats("product-seat", 700, 260, 6) },
  { id: "team-design", label: "Sala Criativa", kind: "TEAM", teamSlug: "design", x: 80, y: 620, width: 480, height: 300, seats: seats("design-seat", 180, 790, 6) },
  { id: "team-quality", label: "Sala dos Guardiões", kind: "TEAM", teamSlug: "testes", x: 620, y: 620, width: 500, height: 300, seats: seats("quality-seat", 700, 790, 6) },
  { id: "team-story", label: "Sala da História", kind: "TEAM", teamSlug: "comunicacao", x: 1180, y: 620, width: 480, height: 300, seats: seats("story-seat", 1260, 790, 6) },
  { id: "central-meeting", label: "Sala de Reunião Central", kind: "CENTRAL_MEETING", x: 1180, y: 90, width: 480, height: 400, seats: seats("central-seat", 1240, 230, 22) },
  { id: "bongo-office", label: "Sala do Bongo", kind: "BONGO", x: 620, y: 450, width: 500, height: 130, seats: seats("bongo-seat", 700, 500, 3) },
  { id: "games", label: "Salão de Jogos", kind: "GAMES", x: 80, y: 450, width: 480, height: 130, seats: [] },
];

export const OFFICE_INTERACTABLES = {
  football: { id: "football-court", type: "FOOTBALL", x: 300, y: 510, width: 220, height: 90 },
  pingPong: { id: "ping-pong-table", type: "PING_PONG", x: 220, y: 470, width: 160, height: 70 },
  coffee: { id: "coffee-machine", type: "COFFEE_MACHINE", x: 1510, y: 540, width: 50, height: 50 },
};
