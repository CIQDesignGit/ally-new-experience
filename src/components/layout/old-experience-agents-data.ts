export type AgentSkill = { id: string; label: string }

export type AgentProfile = {
  id: string
  name: string
  role: string
  description: string
  skills: AgentSkill[]
}

export const OLD_EXPERIENCE_AGENTS: AgentProfile[] = [
  {
    id: "sales-analyst",
    name: "Ally",
    role: "Sales Analyst",
    description:
      "Diagnose performance gaps, identify root causes, and take action faster with real-time, AI-powered sales insights.",
    skills: [{ id: "news-feed", label: "News Feed and Alerts" }],
  },
  {
    id: "content-analyst",
    name: "Ally",
    role: "Content Analyst",
    description:
      "Uncover content gaps, improve search/AI discoverability, and boost conversions with AI-driven recommendations tailored to your catalog.",
    skills: [
      { id: "title-tailor", label: "Title Tailor" },
      { id: "compliance", label: "Compliance" },
      { id: "pdp", label: "PDP Optimization" },
    ],
  },
]
