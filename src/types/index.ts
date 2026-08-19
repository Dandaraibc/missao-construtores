export type TeamSlug =
  | "pesquisa"
  | "produto"
  | "design"
  | "testes"
  | "comunicacao";

export interface Mission {
  id: string;
  number: number;
  title: string;
  description: string;
  context: string;
  challenge: string;
  examples?: string[];
  fields: MissionField[];
  deliveryLabel: string;
  xpReward: number;
  badge?: string;
}

export interface MissionField {
  id: string;
  type: "text" | "textarea" | "select" | "multiselect" | "radio" | "checklist";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  help?: string;
}

export interface Team {
  slug: TeamSlug;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  icon: string;
  mission: string; // overall mission statement
  description: string;
  missions: Mission[];
}

export interface TeamProgress {
  teamSlug: TeamSlug;
  completedMissions: string[];
  answers: Record<string, Record<string, any>>; // missionId -> fieldId -> value
  xp: number;
  badges: string[];
  lastUpdated: string;
}

export interface CollectiveProgress {
  pesquisa: number;
  produto: number;
  design: number;
  testes: number;
  comunicacao: number;
}
