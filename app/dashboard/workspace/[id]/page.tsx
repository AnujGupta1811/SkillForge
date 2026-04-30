// app/dashboard/workspace/[id]/page.tsx
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { use } from "react"
import Link from "next/link"
import { ChevronRight, CheckCircle, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { KanbanBoard } from "@/components/kanban-board"
import { SubmitReviewModal } from "@/components/submit-review-modal"
import { TakeFeatureModal } from "@/components/take-feature-modal"
import { createClient } from "@/lib/supabase/client"
import type { Feature, ProjectDetail } from "@/lib/types"

const statusBadgeStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: "#dcfce7", color: "#15803d" },
  completed: { bg: "#dbeafe", color: "#1d4ed8" },
  archived: { bg: "#f1f5f9", color: "#475569" },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md"
}) {
  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7"
  const text = size === "md" ? "text-xs" : "text-[11px]"

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full ${text} font-semibold`}
      style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

// Skeleton for the entire workspace page
function WorkspaceSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-48 rounded bg-[#f1f5f9]" />
        <div className="h-8 w-96 rounded bg-[#f1f5f9]" />
        <div className="h-4 w-full max-w-xl rounded bg-[#f1f5f9]" />
      </div>
      {/* Detail cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5"
          >
            <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
            <div className="h-6 w-32 rounded bg-[#f1f5f9]" />
            <div className="h-4 w-full rounded bg-[#f1f5f9]" />
          </div>
        ))}
      </div>
      {/* Kanban skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-[#f8fafc] p-4">
            <div className="mb-4 h-4 w-20 rounded bg-[#e2e8f0]" />
            <div className="space-y-3">
              <div className="h-28 rounded-xl bg-white border border-[#e2e8f0]" />
              <div className="h-28 rounded-xl bg-white border border-[#e2e8f0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = use(params)

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  const [submitFeature, setSubmitFeature] = useState<Feature | null>(null)
  const [takeFeature, setTakeFeature] = useState<Feature | null>(null)

  // Fetch current user and project data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Get current user
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Fetch project
      const res = await fetch(`/api/projects/${projectId}`)
      if (res.ok) {
        const data: ProjectDetail = await res.json()
        setProject(data)
        setFeatures(data.features || [])
      }
    } catch (err) {
      console.error("Failed to fetch project:", err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime subscription for features table
  useEffect(() => {
    if (!projectId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`features-realtime-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "features",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Update the affected feature in state
          setFeatures((prev) =>
            prev.map((f) =>
              f.id === payload.new.id
                ? { ...f, ...payload.new }
                : f
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const isLeadEngineer = project?.created_by === currentUserId

  const counts = useMemo(() => {
    return {
      total: features.length,
      done: features.filter((f) => f.status === "done").length,
      inProgress: features.filter((f) => f.status === "in_progress").length,
      inReview: features.filter((f) => f.status === "in_review").length,
      todo: features.filter((f) => f.status === "todo").length,
    }
  }, [features])

  const progressPct =
    counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0

  // Optimistic update helper
  function updateFeatureStatus(featureId: string, status: string) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, status: status as Feature["status"] } : f))
    )
  }

  // Handle "Move to In Progress" — optimistic then API
  async function handleMoveToInProgress(feature: Feature) {
    updateFeatureStatus(feature.id, "in_progress")
    try {
      await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      })
    } catch (err) {
      console.error("Failed to move to in progress:", err)
      // Revert on failure
      updateFeatureStatus(feature.id, feature.status)
    }
  }

  // Handle submit for review — via modal
  function handleConfirmSubmit(feature: Feature) {
    updateFeatureStatus(feature.id, "in_review")
    setSubmitFeature(null)
  }

  // Handle take feature success — refresh data
  function handleTakeSuccess() {
    // The contribution is created, but feature isn't assigned yet (pending approval)
    // Just close modal — data will update via realtime when lead approves
  }

  // Handle approve (lead engineer) — optimistic update then API
  async function handleApprove(feature: Feature) {
    updateFeatureStatus(feature.id, "done")
    try {
      // First find the contribution for this feature to approve it
      const contribRes = await fetch(
        `/api/contributions?project_id=${projectId}`
      )
      if (contribRes.ok) {
        const contributions = await contribRes.json()
        const contrib = contributions.find(
          (c: { feature_id: string; status: string }) =>
            c.feature_id === feature.id && c.status === "approved"
        )
        if (contrib) {
          // Contribution already approved, just update feature status
          await fetch(`/api/features/${feature.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "done" }),
          })
        } else {
          // Find pending contribution and approve it, then mark done
          const pendingContrib = contributions.find(
            (c: { feature_id: string; status: string }) =>
              c.feature_id === feature.id && c.status === "pending"
          )
          if (pendingContrib) {
            await fetch(`/api/contributions/${pendingContrib.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "approve" }),
            })
          }
          // Mark feature as done
          await fetch(`/api/features/${feature.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "done" }),
          })
        }
      }
    } catch (err) {
      console.error("Failed to approve:", err)
      updateFeatureStatus(feature.id, feature.status)
    }
  }

  // Handle request changes (lead engineer) — move back to in_progress
  async function handleRequestChanges(feature: Feature) {
    updateFeatureStatus(feature.id, "in_progress")
    try {
      await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      })
    } catch (err) {
      console.error("Failed to request changes:", err)
      updateFeatureStatus(feature.id, feature.status)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <WorkspaceSkeleton />
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 py-20">
            <h1 className="text-xl font-semibold text-[#0f172a]">
              Project not found
            </h1>
            <p className="text-sm text-[#64748b]">
              This project may have been removed or you don&apos;t have access.
            </p>
            <Link href="/dashboard/board">
              <Button className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]">
                Back to board
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const badgeStyle = statusBadgeStyles[project.status] || statusBadgeStyles.active
  const openFeatures = counts.todo

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
          {/* Section 1 — Project header */}
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav
                className="flex items-center gap-1 text-sm"
                style={{ color: "#64748b" }}
                aria-label="Breadcrumb"
              >
                <Link
                  href="/dashboard/board"
                  className="hover:text-[#0f172a]"
                >
                  Project board
                </Link>
                <ChevronRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span style={{ color: "#0f172a" }}>{project.name}</span>
              </nav>

              {isLeadEngineer && (
                <Button
                  variant="outline"
                  className="border-[#7c3aed] text-[#7c3aed] hover:bg-[#ede9fe] hover:text-[#7c3aed]"
                >
                  <CheckCircle
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Mark as complete
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-2xl font-bold text-pretty md:text-3xl"
                  style={{ color: "#0f172a" }}
                >
                  {project.name}
                </h1>
                <Badge
                  className="border-0 font-medium capitalize"
                  style={{
                    backgroundColor: badgeStyle.bg,
                    color: badgeStyle.color,
                  }}
                >
                  {project.status}
                </Badge>
              </div>
              <p
                className="max-w-3xl text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {project.pitch}
              </p>
            </div>
          </header>

          {/* Section 2 — Project details */}
          <section
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            aria-label="Project details"
          >
            {/* Tech stack */}
            <div
              className="flex flex-col gap-4 rounded-xl border bg-white p-5"
              style={{ borderColor: "#e2e8f0" }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#64748b" }}
              >
                Tech stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "#ede9fe",
                      color: "#6d28d9",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team */}
            <div
              className="flex flex-col gap-4 rounded-xl border bg-white p-5"
              style={{ borderColor: "#e2e8f0" }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#64748b" }}
              >
                Team
              </h2>

              <div className="flex flex-col gap-3">
                {project.team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3"
                  >
                    {member.is_lead && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: "#7c3aed" }}
                      >
                        Lead
                      </span>
                    )}
                    <Avatar
                      name={member.full_name}
                      avatarUrl={member.avatar_url}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#0f172a" }}
                    >
                      {member.full_name}
                      {member.id === currentUserId && (
                        <span className="ml-1 text-xs text-[#7c3aed]">
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {openFeatures > 0 && (
                <p
                  className="text-xs font-medium"
                  style={{ color: "#15803d" }}
                >
                  Open to contributors — {openFeatures} feature
                  {openFeatures === 1 ? "" : "s"} available
                </p>
              )}
            </div>

            {/* Progress */}
            <div
              className="flex flex-col gap-4 rounded-xl border bg-white p-5"
              style={{ borderColor: "#e2e8f0" }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#64748b" }}
              >
                Progress
              </h2>

              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#0f172a" }}
                >
                  {counts.done} / {counts.total}
                </span>
                <span className="text-xs" style={{ color: "#64748b" }}>
                  features done
                </span>
              </div>

              <Progress
                value={progressPct}
                className="h-2 bg-[#f1f5f9] [&>div]:bg-[#7c3aed]"
                aria-label={`${progressPct}% complete`}
              />

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span style={{ color: "#1d4ed8" }}>
                  {counts.inProgress} in progress
                </span>
                <span style={{ color: "#b45309" }}>
                  {counts.inReview} in review
                </span>
                <span style={{ color: "#475569" }}>
                  {counts.todo} to do
                </span>
              </div>
            </div>
          </section>

          {/* Section 3 — Kanban */}
          <section aria-label="Task board">
            <KanbanBoard
              features={features}
              currentUserId={currentUserId}
              isLeadEngineer={isLeadEngineer}
              onTake={(f) => setTakeFeature(f)}
              onMoveToInProgress={handleMoveToInProgress}
              onSubmit={(f) => setSubmitFeature(f)}
              onApprove={handleApprove}
              onRequestChanges={handleRequestChanges}
            />
          </section>
        </div>
      </main>

      <SubmitReviewModal
        feature={submitFeature}
        open={submitFeature !== null}
        onOpenChange={(o) => !o && setSubmitFeature(null)}
        onConfirm={handleConfirmSubmit}
      />
      <TakeFeatureModal
        feature={takeFeature}
        projectId={projectId}
        open={takeFeature !== null}
        onOpenChange={(o) => !o && setTakeFeature(null)}
        onSuccess={handleTakeSuccess}
      />
    </div>
  )
}