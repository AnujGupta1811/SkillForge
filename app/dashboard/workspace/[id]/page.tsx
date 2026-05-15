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
import { RequestChangesModal } from "@/components/request-changes-modal"
import { ContributionRequestsPanel, type ContributionRequest } from "@/components/contribution-requests-panel"
import { createClient } from "@/lib/supabase/client"
import type { Feature, ProjectDetail } from "@/lib/types"

const statusBadgeStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: "#dcfce7", color: "#15803d" },
  completed: { bg: "#dbeafe", color: "#1d4ed8" },
  archived: { bg: "#f1f5f9", color: "#475569" },
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
  const [requestChangesFeature, setRequestChangesFeature] = useState<Feature | null>(null)

  // Contribution requests (for lead engineer panel)
  const [contributionRequests, setContributionRequests] = useState<ContributionRequest[]>([])
  // Pending feature IDs that the current user has requested (for non-lead users)
  const [myPendingFeatureIds, setMyPendingFeatureIds] = useState<Set<string>>(new Set())

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

      // Fetch contributions for this project
      const contribRes = await fetch(`/api/contributions?project_id=${projectId}`)
      if (contribRes.ok) {
        const contribData = await contribRes.json()
        const allContributions = contribData.contributions || []
        
        setContributionRequests(allContributions)

        // Build set of feature IDs this user has pending requests for
        if (user) {
          const pendingIds = new Set<string>()
          allContributions.forEach((c: any) => {
            if (c.user_id === user.id && c.status === "pending" && c.feature_id) {
              pendingIds.add(c.feature_id)
            }
          })
          setMyPendingFeatureIds(pendingIds)
        }
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
  function updateFeatureLocally(featureId: string, updates: Partial<Feature>) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, ...updates } : f))
    )
  }

  // CASE 1: "Start Feature" — project creator self-assigns and moves to in_progress
  async function handleStartFeature(feature: Feature) {
    // Optimistic update
    updateFeatureLocally(feature.id, {
      status: "in_progress",
      assigned_to: currentUserId,
      assigned_user: project?.creator
        ? { id: project.creator.id, full_name: project.creator.full_name, avatar_url: project.creator.avatar_url }
        : undefined,
    })
    try {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress", assigned_to: currentUserId }),
      })
      if (!res.ok) {
        // Revert on failure
        updateFeatureLocally(feature.id, {
          status: feature.status,
          assigned_to: feature.assigned_to,
          assigned_user: feature.assigned_user,
        })
      }
    } catch (err) {
      console.error("Failed to start feature:", err)
      updateFeatureLocally(feature.id, {
        status: feature.status,
        assigned_to: feature.assigned_to,
        assigned_user: feature.assigned_user,
      })
    }
  }

  // CASE 2: "Request to Contribute" — non-creator requests a feature
  async function handleRequestContribute(feature: Feature) {
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          feature_ids: [feature.id],
        }),
      })
      if (res.ok) {
        // Add to pending set
        setMyPendingFeatureIds((prev) => {
          const next = new Set(prev)
          next.add(feature.id)
          return next
        })
        // Re-fetch contributions so lead engineer panel updates too
        const contribRes = await fetch(`/api/contributions?project_id=${projectId}`)
        if (contribRes.ok) {
          const contribData = await contribRes.json()
          setContributionRequests(contribData.contributions || [])
        }
      }
    } catch (err) {
      console.error("Failed to request contribution:", err)
    }
  }

  // Handle submit for review — via modal
  function handleConfirmSubmit(feature: Feature) {
    updateFeatureLocally(feature.id, { status: "in_review" })
    setSubmitFeature(null)
  }

  // Handle approve (lead engineer) — move feature to done
  async function handleApprove(feature: Feature) {
    updateFeatureLocally(feature.id, { status: "done" })
    try {
      await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      })
    } catch (err) {
      console.error("Failed to approve:", err)
      updateFeatureLocally(feature.id, { status: feature.status })
    }
  }

  // Handle request changes (lead engineer) — opens modal to collect feedback
  function handleRequestChanges(feature: Feature) {
    setRequestChangesFeature(feature)
  }

  // Called by modal after successful PATCH
  function handleConfirmRequestChanges(feature: Feature, comments: string) {
    updateFeatureLocally(feature.id, {
      status: "in_progress",
      review_comments: comments,
    })
    setRequestChangesFeature(null)
  }

  // Contribution panel: Approve a request
  async function handleApproveContribution(request: ContributionRequest) {
    try {
      const res = await fetch(`/api/contributions/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (res.ok) {
        const data = await res.json()

        // Remove from requests list
        setContributionRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: "approved" } : r))
        )

        // Update the feature in the kanban board — move to in_progress, assign contributor
        if (data.feature) {
          updateFeatureLocally(request.feature_id, {
            status: data.feature.status,
            assigned_to: data.feature.assigned_to,
            assigned_user: data.feature.assigned_user,
          })
        } else if (request.feature_id && request.user) {
          // Fallback: update with what we know
          updateFeatureLocally(request.feature_id, {
            status: "in_progress",
            assigned_to: request.user_id,
            assigned_user: {
              id: request.user.id,
              full_name: request.user.full_name,
              avatar_url: request.user.avatar_url,
            },
          })
        }
      }
    } catch (err) {
      console.error("Failed to approve contribution:", err)
    }
  }

  // Contribution panel: Decline a request
  async function handleDeclineContribution(request: ContributionRequest) {
    try {
      const res = await fetch(`/api/contributions/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      if (res.ok) {
        // Remove from requests list
        setContributionRequests((prev) =>
          prev.filter((r) => r.id !== request.id)
        )
      }
    } catch (err) {
      console.error("Failed to decline contribution:", err)
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
                {project.team?.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar avatarUrl={member.avatar_url} name={member.full_name} size="sm" />
                    <span className="text-sm text-[#0f172a]">{member.full_name}</span>
                    {member.id === currentUserId && (
                      <span className="text-xs text-[#64748b]">(you)</span>
                    )}
                    {member.role === 'lead' && (
                      <span className="text-xs bg-[#7c3aed] text-white px-2 py-0.5 rounded-full">
                        LEAD
                      </span>
                    )}
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

          {/* Section 2.5 — Contribution Requests (lead engineer only) */}
          {isLeadEngineer && (
            <section aria-label="Contribution requests">
              <ContributionRequestsPanel
                requests={contributionRequests}
                onApprove={handleApproveContribution}
                onDecline={handleDeclineContribution}
              />
            </section>
          )}

          {/* Section 3 — Kanban */}
          <section aria-label="Task board">
            <KanbanBoard
              features={features}
              currentUserId={currentUserId}
              isLeadEngineer={isLeadEngineer}
              myPendingFeatureIds={myPendingFeatureIds}
              onStartFeature={handleStartFeature}
              onRequestContribute={handleRequestContribute}
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

      <RequestChangesModal
        feature={requestChangesFeature}
        open={requestChangesFeature !== null}
        onOpenChange={(o) => !o && setRequestChangesFeature(null)}
        onConfirm={handleConfirmRequestChanges}
      />
    </div>
  )
}