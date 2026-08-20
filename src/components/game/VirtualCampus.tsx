"use client";
import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { MultiplayerClient } from "@/game/network/MultiplayerClient";
import { getChat, sendChatMessage } from "@/lib/rooms";

type Role = "STUDENT" | "TEACHER" | "UBONGO_ADMIN" | "SUPER_ADMIN";
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

const canEnter = (team: string | null, role: Role, current?: string) =>
  !team || team === current || role !== "STUDENT";

const meetingSeats = [
  { x: 520, y: 420 },
  { x: 590, y: 420 },
  { x: 660, y: 420 },
  { x: 730, y: 420 },
  { x: 800, y: 420 },
  { x: 870, y: 420 },
];

const npcList: (PlayerTarget & { x: number; y: number })[] = [
  { name: "NIA", role: "IA Ubongo", team: "ubongo", isNia: true, x: 650, y: 850 },
  { name: "Charles", role: "Ubongo Admin", team: "ubongo", x: 1075, y: 510 },
  { name: "Prietto", role: "Ubongo Admin", team: "ubongo", x: 1175, y: 510 },
  { name: "Dandara", role: "Ubongo Admin", team: "ubongo", x: 1275, y: 510 },
  { name: "Prof. Niltes", role: "Professora", team: "professores", x: 790, y: 190 },
  { name: "Prof. Diego", role: "Professor", team: "professores", x: 900, y: 190 },
];

