"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { MultiplayerClient } from "@/game/network/MultiplayerClient";
import { ChatMessage } from "@/types/room";
import PingPongModal from "./PingPongModal";
import MeetingModal from "./MeetingModal";
import RpgMissionModal from "../missions/RpgMissionModal";

type Role = "STUDENT" | "TEACHER" | "UBONGO_ADMIN" | "SUPER_ADMIN" | "VISITOR";
type MicState = "MIC_MUTED" | "MIC_ON" | "MIC_DENIED" | "MIC_UNAVAILABLE";
type AudioState = "AUDIO_ON" | "AUDIO_MUTED";

interface Props {
  displayName?: string;
  role?: Role;
  teamSlug?: string;
  userId?: string;
  onNiaInteract?: () => void;
}

interface PlayerTarget {
  name: string;
  role: string;
  team: string;
  isNia?: boolean;
}

const doors = [
  { label: "Missões Criativas", team: "design", x: 250, y: 180 },
  { label: "Missões das Descobertas", team: "pesquisa", x: 720, y: 180 },
  { label: "Missões das Ideias", team: "produto", x: 1020, y: 180 },
  { label: "Sala de Reunião", team: null, x: 1450, y: 180 },
];

const meetingSeats = [
  { x: 520, y: 420 },
  { x: 590, y: 420 },
  { x: 660, y: 420 },
  { x: 730, y: 420 },
  { x: 800, y: 420 },
  { x: 870, y: 420 },
];

// Ubongo Admins: Matheus, Prietto, Dandara
const npcList: (PlayerTarget & { x: number; y: number })[] = [
  { name: "NIA", role: "IA Ubongo", team: "ubongo", isNia: true, x: 650, y: 850 },
  { name: "Matheus", role: "Ubongo Admin", team: "ubongo", x: 1150, y: 560 },
  { name: "Prietto", role: "Ubongo Admin", team: "ubongo", x: 1240, y: 560 },
  { name: "Dandara", role: "Ubongo Admin", team: "ubongo", x: 1330, y: 560 },
  { name: "Prof. Niltes", role: "Professora", team: "professores", x: 790, y: 190 },
  { name: "Prof. Diego", role: "Professor", team: "professores", x: 885, y: 190 },
];

const computerDesks = [
  { x: 1150, y: 520, team: "ubongo", label: "Estação Ubongo Admin (Matheus)" },
  { x: 1240, y: 520, team: "ubongo", label: "Estação Ubongo Admin (Prietto)" },
  { x: 1330, y: 520, team: "ubongo", label: "Estação Ubongo Admin (Dandara)" },
  { x: 790, y: 160, team: "professores", label: "Estação Professores (Prof. Niltes)" },
  { x: 885, y: 160, team: "professores", label: "Estação Professores (Prof. Diego)" },
  { x: 250, y: 150, team: "design", label: "Estação Equipe Criativa (Design)" },
  { x: 720, y: 150, team: "pesquisa", label: "Estação Equipe Descobertas (Pesquisa)" },
  { x: 1020, y: 150, team: "produto", label: "Estação Equipe Ideias (Produto)" },
];

function getAudioZone(x: number, y: number): { id: string; name: string } {
  if (x >= 50 && x <= 300 && y >= 50 && y <= 300) {
    return { id: "pesquisa", name: "ROOM_PESQUISA (Descobertas)" };
  }
  if (x >= 320 && x <= 580 && y >= 50 && y <= 300) {
    return { id: "produto", name: "ROOM_PRODUTO (Ideias)" };
  }
  if (x >= 600 && x <= 980 && y >= 50 && y <= 300) {
    return { id: "design", name: "ROOM_DESIGN (Criativa)" };
  }
  if (x >= 1020 && x <= 1480 && y >= 340 && y <= 620) {
    return { id: "bongo", name: "ROOM_BONGO (Sala do Bongo)" };
  }
  if (x >= 480 && x <= 920 && y >= 380 && y <= 480) {
    return { id: "meeting", name: "MEETING_TABLE (Mesa de Reunião)" };
  }
  return { id: "central", name: "AREA_CENTRAL (Campus General)" };
}

