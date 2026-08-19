import { getAudioMix, type AudioZoneMode, type WorldZone } from "@/game/config/world";

export interface VoicePeer {
  peerId: string;
  stream: MediaStream;
  audio: HTMLAudioElement;
  zoneId?: string;
}

export interface VoiceTransport {
  join(channelId: string, stream: MediaStream): Promise<void>;
  leave(): Promise<void>;
  onPeer(callback: (peer: VoicePeer) => void): () => void;
  onPeerLeft(callback: (peerId: string) => void): () => void;
}

/** WebRTC-only audio layer. Game movement must never carry media packets. */
export class ProximityAudioClient {
  private peers = new Map<string, VoicePeer>();
  private stream: MediaStream | null = null;
  private zone: WorldZone | null = null;
  private muted = false;

  constructor(private readonly transport: VoiceTransport) {}

  async enable(channelId: string) {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    await this.transport.join(channelId, this.stream);
  }

  setZone(zone: WorldZone | null) { this.zone = zone; }
  setMuted(muted: boolean) { this.muted = muted; this.stream?.getAudioTracks().forEach((track) => { track.enabled = !muted; }); }
  isMuted() { return this.muted; }

  updatePeerDistance(peerId: string, distance: number, mode: AudioZoneMode = "PROXIMITY") {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    const volume = mode === "PRIVATE_ROOM" || mode === "ROOM" ? 1 : mode === "DISABLED" ? 0 : getAudioMix(distance, this.zone?.radius ?? 5);
    peer.audio.volume = Math.max(0, Math.min(1, volume));
  }

  connectListeners() {
    const unsubscribePeer = this.transport.onPeer((peer) => { peer.audio.autoplay = true; this.peers.set(peer.peerId, peer); });
    const unsubscribeLeft = this.transport.onPeerLeft((peerId) => { this.peers.get(peerId)?.audio.remove(); this.peers.delete(peerId); });
    return () => { unsubscribePeer(); unsubscribeLeft(); };
  }

  async dispose() { await this.transport.leave(); this.stream?.getTracks().forEach((track) => track.stop()); this.peers.clear(); }
}
