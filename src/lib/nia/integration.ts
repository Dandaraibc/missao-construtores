import type { NiaChatRequest, NiaChatResponse } from "./types";
import { buildNiaContext } from "./policy";

/** Adapter for the Ubongo NIA service. NIA identity and intelligence stay outside this product. */
export async function askNia(request: NiaChatRequest): Promise<NiaChatResponse> {
  const endpoint = process.env.NIA_API_URL;
  if (!endpoint) throw new Error("NIA_API_URL is not configured");
  const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(process.env.NIA_API_KEY ? { authorization: `Bearer ${process.env.NIA_API_KEY}` } : {}) },
    body: JSON.stringify({ agentId: "nia", agentType: "UBONGO_AGENT", context: "mission_builders", message: request.message, conversationId: request.conversationId, ...buildNiaContext(request.context) }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`NIA service returned ${response.status}`);
  return response.json() as Promise<NiaChatResponse>;
}
