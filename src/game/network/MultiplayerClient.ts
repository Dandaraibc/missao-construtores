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

  constructor(endpoint?: string) {
    let url =
      endpoint ||
      (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_MULTIPLAYER_URL : undefined);
    if (!url && typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      // Default to port 2567 if port not specified
      const port = window.location.port ? `:${window.location.port}` : ":2567";
      url = `${protocol}//${host}${port}`;
    }
    this.client = new Client(url || "ws://localhost:2567");
  }

  async join(
    mapId: string,
    token: string,
    identity: { userId?: string; displayName?: string; teamSlug?: string } = {}
  ) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout multiplayer")), 2000)
    );
    try {
      this.room = (await Promise.race([
        this.client.joinOrCreate("campus", { mapId, token, ...identity }),
        timeout,
      ])) as Awaited<ReturnType<Client["joinOrCreate"]>>;
      return this.room;
    } catch {
      this.room = null;
      throw new Error("Multiplayer unavailable");
    }
  }

  sendMove(x: number, y: number, direction: string) {
    if (this.room) {
      try {
        this.room.send("move_intent", { x, y, direction });
      } catch {
        // Safe fail
      }
    }
  }

  sendInteract(targetId: string) {
    if (this.room) {
      try {
        this.room.send("interact", { targetId });
      } catch {
        // Safe fail
      }
    }
  }

  leave() {
    return this.room?.leave();
  }
}