function avatar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  shirt: number,
  name: string,
  skinTone = 0xf0b38c,
  isOffline = false
) {
  const c = scene.add.container(x, y);
  const skin = skinTone;

  const waves = scene.add.graphics();
  waves.setName("speakingWaves");
  waves.setVisible(false);

  let zzzText: Phaser.GameObjects.Text | null = null;
  if (isOffline) {
    zzzText = scene.add.text(0, -48, "Zzz...", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#93c5fd",
    }).setOrigin(0.5);
  }

  const items: Phaser.GameObjects.GameObject[] = [
    scene.add.ellipse(0, 15, 28, 8, 0x263238, 0.38),
    scene.add.rectangle(-5, 12, 5, 10, 0x26364b),
    scene.add.rectangle(5, 12, 5, 10, 0x26364b),
    scene.add.rectangle(0, 3, 18, 15, shirt).setStrokeStyle(2, 0x182333),
    scene.add.rectangle(-11, 3, 5, 12, skin),
    scene.add.rectangle(11, 3, 5, 12, skin),
    scene.add.rectangle(0, -10, 16, 14, skin).setStrokeStyle(2, 0x182333),
    scene.add.rectangle(-5, -16, 10, 5, 0x3d2732),
    scene.add.rectangle(-8, -13, 4, 7, 0x3d2732),
    scene.add.rectangle(-5, -9, 2, 2, 0x182333),
    scene.add.rectangle(4, -9, 2, 2, 0x182333),
    waves,
    scene
      .add.text(0, -32, name + (isOffline ? " (Zzz)" : ""), {
        fontFamily: "monospace",
        fontSize: "11px",
        color: isOffline ? "#64748b" : "#182333",
        backgroundColor: isOffline ? "#e2e8f0" : "#fff8df",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5),
  ];

  if (zzzText) items.push(zzzText);

  c.add(items);

  (c as unknown as { setSpeaking: (speaking: boolean) => void }).setSpeaking = (
    speaking: boolean
  ) => {
    waves.clear();
    if (speaking) {
      const t = (scene.time.now % 700) / 700;
      waves.lineStyle(2, 0x10b981, 1 - t);
      waves.strokeCircle(0, -40, 8 + t * 16);
      waves.lineStyle(2, 0x3b82f6, 1 - ((t + 0.5) % 1));
      waves.strokeCircle(0, -40, 8 + ((t + 0.5) % 1) * 16);
      waves.setVisible(true);
    } else {
      waves.setVisible(false);
    }
  };

  return c;
}

