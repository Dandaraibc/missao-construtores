<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent: NIA

NIA é a assistente de IA imersiva que atua dentro do ambiente virtual interativo (estilo Gather) da Missão Construtores. 

## Características e Integração
- **Comunicação por Voz:** A NIA se comunica com os alunos utilizando a API de geração de voz da **Fish Audio**.
- **Motor de RAG:** Ela possui um sistema robusto de *Retrieval-Augmented Generation (RAG)*, o que permite que ela entenda todo o contexto do mapa, das missões e do cenário do aluno.
- **Conhecimento Institucional (Ubongo):** A NIA é, nativamente, uma agente da **Ubongo**. Ela domina fluxos de atendimento e possui conhecimento profundo sobre a empresa e os processos educacionais.
- **Presença no Mapa:** A NIA será renderizada como um NPC/Avatar dentro do motor do jogo (Phaser/Colyseus), de forma que os alunos poderão se aproximar dela e interagir via texto e voz em tempo real.
