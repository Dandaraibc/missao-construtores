"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Preencha o nome e a senha.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao entrar.");
        setLoading(false);
        return;
      }
      localStorage.setItem("missao-user", JSON.stringify(data.user));
      router.push("/campus");
    } catch {
      setError("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  };

  const handleVisitorLogin = () => {
    const guestUser = {
      id: "visitor-" + Date.now(),
      name: "Visitante Feira",
      role: "VISITOR",
      teamId: "pesquisa",
    };
    localStorage.setItem("missao-user", JSON.stringify(guestUser));
    router.push("/campus");
  };

  const setPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#141e2b] flex flex-col items-center justify-center px-4 py-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#182333]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs mb-3 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Colégio 24 de Maio · Ubongo
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Missão Construtores
          </h1>
          <p className="text-xs text-white/60">
            Ambiente Virtual Interativo Carbono Zero
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-950/60 border border-rose-500/50 p-3 text-xs text-rose-300 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/70 block mb-1">Usuário / Login:</label>
            <input
              type="text"
              placeholder="ex: niltes, diego, prietto, adrianno"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/70 block mb-1">Senha:</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 font-extrabold text-white hover:bg-emerald-500 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-wider"
          >
            {loading ? "Entrando..." : "Entrar no Campus Virtual"}
          </button>
        </form>

        {/* Quick Presets for Demo / QA */}
        <div className="mt-6 pt-4 border-t border-white/10 text-xs">
          <span className="text-white/40 font-bold block mb-2 text-center uppercase tracking-wider text-[10px]">
            Atalhos Rápidos de Login (Seeds)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPreset("niltes", "Nilt26")}
              className="rounded-lg bg-white/5 p-2 text-left hover:bg-white/10 transition-all"
            >
              <div className="font-bold text-purple-300">Prof. Niltes</div>
              <div className="text-[10px] text-white/40">Professora</div>
            </button>

            <button
              onClick={() => setPreset("prietto", "Prie52")}
              className="rounded-lg bg-white/5 p-2 text-left hover:bg-white/10 transition-all"
            >
              <div className="font-bold text-blue-300">Prietto</div>
              <div className="text-[10px] text-white/40">Ubongo Admin</div>
            </button>

            <button
              onClick={() => setPreset("dandara", "Danda64")}
              className="rounded-lg bg-white/5 p-2 text-left hover:bg-white/10 transition-all"
            >
              <div className="font-bold text-emerald-300">Dandara</div>
              <div className="text-[10px] text-white/40">Ubongo Admin</div>
            </button>

            <button
              onClick={() => setPreset("adrianno", "Adri27")}
              className="rounded-lg bg-white/5 p-2 text-left hover:bg-white/10 transition-all"
            >
              <div className="font-bold text-amber-300">Adrianno</div>
              <div className="text-[10px] text-white/40">Aluno</div>
            </button>
          </div>
        </div>

        {/* Visitor Mode Button */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={handleVisitorLogin}
            className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all text-center"
          >
            🚶 Entrar como Visitante (Visitor Mode)
          </button>

          <Link
            href="/avatar"
            className="text-center text-xs text-emerald-400 hover:underline pt-1 font-semibold"
          >
            🎨 Customizar Avatar / Perfil ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
