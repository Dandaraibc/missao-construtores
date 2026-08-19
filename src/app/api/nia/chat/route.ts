import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { NiaAgent } from "@/lib/nia/agent";
import { buildNiaContext } from "@/lib/nia/policy";

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().optional(),
  context: z.object({
    projectId: z.string(),
    userId: z.string(),
    role: z.enum(["STUDENT", "TEACHER", "UBONGO_ADMIN", "SUPER_ADMIN", "VISITOR"]),
    teamId: z.string().optional(),
    currentRoom: z.string().optional(),
    permissions: z.array(z.string()).default([]),
  })
});

// Inicializa a NIA usando Qwen (ou OpenAI)
const nia = new NiaAgent({
  provider: "qwen", // Qwen é o padrão mais barato/rápido que escolhemos
  openAiKey: process.env.OPENAI_API_KEY,
  qwenKey: process.env.QWEN_API_KEY,
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Contexto ou mensagem inválidos." }, { status: 400 });

  if (parsed.data.context.userId !== user.id) return NextResponse.json({ error: "Contexto de usuário inválido." }, { status: 403 });

  try {
    const stringifiedContext = JSON.stringify(buildNiaContext(parsed.data.context));
    
    // 1. Gera o texto com a LLM
    const textResponse = await nia.ask(parsed.data.message, parsed.data.conversationId, stringifiedContext);

    // 2. Prepara a integração com o Fish Audio
    const FISH_AUDIO_MODEL = "dece2a4c7f8d476b8da3c3a6707298d4";
    // Nota: A geração real do buffer de áudio via API do FishAudio pode ser feita aqui
    // ou o frontend pode chamar a URL com o texto retornado. Vamos retornar os dados pro frontend.

    return NextResponse.json({
      reply: textResponse,
      voice: {
        modelId: FISH_AUDIO_MODEL,
        provider: "fish_audio",
        // audioUrl: `https://api.fish.audio/v1/tts?...` (Futura chamada direta da API)
      }
    });

  } catch (error) {
    console.error("Erro interno NIA:", error);
    return NextResponse.json({ error: "O NIA está temporariamente indisponível." }, { status: 503 });
  }
}
