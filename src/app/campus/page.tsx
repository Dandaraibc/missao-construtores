"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NiaVoiceStreamButton from "@/components/nia/NiaVoiceStreamButton";

const VirtualCampus = dynamic(() => import("@/components/game/VirtualCampus"), { ssr: false });

export default function CampusPage() {
  const router = useRouter();
  const [niaOpen, setNiaOpen] = useState(false);
  const [niaMessage, setNiaMessage] = useState("");
  const [niaReply, setNiaReply] = useState("");
  const [niaLoading, setNiaLoading] = useState(false);

  const [user, setUser] = useState<{ id: string; name: string; role: string; teamId?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // 1. Tentar pegar o usuário pela sessão real no backend
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Não autenticado");
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          checkLocalFallback();
        }
      })
      .catch(() => {
        checkLocalFallback();
      })
      .finally(() => {
        setLoadingUser(false);
      });

    function checkLocalFallback() {
      // Fallback para visitante / dev local se permitido
      const raw = localStorage.getItem("missao-user");
      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        const avatarRaw = localStorage.getItem("missao-avatar");
        if (avatarRaw) {
          const parsed = JSON.parse(avatarRaw);
          setUser({ id: "local-user", name: parsed.name || "Visitante", role: "STUDENT", teamId: parsed.teamSlug || "pesquisa" });
        } else {
          router.push("/");
        }
      }
    }
  }, [router]);

  if (loadingUser) {
    return <div className="min-h-screen bg-[#080c12] flex items-center justify-center text-[#8ee85f] font-mono">Carregando HUD...</div>;
  }

  const name = user?.name || "Visitante Feira";
  const role = (user?.role as "STUDENT" | "TEACHER" | "UBONGO_ADMIN" | "SUPER_ADMIN" | "VISITOR") || "STUDENT";
  const teamSlug = user?.teamId || "pesquisa";

  const niaText = `Olá, ${name}. Eu sou a NIA, assistente virtual da Ubongo no Missão Construtores!`;

  async function askNia() {
    if (!niaMessage.trim()) return;
    setNiaLoading(true);
    try {
      const response = await fetch("/api/nia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: niaMessage,
          context: {
            projectId: "missao-construtores",
            userId: user?.id || "local",
            role: role,
            teamId: teamSlug,
            currentRoom: "Campus Central",
            permissions: [],
          },
        }),
      });
      const data = await response.json();
      setNiaReply(data.reply || data.error || "Não consegui responder agora.");
      setNiaMessage("");
    } catch {
      setNiaReply("Olá! Sou a NIA, assistente da Ubongo. Estou aqui para ajudar sua equipe no Missão Construtores!");
    } finally {
      setNiaLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080c12] p-2 text-white sm:p-4">
      <div className="mx-auto max-w-[1700px]">
        <div className="grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)_290px]">
          {/* Left Sidebar */}
          <aside className="hidden space-y-2 lg:block">
            <div className="rounded-2xl border border-white/20 bg-[#111923] p-4">
              <div className="text-2xl font-black tracking-tight text-[#f4f0df]">ubongo</div>
              <div className="text-xs text-[#8ee85f]">office virtual 2d</div>
              <div className="mt-4 text-sm font-bold">
                Bem-vindo(a), <span className="text-[#8ee85f]">{name}</span>
              </div>
              <div className="mt-1 text-xs text-white/50 font-mono">Role: {role}</div>
              <div className="mt-3 rounded-xl bg-white/5 p-2.5 text-xs font-bold text-[#8ee85f] border border-white/10">
                Equipe {teamSlug.toUpperCase()}
              </div>
            </div>

            <nav className="rounded-2xl border border-white/20 bg-[#111923] p-3 text-xs">
              <div className="mb-2 text-[10px] font-extrabold text-[#8ee85f] uppercase tracking-wider">
                NAVEGAÇÃO RÁPIDA
              </div>
              <Link href="/campus" className="block rounded-xl bg-[#8ee85f]/20 px-3 py-2 font-bold text-[#8ee85f] mb-1">
                Campus Office 2D
              </Link>
              <Link href={`/equipe/${teamSlug}`} className="block rounded-xl px-3 py-2 text-white/80 hover:bg-white/10 mb-1">
                Painel da Minha Equipe
              </Link>
              <Link href="/avatar" className="block rounded-xl px-3 py-2 text-white/80 hover:bg-white/10 mb-1">
                Customizar Avatar
              </Link>
              {(role === "TEACHER" || role === "UBONGO_ADMIN" || role === "SUPER_ADMIN") && (
                <Link href="/admin" className="block rounded-xl bg-purple-600/30 border border-purple-400/40 px-3 py-2 font-bold text-purple-300">
                  Painel do Professor
                </Link>
              )}
            </nav>
          </aside>

          {/* Center Main Stage */}
          <section className="min-w-0">
            <header className="mb-2 flex items-center justify-between rounded-2xl border border-white/20 bg-[#111923] px-4 py-2.5">
              <div>
                <h1 className="font-extrabold text-base tracking-wide text-white">MISSÃO CONSTRUTORES</h1>
                <p className="text-xs text-white/50">Escritório Virtual Interativo - Feira Carbono Zero</p>
              </div>
              <div className="flex items-center gap-2">
                <NiaVoiceStreamButton text={niaText} className="rounded-xl bg-[#8ee85f] px-3.5 py-2 text-xs font-black text-[#10160e] shadow-lg hover:bg-[#a6f07b] transition-all" />
              </div>
            </header>

            <div className="h-[calc(100vh-190px)] min-h-[560px]">
              <VirtualCampus
                displayName={name}
                role={role}
                teamSlug={teamSlug}
                userId={user?.id || "local"}
                onNiaInteract={() => setNiaOpen(true)}
              />
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="hidden space-y-2 lg:block">
            <div className="rounded-2xl border border-[#8ee85f]/40 bg-[#111923] p-4">
              <div className="text-sm font-black text-[#8ee85f] uppercase tracking-wider">AGENTE NIA UBONGO</div>
              <p className="mt-2 text-xs text-white/70">
                Aproxime-se da NIA no mapa para tirar dúvidas pedagógicas sobre a feira e suas missões.
              </p>
              <button
                onClick={() => setNiaOpen(true)}
                className="mt-3 w-full rounded-xl bg-[#8ee85f] py-2.5 font-extrabold text-[#10160e] hover:bg-[#a6f07b] transition-all text-xs"
              >
                Falar com NIA
              </button>
            </div>

            <div className="rounded-2xl border border-white/20 bg-[#111923] p-4">
              <div className="mb-3 text-sm font-bold text-[#8ee85f]">ÁREA DE JOGOS & CAFÉ</div>
              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <div className="font-bold text-emerald-300">Futebol 2D</div>
                  <div className="text-[10px] text-white/50">Campo no mapa central</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <div className="font-bold text-emerald-300">Ping-Pong 2D</div>
                  <div className="text-[10px] text-white/50">Mesa na área de jogos</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                  <div className="font-bold text-amber-300">Café da Ubongo</div>
                  <div className="text-[10px] text-white/50">Bônus de velocidade na cantina</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* NIA Modal */}
      {niaOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-3xl border border-[#8ee85f]/40 bg-[#111923]/95 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#8ee85f]">NIA - Consultora Ubongo</h2>
                <p className="text-[11px] text-white/50">IA imersiva do Missão Construtores</p>
              </div>
              <button onClick={() => setNiaOpen(false)} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/20">
                Fechar
              </button>
            </div>

            {niaReply && (
              <div className="mb-4 rounded-2xl bg-white/10 p-3.5 text-xs leading-relaxed border border-white/10">
                {niaReply}
                <div className="mt-2">
                  <NiaVoiceStreamButton text={niaReply} className="rounded-lg bg-[#8ee85f]/20 border border-[#8ee85f]/40 px-3 py-1.5 text-[11px] font-bold text-[#8ee85f]" />
                </div>
              </div>
            )}

            <textarea
              value={niaMessage}
              onChange={(event) => setNiaMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void askNia();
                }
              }}
              placeholder="Pergunte sobre as missões da sua equipe..."
              className="min-h-24 w-full rounded-2xl border border-white/20 bg-black/40 p-3 text-xs text-white placeholder-white/40 focus:border-[#8ee85f] focus:outline-none"
            />

            <button
              disabled={niaLoading}
              onClick={() => void askNia()}
              className="mt-3 w-full rounded-2xl bg-[#8ee85f] py-3 font-extrabold text-[#10160e] hover:bg-[#a6f07b] transition-all text-xs shadow-lg"
            >
              {niaLoading ? "Pensando..." : "Enviar Pergunta"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
