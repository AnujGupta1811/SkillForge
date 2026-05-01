// components/project-timeline.tsx
"use client"

import { useRouter } from "next/navigation"

export interface ProjectRow {
  id: string
  name: string
  status: string
  feature_total: number
  feature_done: number
  role: "lead" | "contributor"
}

interface ProjectTimelineProps {
  projects?: ProjectRow[]
  hideHeader?: boolean
}

const roleStyles = {
  lead: "bg-[#ede9fe] text-[#6d28d9]",
  contributor: "bg-[#e2e8f0] text-[#475569]",
}

const roleLabels = {
  lead: "Lead",
  contributor: "Contributor",
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return "bg-[#dcfce7] text-[#15803d]"
    case "completed":
      return "bg-[#dbeafe] text-[#1d4ed8]"
    case "archived":
      return "bg-[#f1f5f9] text-[#64748b]"
    default:
      return "bg-[#f1f5f9] text-[#64748b]"
  }
}

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function ProjectTimeline({
  projects = [],
  hideHeader = false,
}: ProjectTimelineProps) {
  const router = useRouter()

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

      {projects.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#64748b]">
          No projects yet — find a problem to get started
        </p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const pct =
              project.feature_total > 0
                ? Math.round((project.feature_done / project.feature_total) * 100)
                : 0

            return (
              <button
                key={project.id}
                onClick={() =>
                  router.push(`/dashboard/workspace/${project.id}`)
                }
                className="w-full rounded-xl border border-[#e2e8f0] bg-white p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: name + badges */}
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-[#0f172a]">
                      {project.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${roleStyles[project.role]}`}
                      >
                        {roleLabels[project.role]}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusStyle(project.status)}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>

                  {/* Right: progress bar */}
                  <div className="min-w-[140px] space-y-1">
                    <p className="text-xs text-[#64748b]">
                      {project.feature_done} / {project.feature_total} features done
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ede9fe]">
                      <div
                        className="h-full rounded-full bg-[#7c3aed] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
