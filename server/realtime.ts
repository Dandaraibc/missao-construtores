import http from "node:http";
import { Server, Room, WebSocketTransport } from "colyseus";
import type { Client } from "colyseus";
import { MapSchema, Schema, defineTypes } from "@colyseus/schema";

class PlayerState extends Schema {
  sessionId = "";
  userId = "";
  displayName = "";
  teamSlug = "";
  x = 760;
  y = 520;
  direction = "down";
  movementState = "idle";
}
defineTypes(PlayerState, {
  sessionId: "string",
  userId: "string",
  displayName: "string",
  teamSlug: "string",
  x: "number",
  y: "number",
  direction: "string",
  movementState: "string",
});

class CampusState extends Schema {
  players = new MapSchema<PlayerState>();
}
defineTypes(CampusState, { players: { map: PlayerState } });

class CampusRoom extends Room {
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
  }

  onJoin(client: Client, options: { userId?: string; displayName?: string; teamSlug?: string }) {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.userId = options.userId || client.sessionId;
    player.displayName = options.displayName || "Visitante";
    player.teamSlug = options.teamSlug || "";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}

const httpServer = http.createServer();
const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define("campus", CampusRoom);
const port = Number(process.env.MULTIPLAYER_PORT || 2567);
httpServer.listen(port, () => console.log(`Multiplayer server listening on ${port}`));
