"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { teams } from "@/data/teams";
import type { CollectiveProgress } from "@/types";
import { getCollectiveProgress, getOverallProgress } from "@/lib/progress";
import RoomPanel from "@/components/RoomPanel";

interface AvatarData {
  name: string;
  teamSlug?: string;
  studentId?: string;
  skinTone?: string;
  outfit?: string;
}

const TILE = 32;

const ROOMS = [
  { id: "lobby", name: "Lobby", x: 10, y: 1, w: 8, h: 4, color: "#E8F6F0", type: "info" as const },
  { id: "ubongo", name: "Sala Ubongo", x: 1, y: 6, w: 6, h: 5, color: "#D1FAE5", type: "info" as const },
  { id: "reuniao", name: "Sala de Reunião", x: 9, y: 6, w: 8, h: 5, color: "#EDE7DC", type: "info" as const },
  { id: "professora", name: "Sala da Professora", x: 19, y: 6, w: 6, h: 5, color: "#DBEAFE", type: "info" as const },
  { id: "pesquisa", name: "Pesquisa", x: 1, y: 13, w: 5, h: 6, color: "#A7F3D0", type: "team" as const, teamSlug: "pesquisa", icon: "🔬" },
  { id: "produto", name: "Produto", x: 7, y: 13, w: 5, h: 6, color: "#BFDBFE", type: "team" as const, teamSlug: "produto", icon: "🗺️" },
  { id: "design", name: "Design", x: 13, y: 13, w: 5, h: 6, color: "#DDD6FE", type: "team" as const, teamSlug: "design", icon: "🎨" },
  { id: "testes", name: "Testes", x: 19, y: 13, w: 5, h: 6, color: "#FECACA", type: "team" as const, teamSlug: "testes", icon: "🐞" },
  { id: "comunicacao", name: "Comunicação", x: 25, y: 13, w: 5, h: 6, color: "#FED7AA", type: "team" as const, teamSlug: "comunicacao", icon: "📢" },
  { id: "lazer", name: "Área de Lazer", x: 8, y: 21, w: 14, h: 5, color: "#ECFDF5", type: "lazer" as const },
];

const INTERACTIVES = [
  { id: "lia", label: "Lia", kind: "person", icon: "🧑🏽‍🚀", x: 20, y: 36, w: 8, h: 12, detail: "Disponível para conversar" },
  { id: "ravi", label: "Ravi", kind: "person", icon: "👨🏾‍💻", x: 45, y: 42, w: 8, h: 12, detail: "Trabalhando em Produto" },
  { id: "bia", label: "Bia", kind: "person", icon: "👩🏻‍🎨", x: 66, y: 42, w: 8, h: 12, detail: "Em foco · Design" },
  { id: "theo", label: "Theo", kind: "person", icon: "🧑🏾‍🔬", x: 78, y: 69, w: 8, h: 12, detail: "Disponível para conversar" },
  { id: "computadores", label: "Bancada de computadores", kind: "object", icon: "🖥️", x: 42, y: 28, w: 30, h: 17, detail: "Clique para abrir a estação de trabalho da equipe." },
  { id: "sofa", label: "Sofá da convivência", kind: "object", icon: "🛋️", x: 70, y: 20, w: 18, h: 20, detail: "Área livre para conversar e descansar." },
  { id: "biblioteca", label: "Biblioteca", kind: "object", icon: "📚", x: 8, y: 60, w: 16, h: 27, detail: "Materiais e referências da Missão Carbono Zero." },
  { id: "mesa", label: "Mesa de reunião", kind: "object", icon: "🗣️", x: 45, y: 73, w: 24, h: 17, detail: "Reúna sua equipe para alinhar a próxima missão." },
];