export default function VirtualCampus({
  displayName = "Visitante",
  role = "STUDENT",
  teamSlug = "pesquisa",
  userId = "local",
  onNiaInteract,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef({ x: 0, y: 0 });
  const keyStateRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const promptRef = useRef("Use as setas/WASD ou clique no mapa para andar. Aproxime-se dos objetos para interagir (E).");
  const [prompt, setPrompt] = useState(promptRef.current);
  const [online, setOnline] = useState(1);
  const [currentAudioZone, setCurrentAudioZone] = useState("AREA_CENTRAL");

  // Modals & Interactive Minigames
  const [showPingPong, setShowPingPong] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showRpgMission, setShowRpgMission] = useState(false);
  const [hasCoffeeEffect, setHasCoffeeEffect] = useState(false);

  // Microphone & Audio Controls
  const [micState, setMicState] = useState<MicState>("MIC_MUTED");
  const [audioState, setAudioState] = useState<AudioState>("AUDIO_ON");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat Contextual States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<"area" | "team" | "meeting">("area");
  const [chatText, setChatText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [interactionModal, setInteractionModal] = useState<PlayerTarget | null>(null);

  const micStream = useRef<MediaStream | null>(null);
  const isSpeakingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const propsRef = useRef({ displayName, role, teamSlug, userId, onNiaInteract });
  useEffect(() => {
    propsRef.current = { displayName, role, teamSlug, userId, onNiaInteract };
  }, [displayName, role, teamSlug, userId, onNiaInteract]);

  // Global Keyboard Event Listener to guarantee Arrow Keys / WASD movement 100% of the time
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keyStateRef.current.left = true;
      if (k === "arrowright" || k === "d") keyStateRef.current.right = true;
      if (k === "arrowup" || k === "w") keyStateRef.current.up = true;
      if (k === "arrowdown" || k === "s") keyStateRef.current.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keyStateRef.current.left = false;
      if (k === "arrowright" || k === "d") keyStateRef.current.right = false;
      if (k === "arrowup" || k === "w") keyStateRef.current.up = false;
      if (k === "arrowdown" || k === "s") keyStateRef.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const safeSetPrompt = (msg: string) => {
    if (promptRef.current !== msg) {
      promptRef.current = msg;
      setPrompt(msg);
    }
  };

  useEffect(() => {
    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent<ChatMessage>;
      const msg = customEvent.detail;
      const currentRoomId =
        chatTab === "area" ? "area" : chatTab === "team" ? `team-${teamSlug}` : "meeting";

      if (msg.roomId === currentRoomId) {
        setChatMessages((prev) => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg].slice(-100);
        });
      }
      if (!chatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener("new_chat_message", handleNewMessage);
    return () => window.removeEventListener("new_chat_message", handleNewMessage);
  }, [chatOpen, chatTab, teamSlug]);

  useEffect(() => {
    const roomId =
      chatTab === "area" ? "area" : chatTab === "team" ? `team-${teamSlug}` : "meeting";
    import("@/lib/rooms").then(({ fetchChatHistory }) => {
      fetchChatHistory(roomId).then(setChatMessages);
    });
  }, [chatTab, teamSlug]);

  const toggleChatPanel = () => {
    if (!chatOpen) {
      setUnreadCount(0);
    }
    setChatOpen((prev) => !prev);
  };

  const sendMessage = () => {
    if (!chatText.trim()) return;
    const roomId =
      chatTab === "area" ? "area" : chatTab === "team" ? `team-${teamSlug}` : "meeting";
    import("@/lib/rooms").then(({ sendChatMessage }) => {
      sendChatMessage(roomId, userId || "visitante", displayName || "Visitante", chatText.trim());
    });
    setChatText("");
  };

  const toggleMicrophone = async () => {
    if (micState === "MIC_ON") {
      micStream.current?.getTracks().forEach((track) => {
        track.enabled = false;
      });
      setMicState("MIC_MUTED");
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    try {
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current.getTracks().forEach((track) => {
        track.enabled = true;
      });
      setMicState("MIC_ON");

      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        const source = audioContextRef.current.createMediaStreamSource(micStream.current);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!micStream.current || !micStream.current.active) {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            return;
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const speaking = avg > 12 && audioState === "AUDIO_ON";
          setIsSpeaking(speaking);
          isSpeakingRef.current = speaking;
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      }
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicState("MIC_DENIED");
        safeSetPrompt("Permissão de microfone negada no navegador.");
      } else {
        setMicState("MIC_UNAVAILABLE");
        safeSetPrompt("Nenhum dispositivo de microfone encontrado.");
      }
    }
  };

  const toggleAudioListening = () => {
    setAudioState((prev) => (prev === "AUDIO_ON" ? "AUDIO_MUTED" : "AUDIO_ON"));
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const network = new MultiplayerClient();
    const remotes = new Map<
      string,
      Phaser.GameObjects.Container & { setSpeaking?: (speaking: boolean) => void }
    >();
    let local:
      | (Phaser.GameObjects.Container & { setSpeaking?: (speaking: boolean) => void })
      | undefined;
    let seated = false;
    let occupiedSeat: { x: number; y: number } | undefined;
    let lastMoveTime = 0;
    let targetPos: { x: number; y: number } | null = null;

    class OfficeScene extends Phaser.Scene {
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      keys!: Record<string, Phaser.Input.Keyboard.Key>;
      nia!: Phaser.GameObjects.Container;

      constructor() {
        super("OfficeScene");
      }

      preload() {
        this.load.image("office-art", "/assets/office-art-v2.png");
      }

      create() {
        this.cameras.main.setBounds(0, 0, 1536, 1024);
        this.cameras.main.setZoom(1.0);
        this.cameras.main.setBackgroundColor("#0b0f17");

        const bg = this.add.image(768, 512, "office-art").setDepth(-10);
        bg.setDisplaySize(1536, 1024);

        this.drawBongoRoom();
        this.drawTeachersRoom();
        this.drawCafeteria();
        this.drawPingPongTable();
        this.drawSoccerField();
        this.drawOfflineStudents();

        this.nia = avatar(this, 650, 850, 0x8ee85f, "NIA", 0x5a3829);
        this.nia.setDepth(850);
        this.nia.setInteractive(new Phaser.Geom.Rectangle(-20, -40, 40, 60), Phaser.Geom.Rectangle.Contains);
        this.nia.on("pointerdown", () => propsRef.current.onNiaInteract?.());

        local = avatar(this, 760, 520, 0xf26b5b, propsRef.current.displayName);
        local.setDepth(520);
        this.cameras.main.startFollow(local, true, 0.15, 0.15);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys("W,A,S,D,E") as Record<
          string,
          Phaser.Input.Keyboard.Key
        >;
        this.input.keyboard!.on("keydown-E", () => this.interact());

        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          if (seated) return;
          const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
          if (
            worldPoint.x >= 40 &&
            worldPoint.x <= 1490 &&
            worldPoint.y >= 50 &&
            worldPoint.y <= 970
          ) {
            targetPos = { x: worldPoint.x, y: worldPoint.y };
          }
        });

        void network
          .join("office", "", {
            userId: propsRef.current.userId,
            displayName: propsRef.current.displayName,
            teamSlug: propsRef.current.teamSlug,
          })
          .then((room) => {
            const state = room.state as unknown as {
              players: {
                size: number;
                onAdd: (
                  cb: (
                    p: {
                      displayName: string;
                      teamSlug: string;
                      x: number;
                      y: number;
                      onChange?: (cb: () => void) => void;
                    },
                    id: string
                  ) => void
                ) => void;
                onRemove: (cb: (_p: unknown, id: string) => void) => void;
              };
            };
            setOnline(state.players.size);
            state.players.onAdd((p, id) => {
              setOnline(state.players.size);
              if (id === room.sessionId) return;
              const r = avatar(
                this,
                p.x,
                p.y,
                p.teamSlug === "design" ? 0x7c6bf2 : 0x4bb3a7,
                p.displayName
              );
              r.setDepth(p.y);
              remotes.set(id, r);
              p.onChange?.(() => {
                r.x = p.x;
                r.y = p.y;
                r.setDepth(p.y);
              });
            });
            state.players.onRemove((_p, id) => {
              remotes.get(id)?.destroy();
              remotes.delete(id);
              setOnline(state.players.size);
            });
          })
          .catch(() =>
            safeSetPrompt("Navegação fluida ativada")
          );
      }

      drawBongoRoom() {
        for (const [x, name, shirt, skin] of [
          [1150, "Matheus", 0x3d9b78, 0x6b422f],
          [1240, "Prietto", 0x6b5fc4, 0x8a5a3b],
          [1330, "Dandara", 0x8ee85f, 0x5a3829],
        ] as [number, string, number, number][]) {
          const member = avatar(this, x, 560, shirt, name, skin);
          member.setDepth(560);
        }
      }

      drawTeachersRoom() {
        for (const [x, name, shirt, skin] of [
          [790, "Prof. Niltes", 0x6b5fc4, 0x6b422f],
          [885, "Prof. Diego", 0x3d9b78, 0x8a5a3b],
        ] as [number, string, number, number][]) {
          const teacher = avatar(this, x, 190, shirt, name, skin);
          teacher.setDepth(190);
        }
      }

      drawCafeteria() {
        const coffeeArea = this.add.zone(1280, 120, 80, 60).setOrigin(0.5).setInteractive({ useHandCursor: true });
        coffeeArea.on("pointerdown", () => {
          setHasCoffeeEffect(true);
          safeSetPrompt("Efeito Café ativado! Sua velocidade aumentou temporariamente.");
        });
      }

      drawPingPongTable() {
        const pingPongZone = this.add.zone(1180, 780, 120, 140).setOrigin(0.5).setInteractive({ useHandCursor: true });
        pingPongZone.on("pointerdown", () => {
          setShowPingPong(true);
        });
      }

      drawSoccerField() {
        // Field Click Trigger
      }

      drawOfflineStudents() {
        for (const [x, y, name] of [
          [200, 850, "Lucas"],
          [300, 850, "Arthur"],
          [1380, 180, "Maria"],
        ] as [number, number, string][]) {
          const off = avatar(this, x, y, 0x4b729f, name, 0xf0b38c, true);
          off.setDepth(y);
        }
      }

      // Precise Solid Walls & Furniture Collisions (Gather/Habbo style)
      blocked(x: number, y: number) {
        const r = 8;
        // Outer boundaries
        if (x - r < 50 || x + r > 1480 || y - r < 60 || y + r > 960) {
          return true;
        }

        // Room Dividers and Solid Furniture
        const furnitureBoxes = [
          [1100, 480, 340, 50], // Ubongo admin desks
          [730, 130, 220, 50],  // Teacher desks
          [1220, 120, 200, 40], // Cafeteria counter
          [500, 410, 400, 50],  // Central meeting table
        ];

        return furnitureBoxes.some(
          ([wx, wy, ww, wh]) => x + r > wx && x - r < wx + ww && y + r > wy && y - r < wy + wh
        );
      }

      interact() {
        if (!local) return;
        if (seated) {
          seated = false;
          const seat = occupiedSeat;
          occupiedSeat = undefined;
          if (seat) local.setPosition(seat.x, seat.y + 28);
          safeSetPrompt("Você levantou.");
          return;
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 1280, 120) < 85) {
          setHasCoffeeEffect(true);
          safeSetPrompt("Efeito Café ativado! Sua velocidade aumentou temporariamente.");
          return;
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 1180, 780) < 100) {
          setShowPingPong(true);
          return;
        }

        const desk = computerDesks.find(
          (d) => Phaser.Math.Distance.Between(local!.x, local!.y, d.x, d.y) < 70
        );
        if (desk) {
          setShowRpgMission(true);
          return;
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 650, 420) < 130) {
          setShowMeetingModal(true);
          return;
        }

        const targetNpc = npcList.find(
          (npc) => Phaser.Math.Distance.Between(local!.x, local!.y, npc.x, npc.y) < 85
        );
        if (targetNpc) {
          if (targetNpc.isNia) {
            propsRef.current.onNiaInteract?.();
          } else {
            setInteractionModal(targetNpc);
          }
          return;
        }

        const seat = meetingSeats.find(
          (item) => Phaser.Math.Distance.Between(local!.x, local!.y, item.x, item.y) < 55
        );
        if (seat) {
          seated = true;
          occupiedSeat = seat;
          local.setPosition(seat.x, seat.y);
          safeSetPrompt("Aperte E para levantar.");
          return;
        }

        const d = doors.find(
          (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 130
        );
        if (d)
          safeSetPrompt(
            d.team === null || d.team === propsRef.current.teamSlug || propsRef.current.role !== "STUDENT"
              ? `Aperte E para entrar em ${d.label}`
              : `Missão exclusiva da Equipe ${d.team}`
          );
      }

      update(time: number, delta: number) {
        if (!local) return;

        if (local.setSpeaking) {
          local.setSpeaking(isSpeakingRef.current);
        }

        const zoneInfo = getAudioZone(local.x, local.y);
        setCurrentAudioZone(zoneInfo.name);

        if (seated && occupiedSeat) {
          local.setPosition(occupiedSeat.x, occupiedSeat.y);
          safeSetPrompt("Aperte E para levantar.");
          return;
        }

        const ox = local.x;
        const oy = local.y;
        let dir = "down";

        const speedMult = hasCoffeeEffect ? 1.4 : 1.0;
        const moveStep = (320 * speedMult * delta) / 1000;
        const j = joystickRef.current;
        const ks = keyStateRef.current;

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown || ks.left || j.x < -0.18) {
          dx -= moveStep;
          dir = "left";
          targetPos = null;
        }
        if (this.cursors.right.isDown || this.keys.D.isDown || ks.right || j.x > 0.18) {
          dx += moveStep;
          dir = "right";
          targetPos = null;
        }
        if (this.cursors.up.isDown || this.keys.W.isDown || ks.up || j.y < -0.18) {
          dy -= moveStep;
          dir = "up";
          targetPos = null;
        }
        if (this.cursors.down.isDown || this.keys.S.isDown || ks.down || j.y > 0.18) {
          dy += moveStep;
          dir = "down";
          targetPos = null;
        }

        // Point and Click Navigation
        if (dx === 0 && dy === 0 && targetPos) {
          const dist = Phaser.Math.Distance.Between(local.x, local.y, targetPos.x, targetPos.y);
          if (dist < 8) {
            targetPos = null;
          } else {
            const angle = Phaser.Math.Angle.Between(local.x, local.y, targetPos.x, targetPos.y);
            dx = Math.cos(angle) * Math.min(moveStep, dist);
            dy = Math.sin(angle) * Math.min(moveStep, dist);
            if (Math.abs(dx) > Math.abs(dy)) {
              dir = dx > 0 ? "right" : "left";
            } else {
              dir = dy > 0 ? "down" : "up";
            }
          }
        }

        // Smooth Wall Sliding Collision Logic
        if (dx !== 0) {
          const nextX = Phaser.Math.Clamp(local.x + dx, 40, 1490);
          if (!this.blocked(nextX, local.y)) {
            local.x = nextX;
          }
        }
        if (dy !== 0) {
          const nextY = Phaser.Math.Clamp(local.y + dy, 50, 970);
          if (!this.blocked(local.x, nextY)) {
            local.y = nextY;
          }
        }

        local.setDepth(local.y);

        if ((local.x !== ox || local.y !== oy) && time - lastMoveTime > 40) {
          lastMoveTime = time;
          network.sendMove(local.x, local.y, dir);
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 1280, 120) < 85) {
          safeSetPrompt("Aperte E ou clique para tomar café da Ubongo (Bônus de velocidade)");
          return;
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 1180, 780) < 100) {
          safeSetPrompt("Aperte E ou clique na mesa para jogar Ping-Pong 2D");
          return;
        }

        const desk = computerDesks.find(
          (d) => Phaser.Math.Distance.Between(local!.x, local!.y, d.x, d.y) < 70
        );
        if (desk) {
          safeSetPrompt(`Aperte E ou clique no computador para acessar (${desk.label})`);
          return;
        }

        if (Phaser.Math.Distance.Between(local.x, local.y, 650, 420) < 130) {
          safeSetPrompt("Aperte E para entrar na Reunião Central");
          return;
        }

        const targetNpc = npcList.find(
          (npc) => Phaser.Math.Distance.Between(local!.x, local!.y, npc.x, npc.y) < 85
        );
        if (targetNpc) {
          safeSetPrompt(`Aperte E ou clique para conversar com ${targetNpc.name}`);
        } else {
          const nearbySeat = meetingSeats.find(
            (item) => Phaser.Math.Distance.Between(local!.x, local!.y, item.x, item.y) < 55
          );
          if (nearbySeat) {
            safeSetPrompt("Aperte E para sentar");
          } else {
            const d = doors.find(
              (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 130
            );
            safeSetPrompt(
              d
                ? d.team === null || d.team === propsRef.current.teamSlug || propsRef.current.role !== "STUDENT"
                  ? `Aperte E para entrar em ${d.label}`
                  : `Missão exclusiva da Equipe ${d.team}`
                : "Explore o Office · Use WASD/Setas para andar e aproxime-se dos objetos para interagir"
            );
          }
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: "100%",
      height: "100%",
      parent: mountRef.current,
      pixelArt: true,
      audio: { noAudio: true },
      render: { antialias: false, roundPixels: true },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: OfficeScene,
    });

    return () => {
      micStream.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      void network.leave();
      game.destroy(true);
    };
  }, [audioState, hasCoffeeEffect]);

  const key = (value: string) => window.dispatchEvent(new KeyboardEvent("keydown", { key: value }));
  const setJoystick = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    joystickRef.current = {
      x: Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2))),
      y: Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2))),
    };
  };
  const releaseJoystick = () => {
    joystickRef.current = { x: 0, y: 0 };
  };

  return (
    <div className="relative h-full min-h-[560px] w-full overflow-hidden rounded-2xl border-4 border-[#315f4c] bg-[#0b0f17]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* PERMANENT SOCIAL HUD (Bottom Right - Clean Vector Icons & Text) */}
      <div className="absolute right-3 bottom-16 sm:bottom-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-[#182333]/95 p-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md z-30">
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{online} Online</span>
          <span className="text-white/40">|</span>
          <span className="text-emerald-300 font-mono">{currentAudioZone}</span>
        </div>

        {/* 1. MICROPHONE CONTROL BUTTON */}
        <button
          aria-label="Controle de Microfone"
          onClick={toggleMicrophone}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all active:scale-95 ${
            micState === "MIC_ON"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              : micState === "MIC_DENIED"
              ? "bg-rose-900/60 text-rose-300 border border-rose-500 animate-bounce"
              : micState === "MIC_UNAVAILABLE"
              ? "bg-gray-800 text-gray-400 border border-gray-600"
              : "bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50"
          }`}
        >
          <span>
            {micState === "MIC_ON"
              ? "MIC: LIGADO"
              : micState === "MIC_DENIED"
              ? "MIC: NEGADO"
              : micState === "MIC_UNAVAILABLE"
              ? "MIC: INDISPONÍVEL"
              : "MIC: MUTADO"}
          </span>
          {isSpeaking && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />}
        </button>

        {/* 2. AUDIO LISTENING CONTROL BUTTON */}
        <button
          aria-label="Controle de Áudio"
          onClick={toggleAudioListening}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all active:scale-95 ${
            audioState === "AUDIO_ON"
              ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
              : "bg-amber-950/50 text-amber-400 border border-amber-500/50 hover:bg-amber-900/60"
          }`}
        >
          <span>{audioState === "AUDIO_ON" ? "ÁUDIO: OUVINDO" : "ÁUDIO: SILENCIADO"}</span>
        </button>

        {/* 3. CHAT BUTTON WITH UNREAD BADGE */}
        <button
          aria-label="Painel de Chat"
          onClick={toggleChatPanel}
          className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all active:scale-95 ${
            chatOpen
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50"
          }`}
        >
          <span>CHAT</span>
          {unreadCount > 0 && !chatOpen && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* PLAYER INTERACTION MODAL */}
      {interactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-[#182333]/90 p-6 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-lg">{interactionModal.name}</h3>
                <p className="text-xs text-emerald-400 font-mono">{interactionModal.role}</p>
              </div>
              <button
                onClick={() => setInteractionModal(null)}
                className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/20"
              >
                Fechar
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs text-white/80">
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50">Equipe / Setor:</span>
                <span className="font-bold text-white uppercase">{interactionModal.team}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50">Roteamento AudioZone:</span>
                <span className="font-bold text-emerald-400">{currentAudioZone}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (micState !== "MIC_ON") toggleMicrophone();
                  setInteractionModal(null);
                }}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
              >
                [ FALAR POR VOZ ]
              </button>
              <button
                onClick={() => {
                  setChatOpen(true);
                  setUnreadCount(0);
                  setInteractionModal(null);
                }}
                className="w-full rounded-xl bg-purple-600 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-purple-500 active:scale-95 transition-all"
              >
                [ ABRIR CHAT ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINIGAMES & SPECIAL MODALS */}
      {showPingPong && <PingPongModal onClose={() => setShowPingPong(false)} />}
      {showMeetingModal && (
        <MeetingModal
          onClose={() => setShowMeetingModal(false)}
          userRole={role}
          displayName={displayName}
        />
      )}
      {showRpgMission && (
        <RpgMissionModal
          onClose={() => setShowRpgMission(false)}
          teamSlug={teamSlug}
        />
      )}

      {/* BOTTOM PROMPT BAR (Clean, non-intrusive textual guidance) */}
      <div className="absolute bottom-4 left-4 max-w-xl rounded-xl bg-[#182333]/90 px-4 py-2 text-xs font-semibold text-white shadow-lg border border-white/10">
        {prompt}
      </div>

      {/* CONTEXTUAL CHAT PANEL */}
      {chatOpen && (
        <div className="absolute right-3 top-14 w-84 max-w-[90vw] rounded-2xl border border-white/20 bg-[#182333]/95 p-4 text-xs text-white shadow-2xl backdrop-blur-xl z-40">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-sm tracking-wide text-purple-300">CHAT CONTEXTUAL</span>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70 hover:bg-white/20"
            >
              Fechar
            </button>
          </div>

          <div className="mb-3 flex gap-1 rounded-xl bg-black/30 p-1">
            <button
              onClick={() => setChatTab("area")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "area" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              ÁREA
            </button>
            <button
              onClick={() => setChatTab("team")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "team" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              EQUIPE
            </button>
            <button
              onClick={() => setChatTab("meeting")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "meeting" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              REUNIÃO
            </button>
          </div>

          <div className="mb-3 h-52 overflow-y-auto space-y-2 rounded-xl bg-black/25 p-2.5 border border-white/5">
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-white/40 italic">
                Nenhuma mensagem neste canal ainda.
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                  <div className="flex justify-between items-center font-bold text-[#8ee85f] mb-1">
                    <span>{msg.name}</span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-white/90 break-words">{msg.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Enviar em ${
                chatTab === "area" ? "Área" : chatTab === "team" ? "Equipe" : "Reunião"
              }...`}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 rounded-xl border border-[#10b981]/30 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="rounded-xl bg-[#10b981] px-3.5 py-2 font-[#10160e] hover:bg-[#34d399] active:scale-95 transition-all"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* MOBILE TOUCH CONTROLS */}
      <div className="absolute bottom-5 left-5 sm:hidden">
        <div
          className="relative h-28 w-28 touch-none rounded-full border border-white/30 bg-[#182333]/35"
          onPointerDown={setJoystick}
          onPointerMove={(event) => event.buttons && setJoystick(event)}
          onPointerUp={releaseJoystick}
          onPointerCancel={releaseJoystick}
          onPointerLeave={releaseJoystick}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/25" />
        </div>
      </div>
      <button
        aria-label="interagir"
        className="absolute bottom-8 right-8 h-16 w-16 rounded-full border border-white/30 bg-[#8ee85f] font-bold text-[#10160e] shadow-xl sm:hidden active:scale-95 transition-transform"
        onClick={() => key("e")}
      >
        E
      </button>
    </div>
  );
}
