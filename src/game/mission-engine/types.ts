export type MissionEventType =
  | "PLAYER_ENTER_ZONE"
  | "PLAYER_INTERACT"
  | "NPC_DIALOGUE_FINISHED"
  | "ITEM_COLLECTED"
  | "OBJECT_INSPECTED"
  | "PUZZLE_COMPLETED"
  | "CHOICE_MADE"
  | "TEAM_DECISION_CONFIRMED"
  | "OBJECTIVE_COMPLETED"
  | "MISSION_COMPLETED";

export interface MissionObjective {
  id: string;
  title: string;
  description?: string;
  hidden?: boolean;
  required?: boolean;
}

export interface MissionNpc {
  id: string;
  name: string;
  x: number;
  y: number;
  portrait?: string;
  dialogueId: string;
  tags?: string[];
}

export interface MissionInteractable {
  id: string;
  type: "NPC" | "OBJECT" | "COLLECTIBLE" | "PUZZLE" | "DECISION" | "PORTAL";
  label: string;
  x: number;
  y: number;
  radius: number;
  action: "CONVERSAR" | "INVESTIGAR" | "COLETAR" | "USAR" | "ESCOLHER";
  objectiveId?: string;
  metadata?: Record<string, unknown>;
}

export interface MissionDialogue {
  id: string;
  speaker: string;
  pages: string[];
  choices?: { id: string; label: string; consequence?: Record<string, unknown> }[];
}

export interface MissionDefinition {
  id: string;
  teamId: string;
  title: string;
  description: string;
  mapId: string;
  spawnPoint: { x: number; y: number };
  objectives: MissionObjective[];
  npcs: MissionNpc[];
  dialogues: MissionDialogue[];
  interactables: MissionInteractable[];
  sharedState: Record<string, unknown>;
  completionRules: { requiredObjectives: string[]; requiresDecision?: boolean };
  xp: number;
  achievement?: string;
}

export interface MissionRuntimeState {
  missionId: string;
  completedObjectives: string[];
  collectedItems: string[];
  flags: Record<string, unknown>;
  decision?: Record<string, unknown>;
  completed: boolean;
}
