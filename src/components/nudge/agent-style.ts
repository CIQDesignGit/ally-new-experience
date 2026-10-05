import type { AgentId } from "./types"

/** Small square dot per agent (DESIGN.md): content violet, ops sky, media teal. Markers only, never large fills. */
export const AGENT_DOT: Record<AgentId, string> = {
  content: "bg-agent-content",
  ops: "bg-agent-ops",
  media: "bg-agent-media",
}
