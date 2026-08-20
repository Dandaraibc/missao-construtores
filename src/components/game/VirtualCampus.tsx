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
  const promptRef = useRef("Explore o Office · aproxime-se de uma porta ou pessoa");
  const [prompt, setPrompt] = useState("Explore o Office · aproxime-se de uma porta ou pessoa");
  const [online, setOnline] = useState(1);
  const [micOn, setMicOn] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState(() =>
    typeof window === "undefined" ? [] : getChat("area").slice(-20)
  );
  const micStream = useRef<MediaStream | null>(null);

  const safeSetPrompt = (msg: string) => {
    if (promptRef.current !== msg) {
      promptRef.current = msg;
      setPrompt(msg);
    }
  };

  const sendMessage = () => {
    if (!chatText.trim()) return;
    sendChatMessage("area", userId, displayName, chatText.trim());
    setChatText("");
    setChatMessages(getChat("area").slice(-20));
  };

  const toggleMic = async () => {
    if (micOn) {
      micStream.current?.getTracks().forEach((track) => {
        track.enabled = false;
      });
      setMicOn(false);
      return;
    }
    try {
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current.getTracks().forEach((track) => {
        track.enabled = true;
      });
      setMicOn(true);
    } catch {
      safeSetPrompt("Microfone bloqueado · conceda permissão no navegador para falar");
    }
  };

  const toggleAudio = () => setAudioOn((value) => !value);

  useEffect(() => {
    if (!mountRef.current) return;
    const network = new MultiplayerClient();
    const remotes = new Map<string, Phaser.GameObjects.Container>();
    let local: Phaser.GameObjects.Container | undefined;
    let seated = false;
    let occupiedSeat: { x: number; y: number } | undefined;
    let lastMoveTime = 0;

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

        local = avatar(this, 760, 520, 0xf26b5b, displayName);
        this.cameras.main.startFollow(local, true, 0.1, 0.1);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys("W,A,S,D,E") as Record<
          string,
          Phaser.Input.Keyboard.Key
        >;
        this.input.keyboard!.on("keydown-E", () => this.interact());

        void network
          .join("office", "", { userId, displayName, teamSlug })
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
        const r = 12;
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
        if (Phaser.Math.Distance.Between(local.x, local.y, this.nia.x, this.nia.y) < 80) {
          onNiaInteract?.();
          return;
        }
        const d = doors.find(
          (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 115
        );
        if (d)
          safeSetPrompt(
            canEnter(d.team, role, teamSlug)
              ? `E — Entrar em ${d.label}`
              : `Missão exclusiva da Equipe ${d.team}`
          );
      }

      update(time: number, delta: number) {
        if (!local) return;

        if (seated && occupiedSeat) {
          local.setPosition(occupiedSeat.x, occupiedSeat.y);
          safeSetPrompt("E — Levantar");
          return;
        }

        const ox = local.x;
        const oy = local.y;
        let dir = "down";

        // Delta-based movement speed (240 pixels per second)
        const moveStep = (240 * delta) / 1000;
        const j = joystickRef.current;
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown || j.x < -0.18) {
          dx -= moveStep;
          dir = "left";
        }
        if (this.cursors.right.isDown || this.keys.D.isDown || j.x > 0.18) {
          dx += moveStep;
          dir = "right";
        }
        if (this.cursors.up.isDown || this.keys.W.isDown || j.y < -0.18) {
          dy -= moveStep;
          dir = "up";
        }
        if (this.cursors.down.isDown || this.keys.S.isDown || j.y > 0.18) {
          dy += moveStep;
          dir = "down";
        }

        // Predictive smooth collision sliding: check X and Y separately
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

        // Throttled network updates (max 25 updates / sec)
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

        // Proximity prompts
        const nearbySeat = meetingSeats.find(
          (item) => Phaser.Math.Distance.Between(local!.x, local!.y, item.x, item.y) < 44
        );
        if (nearbySeat) {
          safeSetPrompt("E — Sentar");
        } else if (Phaser.Math.Distance.Between(local.x, local.y, this.nia.x, this.nia.y) < 80) {
          safeSetPrompt("E — Falar com a NIA");
        } else {
          const d = doors.find(
            (v) => Phaser.Math.Distance.Between(local!.x, local!.y, v.x, v.y) < 115
          );
          safeSetPrompt(
            d
              ? canEnter(d.team, role, teamSlug)
                ? `E — Entrar em ${d.label}`
                : `Missão exclusiva da Equipe ${d.team}`
              : "Explore o Office · aproxime-se de uma porta ou pessoa"
          );
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
      void network.leave();
      game.destroy(true);
    };
  }, [displayName, role, teamSlug, userId]);

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
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-xl bg-[#182333]/90 px-3 py-2 text-xs text-white shadow-lg">
        <span>{online} online</span>
        <span>mundo compartilhado</span>
        <button aria-label="microfone" onClick={toggleMic}>
          {micOn ? "MIC" : "MIC off"}
        </button>
        <button aria-label="áudio" onClick={toggleAudio}>
          {audioOn ? "ÁUDIO" : "ÁUDIO off"}
        </button>
        <button aria-label="chat" onClick={() => setChatOpen((value) => !value)}>
          CHAT
        </button>
      </div>
      <div className="absolute bottom-4 left-4 rounded-xl bg-[#182333]/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
        {prompt}
      </div>
      {chatOpen && (
        <div className="absolute right-3 top-14 w-64 rounded-xl border border-white/20 bg-[#182333]/95 p-3 text-xs text-white shadow-xl">
          <div className="mb-2 font-bold">CHAT CONTEXTUAL</div>
          <div className="mb-3 flex gap-2">
            <button className="rounded bg-white/15 px-2 py-1">Área</button>
            <button className="rounded bg-white/15 px-2 py-1">Equipe</button>
            <button className="rounded bg-white/15 px-2 py-1">Reunião</button>
          </div>
          <div className="text-white/70">
            Aproxime-se de alguém para conversar. Mensagens privadas entre alunos estão desativadas.
          </div>
        </div>
      )}
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
        className="absolute bottom-8 right-8 h-16 w-16 rounded-full border border-white/30 bg-[#8ee85f] font-bold text-[#10160e] shadow-xl sm:hidden"
        onClick={() => key("e")}
      >
        E
      </button>
    </div>
  );
}
