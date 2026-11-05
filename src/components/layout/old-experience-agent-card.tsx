import type { AgentProfile } from "./old-experience-agents-data"

export function OldExperienceAgentCard({ agent }: { agent: AgentProfile }) {
  return (
    <article className="flex flex-col rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <img
          src="/ally-avatar.png"
          alt="Ally"
          className="size-18 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="type-title text-fg-primary">{agent.name}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 type-caption text-fg-secondary">{agent.role}</span>
          </div>
          <p className="type-body text-fg-secondary">{agent.description}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="type-caption text-fg-tertiary">Skills</h3>
        <ul className="space-y-2">
          {agent.skills.map((skill) => (
            <li key={skill.id}>
              <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-2.5 type-body text-fg-primary">
                <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                {skill.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
