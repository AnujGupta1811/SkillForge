// components/kanban-card.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Feature } from "@/lib/types"

export type ColumnId = "todo" | "in_progress" | "in_review" | "done"

// Map feature status to column id
export function statusToColumn(status: string): ColumnId {
  const map: Record<string, ColumnId> = {
    todo: "todo",
    in_progress: "in_progress",
    in_review: "in_review",
    done: "done",
  }
  return map[status] || "todo"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

interface KanbanCardProps {
  feature: Feature
  currentUserId: string
  isLeadEngineer: boolean
  onTake: (feature: Feature) => void
  onMoveToInProgress: (feature: Feature) => void
  onSubmit: (feature: Feature) => void
  onApprove: (feature: Feature) => void
  onRequestChanges: (feature: Feature) => void
}

export function KanbanCard({
  feature,
  currentUserId,
  isLeadEngineer,
  onTake,
  onMoveToInProgress,
  onSubmit,
  onApprove,
  onRequestChanges,
}: KanbanCardProps) {
  const column = statusToColumn(feature.status)
  const muted = column === "done"
  const isAssignedToMe = feature.assigned_to === currentUserId
  const isUnassigned = !feature.assigned_to

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition",
        muted && "opacity-80"
      )}
      style={{ borderColor: "#e2e8f0" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          className="text-sm font-semibold leading-snug text-pretty"
          style={{ color: "#0f172a" }}
        >
          {feature.title}
        </h4>
        {column === "done" && (
          <Check
            className="h-4 w-4 shrink-0"
            style={{ color: "#15803d" }}
            aria-label="Completed"
          />
        )}
      </div>

      {feature.description && (
        <p
          className="line-clamp-2 text-xs leading-relaxed"
          style={{ color: "#64748b" }}
        >
          {feature.description}
        </p>
      )}

      <div
        className="mt-1 flex items-center justify-between gap-2 border-t pt-3"
        style={{ borderColor: "#e2e8f0" }}
      >
        {feature.assigned_user ? (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              name={feature.assigned_user.full_name}
              avatarUrl={feature.assigned_user.avatar_url}
            />
            <span
              className="truncate text-xs font-medium"
              style={{ color: "#0f172a" }}
            >
              {feature.assigned_user.full_name}
              {isAssignedToMe && (
                <span className="ml-1 text-[#7c3aed]">(you)</span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-xs italic" style={{ color: "#64748b" }}>
            Unassigned
          </span>
        )}
      </div>

      {/* Action buttons based on status and current user */}

      {/* Todo: unassigned feature — anyone can take it */}
      {column === "todo" && isUnassigned && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onTake(feature)}
          className="h-8 border-[#7c3aed] text-[#7c3aed] hover:bg-[#ede9fe] hover:text-[#7c3aed]"
        >
          Take this feature
        </Button>
      )}

      {/* Todo: assigned to me — move to in progress */}
      {column === "todo" && isAssignedToMe && (
        <Button
          size="sm"
          onClick={() => onMoveToInProgress(feature)}
          className="h-8 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        >
          Move to In Progress
        </Button>
      )}

      {/* In progress: assigned to me — submit for review */}
      {column === "in_progress" && isAssignedToMe && (
        <Button
          size="sm"
          onClick={() => onSubmit(feature)}
          className="h-8 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        >
          Submit for review
        </Button>
      )}

      {/* In review: lead engineer actions */}
      {column === "in_review" && isLeadEngineer && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(feature)}
            className="h-8 flex-1 text-white hover:opacity-90"
            style={{ backgroundColor: "#15803d" }}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRequestChanges(feature)}
            className="h-8 flex-1 border-[#b91c1c] text-[#b91c1c] hover:bg-[#fee2e2] hover:text-[#b91c1c]"
          >
            Request changes
          </Button>
        </div>
      )}
    </div>
  )
}
