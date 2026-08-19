import type { MissionDefinition } from "./types";

export const investigateEverydayMission: MissionDefinition = {
  id: "pesquisa-investigar-cotidiano",
  teamId: "pesquisa",
  title: "Investigar o cotidiano",
  description: "Explore a cidade, converse com moradores e reúna descobertas para o Caderno de Pesquisa.",
  mapId: "urban-investigation",
  spawnPoint: { x: 120, y: 120 },
  objectives: [
    { id: "transport", title: "Investigar transporte" },
    { id: "food", title: "Investigar alimentação" },
    { id: "energy", title: "Investigar energia" },
    { id: "consumption", title: "Investigar consumo" },
    { id: "waste", title: "Investigar resíduos" },
    { id: "decision", title: "Confirmar Caderno de Descobertas", hidden: true },
  ],
  npcs: [
    { id: "moradora", name: "Dona Cida", x: 310, y: 190, dialogueId: "transport-dialogue" },
    { id: "feirante", name: "João", x: 590, y: 220, dialogueId: "food-dialogue" },
  ],
  dialogues: [
    { id: "transport-dialogue", speaker: "Dona Cida", pages: ["Eu cheguei de carro hoje, mas moro bem perto daqui.", "Como será que nossas escolhas de transporte mudam o impacto do dia?"] },
    { id: "food-dialogue", speaker: "João", pages: ["Na feira, algumas escolhas precisam viajar muitos quilômetros antes de chegar."] },
  ],
  interactables: [
    { id: "bus-stop", type: "OBJECT", label: "Ponto de ônibus", x: 220, y: 360, radius: 52, action: "INVESTIGAR", objectiveId: "transport" },
    { id: "market", type: "OBJECT", label: "Mercado", x: 590, y: 220, radius: 52, action: "INVESTIGAR", objectiveId: "food" },
    { id: "house", type: "OBJECT", label: "Casa", x: 820, y: 350, radius: 52, action: "INVESTIGAR", objectiveId: "energy" },
    { id: "shop", type: "OBJECT", label: "Loja", x: 930, y: 180, radius: 52, action: "INVESTIGAR", objectiveId: "consumption" },
    { id: "recycling", type: "OBJECT", label: "Coleta seletiva", x: 410, y: 590, radius: 52, action: "INVESTIGAR", objectiveId: "waste" },
    { id: "decision-table", type: "DECISION", label: "Caderno de Descobertas", x: 760, y: 700, radius: 60, action: "ESCOLHER", objectiveId: "decision" },
  ],
  sharedState: { discoveries: { transport: [], food: [], energy: [], consumption: [], waste: [] } },
  completionRules: { requiredObjectives: ["transport", "food", "energy", "consumption", "waste", "decision"], requiresDecision: true },
  xp: 120,
  achievement: "Observadores do Cotidiano",
};
