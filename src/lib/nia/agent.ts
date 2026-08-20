import { OpenAI } from "openai";
import { prisma } from "@/lib/server/prisma";

export type LLMProvider = "openai" | "qwen";

interface NiaAgentConfig {
  provider: LLMProvider;
  openAiKey?: string;
  qwenKey?: string;
}

export class NiaAgent {
  private openaiClient: OpenAI | null = null;
  private qwenClient: OpenAI | null = null;
  private currentProvider: LLMProvider;

  constructor(config: NiaAgentConfig) {
    this.currentProvider = config.provider;

    if (config.openAiKey) {
      this.openaiClient = new OpenAI({
        apiKey: config.openAiKey,
      });
    }

    if (config.qwenKey) {
      this.qwenClient = new OpenAI({
        apiKey: config.qwenKey,
        baseURL: "https://api.together.xyz/v1",
      });
    }
  }

  async ask(message: string, contextId?: string, projectContext?: string) {
    const client = this.currentProvider === "openai" ? this.openaiClient : this.qwenClient;
    const model = this.currentProvider === "openai" ? "gpt-4o-mini" : "Qwen/Qwen2.5-72B-Instruct-Turbo";

    if (!client) {
      return this.fallbackEngine(message, projectContext);
    }

    const retrievedContext = await this.retrieveKnowledge(message);

    const systemPrompt = `Você é a NIA (Negócios, Inteligência e Ação), assistente de IA imersiva nativa da Ubongo que atua no mapa 2D do Missão Construtores no Colégio 24 de Maio.
Características principais:
- Comunicação Clara e Pedagógica: Ajuda alunos e professores a tirarem dúvidas sobre missões de Carbono Zero, Feira de Ciências e aplicativo.
- Voz: Suporta síntese de voz via Fish Audio.
- Conhecimento da Ubongo: Domina fluxos educacionais e a dinâmica do Office multiplayer.
- Regras escolares: Mantenha sempre um tom respeitoso, encorajador e profissional.

Base de Conhecimento RAG:
${retrievedContext}

Contexto Atual do Usuário:
${projectContext ?? contextId ?? "Usuário no Office do Missão Construtores"}
`;

    try {
      const completion = await client.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      });

      return completion.choices[0].message.content || this.fallbackEngine(message, projectContext);
    } catch (error) {
      console.error("Erro ao chamar o modelo da NIA, usando motor de contingência:", error);
      return this.fallbackEngine(message, projectContext);
    }
  }

  private async retrieveKnowledge(query: string) {
    if (!this.openaiClient) {
      return "Base de Conhecimento Ubongo (Offline): O Missão Construtores possui 5 equipes. O objetivo final é a construção do aplicativo Carbono Zero para a Feira de Ciências.";
    }

    try {
      // 1. Gera embedding para a query do usuário
      const response = await this.openaiClient.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });
      const embedding = response.data[0].embedding;
      const embeddingArray = `[${embedding.join(",")}]`;

      // 2. Busca no PostgreSQL/pgvector usando distância L2
      const documents: { content: string }[] = await prisma.$queryRaw`
        SELECT content 
        FROM "DocumentChunk" 
        ORDER BY embedding <-> ${embeddingArray}::vector 
        LIMIT 5;
      `;

      if (!documents || documents.length === 0) {
        return "Nenhum contexto de documento adicional encontrado.";
      }

      // 3. Concatena os chunks recuperados
      return "Contexto Extraído da Documentação Oficial do Projeto:\n" + documents.map((doc) => doc.content).join("\n\n");
    } catch (error) {
      console.error("Erro na recuperação RAG:", error);
      return "Aviso: Recuperação RAG indisponível no momento.";
    }
  }

  private fallbackEngine(message: string, context?: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("olá") || lower.includes("oi") || lower.includes("bom dia") || lower.includes("boa tarde")) {
      return "Olá! Sou a NIA, a assistente virtual da Ubongo no Missão Construtores! Como posso ajudar você e sua equipe hoje nas missões da feira?";
    }
    if (lower.includes("missão") || lower.includes("missao") || lower.includes("tarefa")) {
      return "Para acessar suas missões, aproxime-se dos computadores da sua equipe no mapa ou abra o painel da sua equipe no menu principal!";
    }
    if (lower.includes("equipe") || lower.includes("grupo")) {
      return "As equipes no Missão Construtores são: 1. Pesquisa (Descobertas), 2. Ideias (Produto), 3. Criativa (Design), 4. Guardiões (Testes) e 5. História (Documentação). Cada equipe desempenha um papel essencial no aplicativo Carbono Zero!";
    }
    if (lower.includes("professora") || lower.includes("professor") || lower.includes("niltes") || lower.includes("diego")) {
      return "Os professores Prof. Niltes e Prof. Diego acompanham o progresso das missões e supervisionam as atividades no Office.";
    }
    if (lower.includes("ubongo") || lower.includes("prietto") || lower.includes("dandara") || lower.includes("charles")) {
      return "A Ubongo é a empresa educacional parceira responsável pela plataforma Missão Construtores e pela revisão final dos entregáveis das equipes.";
    }
    return `Entendi sua dúvida sobre "${message}". Como assistente da Ubongo, estou acompanhando seu progresso no mapa. Consulte seu painel de equipe para ver os prazos e próximos passos!`;
  }
}
