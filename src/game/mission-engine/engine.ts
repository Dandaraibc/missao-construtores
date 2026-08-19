import type { MissionDefinition, MissionEventType, MissionRuntimeState } from "./types";

export function createMissionRuntime(definition: MissionDefinition): MissionRuntimeState {
  return { missionId: definition.id, completedObjectives: [], collectedItems: [], flags: {}, completed: false };
}

export function applyMissionEvent(
  definition: MissionDefinition,
  state: MissionRuntimeState,
  event: { type: MissionEventType; targetId?: string; payload?: Record<string, unknown> },
): MissionRuntimeState {
  const next = { ...state, completedObjectives: [...state.completedObjectives], collectedItems: [...state.collectedItems], flags: { ...state.flags } };
  const target = definition.interactables.find((item) => item.id === event.targetId);
  if (event.type === "OBJECTIVE_COMPLETED" && event.targetId && !next.completedObjectives.includes(event.targetId)) next.completedObjectives.push(event.targetId);
  if (event.type === "ITEM_COLLECTED" && event.targetId && !next.collectedItems.includes(event.targetId)) next.collectedItems.push(event.targetId);
  if (event.type === "CHOICE_MADE" && event.targetId) next.flags[event.targetId] = event.payload ?? true;
  if (event.type === "TEAM_DECISION_CONFIRMED") next.decision = event.payload ?? {};
  if (target?.objectiveId && ["PLAYER_INTERACT", "OBJECT_INSPECTED", "PUZZLE_COMPLETED"].includes(event.type) && !next.completedObjectives.includes(target.objectiveId)) next.completedObjectives.push(target.objectiveId);
  const required = definition.completionRules.requiredObjectives.every((id) => next.completedObjectives.includes(id));
  next.completed = required && (!definition.completionRules.requiresDecision || Boolean(next.decision));
  return next;
}
