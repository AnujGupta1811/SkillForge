// components/project-timeline.tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Project {
  name: string
  description: string
  role: "Lead Engineer" | "Contributor"
  status: "Active" | "Completed"
  techTags: string[]
  progress: {
    done: number
    total: number
  }
  actionLabel: string
  actionHref: string
}

const projects: Project[] = [
  {
    name: "RateMaster",
    description: "Distributed Rate Limiting Service",
    role: "Lead Engineer",
    status: "Active",
    techTags: ["Node.js", "Redis", "Docker"],
    progress: { done: 3, total: 6 },
    actionLabel: "Open workspace",
    actionHref: "/workspace/ratemaster",
  },
  {
    name: "FlowQueue",
    description: "Visual Job Queue Manager",
    role: "Contributor",
    status: "Completed",
    techTags: ["Node.js", "BullMQ", "React"],
    progress: { done: 6, total: 6 },
    actionLabel: "View project",
    actionHref: "/projects/flowqueue",
  },
  {
    name: "DevMetrics",
    description: "Engineering Activity Dashboard",
    role: "Contributor",
    status: "Active",
    techTags: ["TypeScript", "Next.js", "GitHub API"],
    progress: { done: 2, total: 8 },
    actionLabel: "Open workspace",
    actionHref: "/workspace/devmetrics",
  },
]

const roleStyles = {
  "Lead Engineer": "bg-[#ede9fe] text-[#6d28d9]",
  Contributor: "bg-[#dbeafe] text-[#1d4ed8]",
}

const statusStyles = {
  Active: "bg-[#dcfce7] text-[#15803d]",
  Completed: "bg-[#dcfce7] text-[#15803d]",
}

const techTagColors: Record<string, string> = {
  "Node.js": "bg-[#dbeafe] text-[#1d4ed8]",
  Redis: "bg-[#ede9fe] text-[#6d28d9]",
  Docker: "bg-[#dbeafe] text-[#1d4ed8]",
  BullMQ: "bg-[#ede9fe] text-[#6d28d9]",
  React: "bg-[#dbeafe] text-[#1d4ed8]",
  TypeScript: "bg-[#dbeafe] text-[#1d4ed8]",
  "Next.js": "bg-[#f1f5f9] text-[#475569]",
  "GitHub API": "bg-[#f1f5f9] text-[#475569]",
}

interface ProjectTimelineProps {
  hideHeader?: boolean
}

export function ProjectTimeline({ hideHeader = false }: ProjectTimelineProps) {
  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div>
          <h3 className="text-lg font-semibold text-[#0f172a]">My projects</h3>
          <p className="text-sm text-[#64748b]">
            Projects you have created or contributed to.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.name}
            className="rounded-xl border border-[#e2e8f0] bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-semibold text-[#0f172a]">
                    {project.name} — {project.description}
                  </h4>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${roleStyles[project.role]}`}
                    >
                      {project.role}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.techTags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${techTagColors[tag] || "bg-[#f1f5f9] text-[#475569]"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-[#64748b]">
                    {project.progress.done} of {project.progress.total} features
                    done
                  </p>
                  <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-[#ede9fe]">
                    <div
                      className="h-full rounded-full bg-[#7c3aed] transition-all"
                      style={{
                        width: `${(project.progress.done / project.progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href={project.actionHref}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#7c3aed] hover:underline"
              >
                {project.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
