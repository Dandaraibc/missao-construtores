import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { NiaAgent } from "@/lib/nia/agent";
import { buildNiaContext } from "@/lib/nia/policy";

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().optional(),
  context: z.object({
    projectId: z.string().default("missao-construtores"),
    userId: z.string().default("visitante"),
    role: z.enum(["STUDENT", "TEACHER", "UBONGO_ADMIN", "SUPER_ADMIN", "VISITOR"]).default("STUDENT"),
    teamId: z.string().optional(),
    currentRoom: z.string().optional(),
    permissions: z.array(z.string()).default([]),
  }).default({
    projectId: "missao-construtores",
    userId: "visitante",
    role: "STUDENT",
    permissions: [],
  })
});

const nia = new NiaAgent({
  provider: (process.env.OPENAI_API_KEY ? "openai" : "qwen") as "openai" | "qwen",
  openAiKey: process.env.OPENAI_API_KEY,
  qwenKey: process.env.QWEN_API_KEY,
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Contexto ou mensagem inválidos." }, { status: 400 });
  }

  const effectiveUserId = user?.id || parsed.data.context.userId || "guest";
  const effectiveRole = user?.role || parsed.data.context.role || "STUDENT";
  const effectiveTeam = user?.teamId || parsed.data.context.teamId || "pesquisa";

  try {
    const stringifiedContext = JSON.stringify(
      buildNiaContext({
        ...parsed.data.context,
        userId: effectiveUserId,
        role: effectiveRole,
        teamId: effectiveTeam,
      })
    );

    const textResponse = await nia.ask(parsed.data.message, parsed.data.conversationId, stringifiedContext);
    const FISH_AUDIO_MODEL = "dece2a4c7f8d476b8da3c3a6707298d4";

    return NextResponse.json({
      reply: textResponse,
      voice: {
        modelId: FISH_AUDIO_MODEL,
        provider: "fish_audio",
        audioUrl: `https://fish.audio/app/text-to-speech/?modelId=${FISH_AUDIO_MODEL}&text=${encodeURIComponent(textResponse.slice(0, 200))}`,
      }
    });
  } catch (error) {
    console.error("Erro interno NIA:", error);
    return NextResponse.json({
      reply: "Olá! Sou a NIA, assistente virtual da Ubongo no Missão Construtores. Estou pronta para ajudar sua equipe a cumprir as missões de Pesquisa, Ideias, Criativa, Guardiões e História!",
      voice: {
        modelId: "dece2a4c7f8d476b8da3c3a6707298d4",
        provider: "fish_audio"
      }
    });
  }
}
