import { Client } from "@colyseus/sdk";

export interface RemotePlayerState {
  sessionId: string;
  userId: string;
  displayName: string;
  x: number;
  y: number;
  direction: string;
  movementState: string;
  mapId: string;
  activity?: string;
}

export class MultiplayerClient {
  private client: Client;
  private room: Awaited<ReturnType<Client["joinOrCreate"]>> | null = null;

  constructor(endpoint = process.env.NEXT_PUBLIC_MULTIPLAYER_URL || "ws://localhost:2567") { this.client = new Client(endpoint); }
  async join(mapId: string, token: string, identity: { userId?: string; displayName?: string; teamSlug?: string } = {}) { this.room = await this.client.joinOrCreate("campus", { mapId, token, ...identity }); return this.room; }
  sendMove(x: number, y: number, direction: string) { this.room?.send("move_intent", { x, y, direction }); }
  sendInteract(targetId: string) { this.room?.send("interact", { targetId }); }
  leave() { return this.room?.leave(); }
}
