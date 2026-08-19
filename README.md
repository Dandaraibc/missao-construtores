# Missão Construtores – Carbono Zero

Plataforma gamificada para os alunos do Ensino Médio participarem da criação do aplicativo **Missão Carbono Zero**.

## O que é

Os estudantes são organizados em 5 equipes. Cada equipe recebe missões progressivas. As respostas e decisões são registradas e depois usadas pela Ubongo para construir o aplicativo final da Feira Cultural.

### Equipes

| Equipe | Papel | Entrega final |
|--------|-------|---------------|
| 🔬 Pesquisa e Conteúdo | Conteúdo científico correto e claro | Banco de Conteúdo |
| 🗺️ Produto e Experiência | Jornada e funcionalidades | Mapa da Experiência |
| 🎨 Design e Identidade Visual | Visual e identidade | Guia Visual |
| 🐞 Testes e Qualidade | Encontrar problemas | Relatório Guardiões |
| 📢 Comunicação e Apresentação | Narrativa e apresentação | Roteiro Oficial |

## Como rodar

```bash
cd missao-construtores
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `/` — Escolha de equipe + progresso coletivo
- `/equipe/[slug]` — Dashboard da equipe + missões
- `/admin` — Painel do professor/Ubongo (ver entregas + exportar JSON)

## Dados

No momento os dados ficam no `localStorage` do navegador.  
O botão **Exportar JSON** no `/admin` gera um arquivo com todas as respostas para a Ubongo usar.

## Próximos passos sugeridos

1. Trocar localStorage por Supabase (autenticação + banco em tempo real)
2. Adicionar upload de imagens (design)
3. Sistema de login simples por turma/código
4. Agentes de IA para dar dicas dentro das missões
5. Painel coletivo em tempo real na TV da feira

## Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion + Lucide (quando necessário)

---

**Ubongo** · Os alunos decidem · A Ubongo constrói
