import http from "node:http";
import { Server, Room, WebSocketTransport } from "colyseus";
import type { Client } from "colyseus";
import { MapSchema, Schema, defineTypes } from "@colyseus/schema";

export class PlayerState extends Schema {
  sessionId = "";
  userId = "";
  displayName = "";
  role = "STUDENT";
  teamSlug = "";
  x = 760;
  y = 520;
  direction = "down";
  movementState = "idle";
  seatId = "";
  roomId = "AREA_CENTRAL";
  online = true;
}
defineTypes(PlayerState, {
  sessionId: "string",
  userId: "string",
  displayName: "string",
  role: "string",
  teamSlug: "string",
  x: "number",
  y: "number",
  direction: "string",
  movementState: "string",
  seatId: "string",
  roomId: "string",
  online: "boolean",
});

export class FurnitureState extends Schema {
  id = "";
  roomId = "AREA_CENTRAL";
  furnitureType = "desk";
  x = 0;
  y = 0;
  rotation = 0;
  movable = true;
  interactionType = "none";
  ownerTeamId = "";
}
defineTypes(FurnitureState, {
  id: "string",
  roomId: "string",
  furnitureType: "string",
  x: "number",
  y: "number",
  rotation: "number",
  movable: "boolean",
  interactionType: "string",
  ownerTeamId: "string",
});

export class SeatState extends Schema {
  id = "";
  teamId = "";
  x = 0;
  y = 0;
  occupiedBy = "";
}
defineTypes(SeatState, {
  id: "string",
  teamId: "string",
  x: "number",
  y: "number",
  occupiedBy: "string",
});

export class CampusState extends Schema {
  players = new MapSchema<PlayerState>();
  furnitures = new MapSchema<FurnitureState>();
  seats = new MapSchema<SeatState>();
}
defineTypes(CampusState, {
  players: { map: PlayerState },
  furnitures: { map: FurnitureState },
  seats: { map: SeatState },
});

export class OfficeRoom extends Room {
  declare state: CampusState;
  maxClients = 100;

  onCreate() {
    this.setState(new CampusState());

    this.onMessage("move_intent", (client, data: { x: number; y: number; direction: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !Number.isFinite(data.x) || !Number.isFinite(data.y)) return;
      player.x = Math.max(40, Math.min(1490, data.x));
      player.y = Math.max(50, Math.min(970, data.y));
      player.direction = data.direction;
      player.movementState = "walk";
    });

    this.onMessage("move_furniture", (client, data: { id: string; x: number; y: number; rotation?: number }) => {
      const furniture = this.state.furnitures.get(data.id);
      if (furniture && furniture.movable) {
        furniture.x = Math.round(data.x / 32) * 32;
        furniture.y = Math.round(data.y / 32) * 32;
        if (data.rotation !== undefined) furniture.rotation = data.rotation;
      }
    });

    this.onMessage("sit_seat", (client, data: { seatId: string }) => {
      const player = this.state.players.get(client.sessionId);
      const seat = this.state.seats.get(data.seatId);
      if (player && seat && !seat.occupiedBy) {
        seat.occupiedBy = client.sessionId;
        player.seatId = data.seatId;
        player.x = seat.x;
        player.y = seat.y;
      }
    });
  }

  onJoin(client: Client, options: { userId?: string; displayName?: string; role?: string; teamSlug?: string }) {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.userId = options.userId || client.sessionId;
    player.displayName = options.displayName || "Visitante";
    player.role = options.role || "STUDENT";
    player.teamSlug = options.teamSlug || "";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}

const httpServer = http.createServer();
const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define("office", OfficeRoom);
gameServer.define("campus", OfficeRoom);

const port = Number(process.env.MULTIPLAYER_PORT || 2567);
httpServer.listen(port, () => console.log(`Colyseus Multiplayer Server active on port ${port}`));
