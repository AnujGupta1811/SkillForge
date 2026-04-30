// components/kanban-board.tsx
"use client"

import { KanbanCard, type ColumnId, statusToColumn } from "@/components/kanban-card"
import type { Feature } from "@/lib/types"

const columns: { id: ColumnId; label: string; bg: string; headerColor: string; pillBg: string }[] = [
  { id: "todo", label: "To Do", bg: "#f8fafc", headerColor: "#475569", pillBg: "#e2e8f0" },
  { id: "in_progress", label: "In Progress", bg: "#eff6ff", headerColor: "#1d4ed8", pillBg: "#dbeafe" },
  { id: "in_review", label: "In Review", bg: "#fefce8", headerColor: "#b45309", pillBg: "#fef3c7" },
  { id: "done", label: "Done", bg: "#f0fdf4", headerColor: "#15803d", pillBg: "#dcfce7" },
]

interface KanbanBoardProps {
  features: Feature[]
  currentUserId: string
  isLeadEngineer: boolean
  onTake: (feature: Feature) => void
  onMoveToInProgress: (feature: Feature) => void
  onSubmit: (feature: Feature) => void
  onApprove: (feature: Feature) => void
  onRequestChanges: (feature: Feature) => void
}

export function KanbanBoard({
  features,
  currentUserId,
  isLeadEngineer,
  onTake,
  onMoveToInProgress,
  onSubmit,
  onApprove,
  onRequestChanges,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const colFeatures = features.filter(
          (f) => statusToColumn(f.status) === col.id
        )
        return (
          <section
            key={col.id}
            className="flex max-h-[720px] flex-col rounded-xl p-4"
            style={{ backgroundColor: col.bg }}
            aria-label={`${col.label} column`}
          >
            <header className="mb-4 flex items-center justify-between">
              <h3
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: col.headerColor }}
              >
                {col.label}
              </h3>
              <span
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold"
                style={{ backgroundColor: col.pillBg, color: col.headerColor }}
              >
                {colFeatures.length}
              </span>
            </header>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {colFeatures.length === 0 ? (
                <p
                  className="rounded-lg border border-dashed py-6 text-center text-xs"
                  style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                >
                  No tasks
                </p>
              ) : (
                colFeatures.map((feature) => (
                  <KanbanCard
                    key={feature.id}
                    feature={feature}
                    currentUserId={currentUserId}
                    isLeadEngineer={isLeadEngineer}
                    onTake={onTake}
                    onMoveToInProgress={onMoveToInProgress}
                    onSubmit={onSubmit}
                    onApprove={onApprove}
                    onRequestChanges={onRequestChanges}
                  />
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
