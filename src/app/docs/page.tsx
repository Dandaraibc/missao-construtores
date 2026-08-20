import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/server/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DocsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c12] text-white flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold mb-4">Acesso Restrito</h1>
        <Link href="/" className="px-4 py-2 bg-emerald-500 rounded-lg text-black font-bold">Fazer Login</Link>
      </div>
    );
  }

  // Busca todos os documentos armazenados no sistema RAG
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-[#0b0f17] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-emerald-400">Documentação e Uploads</h1>
            <p className="text-white/50 text-sm mt-1">Acervo do projeto Carbono Zero e arquivos do Missão Construtores.</p>
          </div>
          <Link href="/campus" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm">
            Voltar ao Campus
          </Link>
        </header>

        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Arquivos e Manuais do Projeto</h2>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="bg-[#111827] rounded-3xl p-8 border border-white/10 text-center text-white/50 text-sm">
                  Nenhum documento cadastrado. A base de dados RAG da NIA está vazia.
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="bg-[#111827] p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-emerald-300">{doc.title}</h3>
                      <p className="text-xs text-white/50 mt-1">Categoria: {doc.category || "Geral"}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">
                      Visualizar Texto
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-[#111827] rounded-3xl p-5 border border-white/10">
              <h3 className="font-bold text-sm text-emerald-400 mb-2">Upload de Documento (RAG)</h3>
              <p className="text-xs text-white/50 mb-4">Adicione materiais para treinar a IA do Office Virtual.</p>
              
              <div className="space-y-3">
                <input type="text" placeholder="Título do Documento" className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" />
                <input type="file" className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30" />
                
                <button className="w-full bg-emerald-500 text-black font-bold py-2 rounded-xl text-xs hover:bg-emerald-400 disabled:opacity-50 mt-2">
                  Fazer Upload
                </button>
              </div>
            </div>

            <div className="bg-amber-500/10 rounded-3xl p-5 border border-amber-500/20">
              <h3 className="font-bold text-sm text-amber-400 mb-2">Regras de Upload</h3>
              <ul className="text-xs text-amber-200/70 space-y-2 list-disc list-inside">
                <li>Arquivos PDF são processados em chunks automaticamente.</li>
                <li>O texto extraído alimenta a API Vectorial (pgvector) da NIA.</li>
                <li>Apenas professores e admins Ubongo podem enviar arquivos globais.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