function avatar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  shirt: number,
  name: string,
  skinTone = 0xf0b38c
) {
  const c = scene.add.container(x, y);
  const skin = skinTone;

  const waves = scene.add.graphics();
  waves.setName("speakingWaves");
  waves.setVisible(false);

  c.add([
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
      .add.text(0, -37, name, {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#182333",
        backgroundColor: "#fff8df",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5),
  ]);

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
  const promptRef = useRef("Explore o Office · aproxime-se de uma pessoa para conversar");
  const [prompt, setPrompt] = useState(promptRef.current);
  const [online, setOnline] = useState(1);

  // HUD Social State
  const [micOn, setMicOn] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat Contextual State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<"area" | "team" | "meeting">("area");
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState(() =>
    typeof window === "undefined" ? [] : getChat("area").slice(-20)
  );

  // Player Proximity / Interaction State
  const [nearbyTarget, setNearbyTarget] = useState<PlayerTarget | null>(null);
  const [interactionModal, setInteractionModal] = useState<PlayerTarget | null>(null);

  const micStream = useRef<MediaStream | null>(null);
  const micOnRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const propsRef = useRef({ displayName, role, teamSlug, userId, onNiaInteract });
  useEffect(() => {
    propsRef.current = { displayName, role, teamSlug, userId, onNiaInteract };
  }, [displayName, role, teamSlug, userId, onNiaInteract]);

  const safeSetPrompt = (msg: string) => {
    if (promptRef.current !== msg) {
      promptRef.current = msg;
      setPrompt(msg);
    }
  };

  // Synchronize chat messages when tab changes
  useEffect(() => {
    const roomId =
      chatTab === "area" ? "area" : chatTab === "team" ? `team-${teamSlug}` : "meeting";
    setChatMessages(getChat(roomId).slice(-30));
  }, [chatTab, teamSlug]);

  const sendMessage = () => {
    if (!chatText.trim()) return;
    const roomId =
      chatTab === "area" ? "area" : chatTab === "team" ? `team-${teamSlug}` : "meeting";
    sendChatMessage(roomId, userId, displayName, chatText.trim());
    setChatText("");
    setChatMessages(getChat(roomId).slice(-30));
  };

  // Toggle Microphone (Independent Control)
  const toggleMic = async () => {
    if (micOn) {
      micStream.current?.getTracks().forEach((track) => {
        track.enabled = false;
      });
      setMicOn(false);
      micOnRef.current = false;
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }
    try {
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current.getTracks().forEach((track) => {
        track.enabled = true;
      });
      setMicOn(true);
      micOnRef.current = true;

      // Web Audio API speech detection
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
          if (!micOnRef.current || !micStream.current) {
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
          const speaking = avg > 12;
          setIsSpeaking(speaking);
          isSpeakingRef.current = speaking;
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch {
        // Fallback: indicate mic is active without spectral analysis
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      }
    } catch {
      safeSetPrompt("Microfone bloqueado · conceda permissão no navegador para falar");
    }
  };

  // Toggle Audio Listening (Independent Control)
  const toggleAudio = () => setAudioOn((value) => !value);

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
      ball!: Phaser.GameObjects.Arc;
      nia!: Phaser.GameObjects.Container;
      ballVelocity = 0;
      ballVertical = 0;

      constructor() {
        super("OfficeScene");
      }

      preload() {
        this.load.image("office-art", "/assets/office-art-v2.png");
      }

      create() {
        this.drawBongoRoom();
        this.drawTeachersRoom();
        this.drawCafeteria();
        this.add
          .text(1050, 350, "SALA DO BONGO", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#dfffe5",
            backgroundColor: "#315f4c",
            padding: { x: 5, y: 2 },
          })
          .setDepth(4);

        this.time.delayedCall(120, () => {
          this.cameras.main.setZoom(1.2);
          this.ball?.setVisible(true).setScale(1.2);
        });

        this.time.delayedCall(500, () => {
          this.children.list
            .filter(
              (child) =>
                child.type === "Text" &&
                ((child as Phaser.GameObjects.Text).text === "HISTÓRIA" ||
                  (child as Phaser.GameObjects.Text).text === "SALA DOS PROFESSORES")
            )
            .forEach((child) => child.destroy());
        });

        this.time.addEvent({
          delay: 30,
          loop: true,
          callback: () => {
            if (!this.ball?.visible) return;
            this.ball.x += 2.2;
            if (this.ball.x > 1400) this.ball.x = 1240;
          },
        });

        this.nia = avatar(this, 650, 850, 0x8ee85f, "NIA", 0x5a3829);
        this.nia.setDepth(8);

        this.cameras.main.setBounds(0, 0, 1536, 1024);
        this.cameras.main.setZoom(0.9);
        this.cameras.main.setBackgroundColor("#172b42");
        this.add.image(768, 512, "office-art").setDepth(-10);
        this.add
          .text(110, 35, "DESCOBERTAS", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#fff8df",
            backgroundColor: "#6d4b94",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);
        this.add
          .text(360, 35, "IDEIAS", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#fff8df",
            backgroundColor: "#3d708d",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);
        this.add
          .text(610, 35, "CRIATIVA", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#fff8df",
            backgroundColor: "#6d4b94",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);
        this.add
          .text(1000, 35, "GUARDIÕES", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#fff8df",
            backgroundColor: "#3d708d",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);
        this.add
          .text(1200, 350, "HISTÓRIA", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#fff8df",
            backgroundColor: "#6d4b94",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);
        this.add
          .text(580, 390, "SALA CENTRAL · 22 LUGARES", {
            fontFamily: "monospace",
            fontSize: "15px",
            color: "#e9fff1",
            backgroundColor: "#315f4c",
            padding: { x: 7, y: 4 },
          })
          .setDepth(-5);

        this.ball = this.add
          .circle(1330, 800, 7, 0xffffff)
          .setStrokeStyle(2, 0x23302f)
          .setDepth(3)
          .setVisible(false);

        local = avatar(this, 760, 520, 0xf26b5b, propsRef.current.displayName);
        this.cameras.main.startFollow(local, true, 0.1, 0.1);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys("W,A,S,D,E") as Record<
          string,
          Phaser.Input.Keyboard.Key
        >;
        this.input.keyboard!.on("keydown-E", () => this.interact());

        // Pointer click-to-move support
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
              remotes.set(id, r);
              p.onChange?.(() => {
                r.x = p.x;
                r.y = p.y;
              });
            });
            state.players.onRemove((_p, id) => {
              remotes.get(id)?.destroy();
              remotes.delete(id);
              setOnline(state.players.size);
            });
          })
          .catch(() =>
            safeSetPrompt("Modo local · inicie o servidor multiplayer para ver outras pessoas")
          );
      }

      desk(x: number, y: number) {
        this.add.rectangle(x, y, 72, 32, 0xc88b5f).setStrokeStyle(3, 0x754c3b);
        this.add.rectangle(x, y - 25, 38, 20, 0x516a79).setStrokeStyle(3, 0x243943);
        this.add.rectangle(x, y + 25, 22, 18, 0x33424c);
      }

      xpComputer(x: number, y: number) {
        this.add.rectangle(x, y, 44, 28, 0x27333c).setStrokeStyle(3, 0x111a20);
        this.add.rectangle(x, y, 34, 19, 0x8db6c5).setStrokeStyle(2, 0x4d6972);
        this.add.rectangle(x, y + 24, 12, 4, 0x4b5961);
        this.add.rectangle(x + 25, y + 8, 8, 12, 0x65757d);
      }

      drawBongoRoom() {
        for (const [x, name, shirt, skin] of [
          [1075, "Charles", 0x3d9b78, 0x6b422f],
          [1175, "Prietto", 0x6b5fc4, 0x8a5a3b],
          [1275, "Dandara", 0x8ee85f, 0x5a3829],
        ] as [number, string, number, number][]) {
          this.desk(x, 470);
          this.xpComputer(x, 447);
          const member = avatar(this, x, 510, shirt, name, skin);
          member.setDepth(5);
        }
      }

      drawTeachersRoom() {
        for (const [x, name, shirt, skin] of [
          [790, "Prof. Niltes", 0x6b5fc4, 0x6b422f],
          [900, "Prof. Diego", 0x3d9b78, 0x8a5a3b],
        ] as [number, string, number, number][]) {
          this.desk(x, 150);
          this.xpComputer(x, 128);
          const teacher = avatar(this, x, 190, shirt, name, skin);
          teacher.setDepth(5);
        }
      }

      drawCafeteria() {
        this.add
          .text(1250, 65, "CANTINA / LANCHONETE", {
            fontFamily: "monospace",
            fontSize: "15px",
            color: "#fff8df",
            backgroundColor: "#8a603e",
            padding: { x: 8, y: 4 },
          })
          .setDepth(4);
        this.add.rectangle(1330, 180, 170, 38, 0xc88b5f).setStrokeStyle(3, 0x754c3b);
        this.add.rectangle(1270, 180, 28, 22, 0x394852);
        this.add.circle(1400, 180, 13, 0x4b8fd3);
        this.add
          .text(1330, 230, "CAFÉ  •  LANCHES", {
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#754c3b",
          })
          .setOrigin(0.5);
      }

      blocked(x: number, y: number) {
        const r = 10;
        const walls = [
          [0, 0, 1536, 16],
          [0, 1008, 1536, 16],
          [0, 0, 16, 1024],
          [1520, 0, 16, 1024],
          [0, 320, 650, 18],
          [900, 320, 636, 18],
          [0, 640, 380, 18],
          [1120, 640, 416, 18],
          [300, 0, 18, 300],
          [700, 0, 18, 300],
          [1000, 0, 18, 300],
          [300, 340, 18, 300],
          [900, 340, 18, 300],
          [1000, 340, 18, 300],
          [400, 650, 18, 374],
          [850, 650, 18, 374],
        ];
        return walls.some(
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
          safeSetPrompt("Você levantou");
          return;
        }

        // Check nearby NPC / Avatar
        const targetNpc = npcList.find(
          (npc) => Phaser.Math.Distance.Between(local!.x, local!.y, npc.x, npc.y) < 80
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
          (item) => Phaser.Math.Distance.Between(local!.x, local!.y, item.x, item.y) < 44
        );
        if (seat) {
          seated = true;
          occupiedSeat = seat;
          local.setPosition(seat.x, seat.y);
          safeSetPrompt("E — Levantar");
          return;
        }

        const d = doors.find(
          (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 115
        );
        if (d)
          safeSetPrompt(
            canEnter(d.team, propsRef.current.role, propsRef.current.teamSlug)
              ? `E — Entrar em ${d.label}`
              : `Missão exclusiva da Equipe ${d.team}`
          );
      }

      update(time: number, delta: number) {
        if (!local) return;

        // Render speaking wave animation on local avatar
        if (local.setSpeaking) {
          local.setSpeaking(isSpeakingRef.current);
        }

        if (seated && occupiedSeat) {
          local.setPosition(occupiedSeat.x, occupiedSeat.y);
          safeSetPrompt("E — Levantar");
          return;
        }

        // Automatic unstick algorithm: push out if inside wall
        if (this.blocked(local.x, local.y)) {
          for (let offset = 2; offset <= 30; offset += 2) {
            if (!this.blocked(local.x, local.y + offset)) {
              local.y += offset;
              break;
            }
            if (!this.blocked(local.x, local.y - offset)) {
              local.y -= offset;
              break;
            }
            if (!this.blocked(local.x + offset, local.y)) {
              local.x += offset;
              break;
            }
            if (!this.blocked(local.x - offset, local.y)) {
              local.x -= offset;
              break;
            }
          }
        }

        const ox = local.x;
        const oy = local.y;
        let dir = "down";

        // Movement step (260 px/s)
        const moveStep = (260 * delta) / 1000;
        const j = joystickRef.current;
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown || j.x < -0.18) {
          dx -= moveStep;
          dir = "left";
          targetPos = null;
        }
        if (this.cursors.right.isDown || this.keys.D.isDown || j.x > 0.18) {
          dx += moveStep;
          dir = "right";
          targetPos = null;
        }
        if (this.cursors.up.isDown || this.keys.W.isDown || j.y < -0.18) {
          dy -= moveStep;
          dir = "up";
          targetPos = null;
        }
        if (this.cursors.down.isDown || this.keys.S.isDown || j.y > 0.18) {
          dy += moveStep;
          dir = "down";
          targetPos = null;
        }

        // Pointer click-to-move
        if (dx === 0 && dy === 0 && targetPos) {
          const dist = Phaser.Math.Distance.Between(local.x, local.y, targetPos.x, targetPos.y);
          if (dist < 6) {
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

        // Predictive sliding collision check
        if (dx !== 0) {
          const nextX = Phaser.Math.Clamp(local.x + dx, 40, 1490);
          if (!this.blocked(nextX, local.y)) {
            local.x = nextX;
          } else {
            targetPos = null;
          }
        }
        if (dy !== 0) {
          const nextY = Phaser.Math.Clamp(local.y + dy, 50, 970);
          if (!this.blocked(local.x, nextY)) {
            local.y = nextY;
          } else {
            targetPos = null;
          }
        }

        // Throttled network update
        if ((local.x !== ox || local.y !== oy) && time - lastMoveTime > 40) {
          lastMoveTime = time;
          network.sendMove(local.x, local.y, dir);
        }

        // Soccer ball physics
        if (this.ball) {
          if (Math.abs(this.ballVelocity) + Math.abs(this.ballVertical) > 0.1) {
            this.ball.x += this.ballVelocity;
            this.ball.y += this.ballVertical;
            this.ballVelocity *= 0.985;
            this.ballVertical *= 0.985;
            if (this.ball.x > 410) {
              this.ball.x = 410;
              this.ballVelocity = -Math.abs(this.ballVelocity);
            }
            if (this.ball.x < 230) {
              this.ball.x = 230;
              this.ballVelocity = Math.abs(this.ballVelocity);
            }
            if (this.ball.y > 600) {
              this.ball.y = 600;
              this.ballVertical = -Math.abs(this.ballVertical);
            }
            if (this.ball.y < 520) {
              this.ball.y = 520;
              this.ballVertical = Math.abs(this.ballVertical);
            }
          } else {
            this.ballVelocity = 0;
            this.ballVertical = 0;
            if (
              this.ball.x <= 230 ||
              this.ball.x >= 410 ||
              this.ball.y <= 520 ||
              this.ball.y >= 600
            ) {
              this.ball.x = 320;
              this.ball.y = 560;
            }
          }
          if (Phaser.Math.Distance.Between(local.x, local.y, this.ball.x, this.ball.y) < 28) {
            this.ballVelocity = local.x < this.ball.x ? 4 : -4;
            this.ballVertical = local.y < this.ball.y ? 2 : -2;
            safeSetPrompt("Você chutou a bola");
          }
        }

        // Proximity prompts & target tracking
        const targetNpc = npcList.find(
          (npc) => Phaser.Math.Distance.Between(local!.x, local!.y, npc.x, npc.y) < 80
        );
        if (targetNpc) {
          setNearbyTarget(targetNpc);
          safeSetPrompt(`E — CONVERSAR COM ${targetNpc.name.toUpperCase()}`);
        } else {
          setNearbyTarget(null);
          const nearbySeat = meetingSeats.find(
            (item) => Phaser.Math.Distance.Between(local!.x, local!.y, item.x, item.y) < 44
          );
          if (nearbySeat) {
            safeSetPrompt("E — Sentar");
          } else {
            const d = doors.find(
              (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 115
            );
            safeSetPrompt(
              d
                ? canEnter(d.team, propsRef.current.role, propsRef.current.teamSlug)
                  ? `E — Entrar em ${d.label}`
                  : `Missão exclusiva da Equipe ${d.team}`
                : "Explore o Office · aproxime-se de uma pessoa · use WASD/Setas ou clique no mapa"
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
      render: { antialias: false },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: OfficeScene,
    });

    return () => {
      micStream.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      void network.leave();
      game.destroy(true);
    };
  }, []);

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
    <div className="relative h-full min-h-[560px] w-full overflow-hidden rounded-2xl border-4 border-[#315f4c] bg-[#92cba8]">
      <div ref={mountRef} className="absolute inset-0" />

      {/* PERMANENT SOCIAL HUD (Desktop & Mobile) */}
      <div className="absolute right-3 top-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-[#182333]/90 p-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
        {/* Online Status */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{online} Online</span>
        </div>

        {/* Microphone Toggle Control */}
        <button
          aria-label="Controle de Microfone"
          onClick={toggleMic}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
            micOn
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50"
          }`}
        >
          <span>{micOn ? "🎤 Mic: LIGADO" : "🎙️ Mic: MUTADO"}</span>
          {isSpeaking && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />}
        </button>

        {/* Audio Listening Control */}
        <button
          aria-label="Controle de Áudio"
          onClick={toggleAudio}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
            audioOn
              ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
              : "bg-amber-950/40 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50"
          }`}
        >
          <span>{audioOn ? "🔊 Áudio: OUVINDO" : "🔇 Áudio: SILENCIADO"}</span>
        </button>

        {/* Chat Toggle Control */}
        <button
          aria-label="Painel de Chat"
          onClick={() => setChatOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
            chatOpen
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50"
          }`}
        >
          <span>💬 Chat</span>
        </button>
      </div>

      {/* PROXIMITY INTERACTION BANNER (Desktop & Mobile) */}
      {nearbyTarget && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-2xl border-2 border-[#8ee85f] bg-[#182333]/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <div className="flex flex-col">
            <span className="text-xs text-[#8ee85f] font-mono uppercase tracking-wider">
              Pessoa Próxima
            </span>
            <span className="font-bold text-sm">
              {nearbyTarget.name} • {nearbyTarget.role}
            </span>
          </div>
          <button
            onClick={() => {
              if (nearbyTarget.isNia) {
                propsRef.current.onNiaInteract?.();
              } else {
                setInteractionModal(nearbyTarget);
              }
            }}
            className="rounded-xl bg-[#8ee85f] px-4 py-2 text-xs font-extrabold text-[#10160e] shadow-lg hover:bg-[#a6f07b] transition-transform active:scale-95"
          >
            [ CONVERSAR COM {nearbyTarget.name.toUpperCase()} ]
          </button>
        </div>
      )}

      {/* PLAYER INTERACTION MODAL / CARD */}
      {interactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border-2 border-emerald-500/40 bg-[#182333] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-lg">{interactionModal.name}</h3>
                  <p className="text-xs text-emerald-400 font-mono">{interactionModal.role}</p>
                </div>
              </div>
              <button
                onClick={() => setInteractionModal(null)}
                className="rounded-full bg-white/10 p-1.5 text-xs text-white/70 hover:bg-white/20"
              >
                ✖
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs text-white/80">
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50">Equipe / Setor:</span>
                <span className="font-bold text-white uppercase">{interactionModal.team}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50">AudioZone:</span>
                <span className="font-bold text-emerald-400">Ativa (Área Central)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (!micOn) toggleMic();
                  setInteractionModal(null);
                }}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
              >
                🎤 Iniciar / Entrar na Conversa por Voz
              </button>
              <button
                onClick={() => {
                  setChatOpen(true);
                  setInteractionModal(null);
                }}
                className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-purple-500 active:scale-95 transition-all"
              >
                💬 Enviar Mensagem no Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM PROMPT BAR */}
      <div className="absolute bottom-4 left-4 rounded-xl bg-[#182333]/90 px-4 py-2 text-sm font-bold text-white shadow-lg border border-white/10">
        {prompt}
      </div>

      {/* CONTEXTUAL CHAT PANEL */}
      {chatOpen && (
        <div className="absolute right-3 top-16 w-80 max-w-[90vw] rounded-2xl border border-white/20 bg-[#182333]/95 p-4 text-xs text-white shadow-2xl backdrop-blur-xl z-30">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-sm tracking-wide text-purple-300">💬 CHAT CONTEXTUAL</span>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70 hover:bg-white/20"
            >
              ✖
            </button>
          </div>

          {/* CHAT CHANNELS TABS */}
          <div className="mb-3 flex gap-1 rounded-xl bg-black/30 p-1">
            <button
              onClick={() => setChatTab("area")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "area" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              🌐 ÁREA
            </button>
            <button
              onClick={() => setChatTab("team")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "team" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              🛡️ EQUIPE
            </button>
            <button
              onClick={() => setChatTab("meeting")}
              className={`flex-1 rounded-lg py-1.5 font-bold transition-all ${
                chatTab === "meeting" ? "bg-purple-600 text-white shadow" : "text-white/60 hover:text-white"
              }`}
            >
              👥 REUNIÃO
            </button>
          </div>

          {/* CHAT MESSAGES DISPLAY */}
          <div className="mb-3 h-48 overflow-y-auto space-y-2 rounded-xl bg-black/20 p-2.5 border border-white/5">
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-white/40 italic">
                Nenhuma mensagem neste canal ainda.
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-white/5 p-2">
                  <div className="flex justify-between font-bold text-[#8ee85f] mb-0.5">
                    <span>{msg.name}</span>
                    <span className="text-[10px] text-white/40">
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

          {/* CHAT INPUT FORM */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Mensagem em ${
                chatTab === "area" ? "Área" : chatTab === "team" ? "Equipe" : "Reunião"
              }...`}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-purple-400 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="rounded-xl bg-purple-600 px-3 py-2 font-bold text-white hover:bg-purple-500 active:scale-95 transition-all"
            >
              Enviar
            </button>
          </div>

          <div className="mt-2 text-[10px] text-white/50 text-center">
            🔒 Mensagens privadas entre alunos desativadas nesta versão.
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
