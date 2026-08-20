import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";

export default async function EquipePage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c12] text-white flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold mb-4">Acesso Negado</h1>
        <Link href="/" className="px-4 py-2 bg-emerald-500 rounded-lg text-black font-bold">Fazer Login</Link>
      </div>
    );
  }

  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: {
      users: {
        select: { id: true, displayName: true, shortName: true, role: true }
      },
      missions: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!team) return notFound();

  const isMember = user.teamId === team.id || user.role !== "STUDENT";

  return (
    <main className="min-h-screen bg-[#0b0f17] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: team.color + '30', border: \`1px solid \${team.color}\` }}>
              {team.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black">Equipe {team.name}</h1>
              <p className="text-white/50 text-sm">Painel de Gestão e Entregas do Carbono Zero</p>
            </div>
          </div>
          <Link href="/campus" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm">
            Voltar ao Campus
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Members */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Membros da Equipe</h2>
            <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 space-y-2">
              {team.users.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-xs">
                    {member.shortName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{member.shortName || member.displayName}</div>
                    <div className="text-[10px] text-white/40">{member.role}</div>
                  </div>
                </div>
              ))}
              {team.users.length === 0 && <div className="text-xs text-white/40 p-2">Nenhum membro vinculado.</div>}
            </div>
          </div>

          {/* Missions */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Trilha de Missões</h2>
            
            {!isMember ? (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-rose-300 text-sm font-bold text-center">
                Você não tem permissão para ver as missões desta equipe.
              </div>
            ) : (
              <div className="space-y-3">
                {team.missions.map((mission) => (
                  <div key={mission.id} className="bg-[#111827] rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#10b981]">
                          Missão {mission.order}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10">
                          {mission.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white">{mission.title}</h3>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{mission.description}</p>
                    </div>
                    
                    <button className="px-4 py-2 rounded-xl bg-[#10b981] text-black font-extrabold text-xs whitespace-nowrap hover:bg-[#34d399] transition-all">
                      Acessar Entrega
                    </button>
                  </div>
                ))}
                
                {team.missions.length === 0 && (
                  <div className="bg-[#111827] rounded-3xl p-8 border border-white/10 text-center text-white/50 text-sm">
                    Ainda não há missões designadas para a equipe {team.name}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
