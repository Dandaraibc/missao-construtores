export type NiaContextName = "mission_builders" | "website_sdr" | "crm" | "support";
export type NiaUserRole = "STUDENT" | "TEACHER" | "UBONGO_ADMIN" | "SUPER_ADMIN" | "VISITOR";

export interface NiaProjectContext {
  projectId: string;
  userId: string;
  role: NiaUserRole;
  teamId?: string;
  currentRoom?: string;
  currentMission?: string;
  missionProgress?: number;
  permissions: string[];
  projectDeadline?: string;
  availableDocuments?: string[];
  approvedDeliverables?: string[];
}

export interface NiaChatRequest {
  message: string;
  context: NiaProjectContext;
  conversationId?: string;
}

export interface NiaChatResponse {
  agentId: "nia";
  context: NiaContextName;
  message: string;
  conversationId?: string;
}
