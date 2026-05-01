// components/points-history.tsx
"use client"

import { CheckSquare, FolderOpen, Zap, Star, type LucideIcon } from "lucide-react"

export interface PointEventRow {
  event_type: string
  points: number
  created_at: string
  metadata?: Record<string, unknown> | null
}

interface PointsHistoryProps {
  events?: PointEventRow[]
  totalPoints?: number
}

const EVENT_LABELS: Record<string, string> = {
  project_published: "Published a project",
  feature_completed: "Completed a feature",
  contribution_approved: "Contribution approved",
}

const EVENT_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  project_published: { icon: FolderOpen, color: "text-[#7c3aed]" },
  feature_completed: { icon: CheckSquare, color: "text-[#15803d]" },
  contribution_approved: { icon: Star, color: "text-[#f59e0b]" },
}

function getEventLabel(type: string): string {
  if (EVENT_LABELS[type]) return EVENT_LABELS[type]
  // format snake_case → Title Case
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function getEventIcon(type: string) {
  return EVENT_ICONS[type] ?? { icon: Zap, color: "text-[#7c3aed]" }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function PointsHistory({ events = [], totalPoints }: PointsHistoryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#0f172a]">Points history</h3>
        {totalPoints !== undefined && (
          <p className="text-sm text-[#64748b]">
            How you earned your {totalPoints} points.
          </p>
        )}
      </div>

      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#64748b]">No point activity yet</p>
      ) : (
        <>
          <div className="divide-y divide-[#e2e8f0]">
            {events.map((event, index) => {
              const { icon: Icon, color } = getEventIcon(event.event_type)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8fafc] ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0f172a]">
                        {getEventLabel(event.event_type)}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {formatDate(event.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#15803d]">
                      +{event.points} pts
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPoints !== undefined && (
            <div className="border-t border-[#e2e8f0] pt-4 text-right">
              <p className="text-sm font-bold text-[#7c3aed]">
                Total: {totalPoints} points
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