export default function MapaPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<AvatarData | null>(null);
  const [pos, setPos] = useState({ x: 12, y: 3 });
  const [collective, setCollective] = useState<CollectiveProgress>({ pesquisa: 0, produto: 0, design: 0, testes: 0, comunicacao: 0 });
  const [overall, setOverall] = useState(0);
  const [activeRoom, setActiveRoom] = useState<(typeof ROOMS)[0] | null>(null);
  const [activeObject, setActiveObject] = useState<(typeof INTERACTIVES)[0] | null>(null);
  const [nearbyObject, setNearbyObject] = useState<(typeof INTERACTIVES)[0] | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("missao-avatar");
    if (!saved) {
      router.push("/avatar");
      return;
    }
    setAvatar(JSON.parse(saved));
    setCollective(getCollectiveProgress());
    setOverall(getOverallProgress());
  }, [router]);

  const getRoomAt = useCallback((x: number, y: number) => {
    return ROOMS.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeRoom) return; // don't move while in room panel
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", "e", "E"].includes(e.key)) {
        e.preventDefault();
      }

      setPos((prev) => {
        let { x, y } = prev;
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") y = Math.max(0, y - 1);
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") y = Math.min(26, y + 1);
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") x = Math.max(0, x - 1);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") x = Math.min(30, x + 1);
        return { x, y };
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeRoom]);

  useEffect(() => {
    if (activeRoom) return;
    const room = getRoomAt(pos.x, pos.y);
    if (room) {
      setHint(`E → Entrar em ${room.name}`);
    } else {
      setHint(null);
    }
  }, [pos, getRoomAt, activeRoom]);

  useEffect(() => {
    const closest = INTERACTIVES.map((item) => ({ item, distance: Math.hypot(pos.x - (item.x / 100) * 31, pos.y - (item.y / 100) * 27) }))
      .filter(({ distance }) => distance < 4)
      .sort((a, b) => a.distance - b.distance)[0];
    setNearbyObject(closest?.item || null);
  }, [pos]);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (activeRoom) return;
      if (e.key === "x" || e.key === "X") {
        if (nearbyObject) setActiveObject(nearbyObject);
        return;
      }
      if (e.key === "e" || e.key === "E") {
        const room = getRoomAt(pos.x, pos.y);
        if (room) setActiveRoom(room);
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [pos, getRoomAt, activeRoom, nearbyObject]);

  if (!avatar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <p className="text-[#1C1C1C]/50">Carregando mapa...</p>
      </div>
    );
  }

  const myTeam = avatar.teamSlug
    ? teams.find((t) => t.slug === avatar.teamSlug)
    : null;

  const studentId = avatar.studentId || "guest-" + avatar.name;

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col overflow-hidden">
      <header className="h-16 shrink-0 bg-[#1b2333] border-b border-white/10 px-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#f26b5b] flex items-center justify-center font-black">MC</div><div><p className="font-bold tracking-tight">Missão Construtores</p><p className="text-[11px] text-white/45">Escritório virtual · Colégio 24 de Maio</p></div></div>
        <div className="flex items-center gap-6"><div className="hidden sm:block text-right"><p className="text-[10px] uppercase tracking-wider text-white/40">Construção coletiva</p><div className="flex items-center gap-2"><div className="w-28 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-[#55d6be]" style={{width:`${overall}%`}} /></div><span className="text-xs font-bold text-[#55d6be]">{overall}%</span></div></div><button onClick={() => router.push('/avatar')} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15"><span className="w-7 h-7 rounded-full bg-[#f2b880] text-[#382319] flex items-center justify-center text-xs font-bold">{avatar.name.charAt(0).toUpperCase()}</span><span className="text-xs font-semibold">{avatar.name}</span><span className="text-white/40">⌄</span></button></div>
      </header>

      <div className="flex-1 min-h-0 flex">
        <aside className="hidden lg:flex w-56 shrink-0 bg-[#171e2d] border-r border-white/10 p-4 flex-col gap-5">
          <div><p className="text-[10px] uppercase tracking-[.18em] text-white/35 mb-3">Seu espaço</p><button className="w-full text-left rounded-xl bg-[#2b374d] px-3 py-3 flex items-center gap-3"><span className="text-xl">🏫</span><span><b className="block text-sm">Escola Carbono Zero</b><small className="text-[10px] text-white/45">Sala principal</small></span></button></div>
          <div><p className="text-[10px] uppercase tracking-[.18em] text-white/35 mb-3">Pessoas online <span className="text-[#55d6be]">● 6</span></p><div className="space-y-2">{['Lia','Ravi','Bia','Theo'].map((name,i)=><div key={name} className="flex items-center gap-2 text-xs"><span className={`w-7 h-7 rounded-lg flex items-center justify-center ${['bg-[#f2b880]','bg-[#8bd0ce]','bg-[#dca6e8]','bg-[#f4cf74]'][i]}`}>{['🧑🏽','👩🏻','🧑🏼','👨🏾'][i]}</span><span className="text-white/75">{name}</span><span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#55d6be]" /></div>)}</div></div>
          <div className="mt-auto rounded-xl bg-[#222d40] p-3"><p className="text-[10px] text-white/40 mb-1">Atalhos</p><p className="text-xs text-white/65"><kbd>WASD</kbd> mover</p><p className="text-xs text-white/65 mt-1"><kbd>E</kbd> entrar na sala</p></div>
        </aside>

        <main className="flex-1 min-w-0 relative overflow-auto p-4 sm:p-7 bg-[#202b3c]">
          <div onDoubleClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setPos({ x: Math.max(0, Math.min(30, Math.round(((event.clientX - rect.left) / rect.width) * 31))), y: Math.max(0, Math.min(26, Math.round(((event.clientY - rect.top) / rect.height) * 27))) }); }} className="mx-auto max-w-[1120px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative aspect-[2190/1873]" style={{backgroundColor:'#b9d6c5',backgroundImage:"url('/gather-office-map.png')",backgroundSize:'cover',backgroundPosition:'center',imageRendering:'pixelated'}}>
            <div className="absolute top-4 left-5 rounded-lg bg-[#f7f2df] border-2 border-[#486d5d] px-3 py-1.5 text-[#263d35] shadow-md text-xs font-black tracking-wide">🌿 CAMPUS UBONGO</div>
            {ROOMS.map((room) => { const pct = room.type === 'team' && room.teamSlug ? collective[room.teamSlug as keyof CollectiveProgress] || 0 : null; const isMyTeam = room.teamSlug === avatar.teamSlug; return <button key={room.id} onClick={() => setActiveRoom(room)} aria-label={`Entrar em ${room.name}`} className="absolute group flex flex-col items-center justify-center transition-all hover:bg-black/10 hover:backdrop-blur-[1px]" style={{left:`${(room.x/31)*100}%`,top:`${(room.y/27)*100}%`,width:`${(room.w/31)*100}%`,height:`${(room.h/27)*100}%`,backgroundColor:'rgba(255,255,255,.015)',border:isMyTeam?'3px solid #f26b5b':'2px solid transparent',borderRadius:8}}><span className="opacity-0 group-hover:opacity-100 rounded-full bg-[#182333]/90 text-white px-2 py-1 text-[10px] font-bold shadow-lg">{room.name}{pct !== null ? ` · ${pct}%` : ''}</span>{isMyTeam && <span className="absolute -top-3 rounded-full bg-[#f26b5b] text-white px-2 py-0.5 text-[9px] font-black">SUA EQUIPE</span>}</button> })}
            {INTERACTIVES.map((item) => <button key={item.id} onClick={() => setActiveObject(item)} aria-label={`Interagir com ${item.label}`} className="absolute z-10 rounded-lg border-2 border-transparent hover:border-[#f26b5b] hover:bg-[#f26b5b]/15 transition-all group" style={{left:`${item.x}%`,top:`${item.y}%`,width:`${item.w}%`,height:`${item.h}%`}}><span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 whitespace-nowrap rounded-full bg-[#182333]/95 text-white px-2 py-1 text-[10px] font-bold shadow-lg">{item.icon} {item.label}</span></button>)}
            {[['🌱',18,26],['🧑🏽‍🚀',43,32],['👩🏻‍🎨',68,28],['🧑🏾‍🔬',80,66]].map(([emoji,x,y])=><div key={`${x}-${y}`} className="absolute text-3xl drop-shadow-md animate-pulse" style={{left:`${x}%`,top:`${y}%`}}>{emoji}</div>)}
            <div className="absolute z-20 flex flex-col items-center transition-all duration-100" style={{left:`${(pos.x/31)*100}%`,top:`${(pos.y/27)*100}%`}}><div className="-translate-x-1/2 relative w-8 h-10 bg-[#f26b5b] border-2 border-[#182333] shadow-[3px_3px_0_rgba(0,0,0,.35)] flex items-center justify-center text-xs font-black" style={{imageRendering:'pixelated'}}><span className="absolute -top-3 w-6 h-5 rounded-t-md bg-[#20242d] border-2 border-[#182333]" />{avatar.name.charAt(0).toUpperCase()}</div><div className="-translate-x-1/2 mt-1 bg-[#182333] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow">Você · {avatar.name}</div></div>
          </div>
          <div className="mx-auto max-w-[1120px] mt-4 flex items-center justify-between"><div className="text-xs text-white/50">WASD/setas: andar · duplo clique: caminhar · X: interagir</div>{(nearbyObject || hint) && <div className="rounded-full bg-[#f26b5b] px-4 py-2 text-xs font-bold shadow-lg">{nearbyObject ? `X · ${nearbyObject.label}` : hint}</div>}<div className="flex gap-2"><button className="w-9 h-9 rounded-lg bg-[#344258] hover:bg-[#40516b]">🔊</button><button className="w-9 h-9 rounded-lg bg-[#344258] hover:bg-[#40516b]">💬</button><button className="w-9 h-9 rounded-lg bg-[#344258] hover:bg-[#40516b]">⚙️</button></div></div>
        </main>
      </div>

      <div className="h-14 shrink-0 bg-[#171e2d] border-t border-white/10 px-5 flex items-center justify-center text-xs text-white/45">Clique em uma sala para conversar com quem está lá · entre no portal da sua equipe para continuar as missões</div>

      {activeObject && <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/45 p-4" onClick={() => setActiveObject(null)}><div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202b3c] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start gap-3"><div className="w-12 h-12 rounded-xl bg-[#f26b5b] flex items-center justify-center text-2xl">{activeObject.icon}</div><div><p className="text-lg font-bold">{activeObject.label}</p><p className="text-xs text-white/45">{activeObject.kind === 'person' ? 'Pessoa no escritório' : 'Objeto interativo'}</p></div><button className="ml-auto text-white/45 hover:text-white" onClick={() => setActiveObject(null)}>✕</button></div><p className="mt-4 text-sm text-white/70">{activeObject.detail}</p><div className="mt-5 flex gap-2">{activeObject.kind === 'person' ? <><button className="flex-1 rounded-xl bg-[#f26b5b] py-2.5 text-sm font-bold" onClick={() => setActiveObject(null)}>💬 Conversar</button><button className="rounded-xl bg-white/10 px-4 text-sm" onClick={() => setActiveObject(null)}>👋 Acenar</button></> : <button className="flex-1 rounded-xl bg-[#55d6be] py-2.5 text-sm font-bold text-[#122b2b]" onClick={() => { setActiveObject(null); setHint('Interação iniciada · aproxime-se para continuar'); }}>Interagir com objeto</button>}</div></div></div>}

      {/* Room interaction panel */}
      {activeRoom && (
        <RoomPanel
          roomId={activeRoom.id}
          roomName={activeRoom.name}
          studentId={studentId}
          studentName={avatar.name}
          teamSlug={avatar.teamSlug}
          hasPortal={activeRoom.type === "team"}
          onClose={() => setActiveRoom(null)}
          onEnterPortal={
            activeRoom.type === "team" && activeRoom.teamSlug
              ? () => router.push(`/equipe/${activeRoom.teamSlug}`)
              : undefined
          }
        />
      )}
    </div>
  );
}
