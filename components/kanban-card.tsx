// components/kanban-card.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Feature } from "@/lib/types"
import { useState } from "react"

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
    .trim()
    .split(" ")
    .filter(Boolean)
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
  myPendingFeatureIds: Set<string>
  onStartFeature: (feature: Feature) => void
  onRequestContribute: (feature: Feature) => void
  onSubmit: (feature: Feature) => void
  onApprove: (feature: Feature) => void
  onRequestChanges: (feature: Feature) => void
}

export function KanbanCard({
  feature,
  currentUserId,
  isLeadEngineer,
  myPendingFeatureIds,
  onStartFeature,
  onRequestContribute,
  onSubmit,
  onApprove,
  onRequestChanges,
}: KanbanCardProps) {
  const column = statusToColumn(feature.status)
  const muted = column === "done"
  const isAssignedToMe = feature.assigned_to === currentUserId
  const isUnassigned = !feature.assigned_to
  const hasPendingRequest = myPendingFeatureIds.has(feature.id)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleAction(action: string, handler: () => void | Promise<void>) {
    setActionLoading(action)
    try {
      await handler()
    } finally {
      setActionLoading(null)
    }
  }

  // Determine which action button to show
  function renderActionButton() {
    // CASE 6 — Current user already has a pending contribution request
    if (column === "todo" && isUnassigned && !isLeadEngineer && hasPendingRequest) {
      return (
        <Button
          size="sm"
          disabled
          className="h-8 cursor-not-allowed bg-[#f1f5f9] text-[#94a3b8] hover:bg-[#f1f5f9]"
        >
          Request Pending…
        </Button>
      )
    }

    // CASE 1 — Unassigned + viewer is project creator → "Start Feature"
    if (column === "todo" && isUnassigned && isLeadEngineer) {
      return (
        <Button
          size="sm"
          onClick={() => handleAction("start", () => onStartFeature(feature))}
          disabled={actionLoading === "start"}
          className="h-8 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        >
          {actionLoading === "start" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Starting…
            </>
          ) : (
            "Start Feature"
          )}
        </Button>
      )
    }

    // CASE 2 — Unassigned + viewer is NOT creator → "Request to Contribute"
    if (column === "todo" && isUnassigned && !isLeadEngineer) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("request", () => onRequestContribute(feature))}
          disabled={actionLoading === "request"}
          className="h-8 border-[#7c3aed] text-[#7c3aed] hover:bg-[#ede9fe] hover:text-[#7c3aed]"
        >
          {actionLoading === "request" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            "Request to Contribute"
          )}
        </Button>
      )
    }

    // CASE 3 — Assigned to current user + in_progress → "Submit for Review"
    if (column === "in_progress" && isAssignedToMe) {
      return (
        <Button
          size="sm"
          onClick={() => onSubmit(feature)}
          className="h-8 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        >
          Submit for Review
        </Button>
      )
    }

    // CASE 4 — In review + viewer is project creator → Approve / Request Changes
    if (column === "in_review" && isLeadEngineer) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAction("approve", () => onApprove(feature))}
            disabled={actionLoading === "approve"}
            className="h-8 flex-1 text-white hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
          >
            {actionLoading === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Check className="mr-1 h-3.5 w-3.5" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("changes", () => onRequestChanges(feature))}
            disabled={actionLoading === "changes"}
            className="h-8 flex-1 border-[#f97316] text-[#f97316] hover:bg-[#fff7ed] hover:text-[#f97316]"
          >
            {actionLoading === "changes" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Request Changes"
            )}
          </Button>
        </div>
      )
    }

    // CASE 5 — Assigned to someone else → no button (avatar is shown in footer)
    return null
  }

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

      {/* Show engineer's review notes to the lead when card is in review */}
      {column === "in_review" && isLeadEngineer && feature.review_notes && (
        <div className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
            Notes from engineer
          </p>
          <p className="text-xs text-[#475569] whitespace-pre-wrap line-clamp-3">
            {feature.review_notes}
          </p>
        </div>
      )}

      {/* Show lead's change request feedback to the assigned engineer */}
      {column === "in_progress" && isAssignedToMe && feature.review_comments && (
        <div className="rounded-md border border-[#fed7aa] bg-[#fff7ed] p-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#f97316]">
            Changes requested
          </p>
          <p className="text-xs text-[#92400e] whitespace-pre-wrap line-clamp-3">
            {feature.review_comments}
          </p>
        </div>
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
      {renderActionButton()}
    </div>
  )
}
