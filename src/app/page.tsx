"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If avatar already exists, go to map
    const avatar = localStorage.getItem("missao-avatar");
    if (avatar) {
      router.replace("/mapa");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F6F0] border border-[#315F4C]/15 text-[#315F4C] text-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]"></span>
          Colégio 21 de Maio
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1C1C1C] mb-4 leading-tight">
          Missão Construtores
        </h1>
        <p className="text-[#1C1C1C]/60 text-lg mb-2">
          Carbono Zero
        </p>
        <p className="text-[#1C1C1C]/50 mb-10 leading-relaxed">
          Entre no escritório virtual, escolha seu avatar e complete as missões
          da sua equipe para construir o aplicativo da Feira.
        </p>

        <Link
          href="/avatar"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-[#315F4C] hover:bg-[#2a5240] transition-colors"
        >
          Criar avatar e entrar
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <p className="mt-8 text-xs text-[#1C1C1C]/40">
          Desenvolvido por <span className="text-[#315F4C] font-medium">Ubongo</span>
        </p>
      </div>
    </div>
  );
}
