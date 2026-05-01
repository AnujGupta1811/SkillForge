// components/contribution-requests-panel.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Check, X, Loader2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ContributionRequest {
  id: string
  status: string
  feature_id: string
  user_id: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  feature: {
    id: string
    title: string
  } | null
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function ContributorAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

interface ContributionRequestsPanelProps {
  requests: ContributionRequest[]
  onApprove: (request: ContributionRequest) => Promise<void>
  onDecline: (request: ContributionRequest) => Promise<void>
}

export function ContributionRequestsPanel({
  requests,
  onApprove,
  onDecline,
}: ContributionRequestsPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const pendingRequests = requests.filter((r) => r.status === "pending")

  async function handleAction(request: ContributionRequest, action: "approve" | "decline") {
    setLoadingId(request.id)
    setLoadingAction(action)
    try {
      if (action === "approve") {
        await onApprove(request)
      } else {
        await onDecline(request)
      }
    } finally {
      setLoadingId(null)
      setLoadingAction(null)
    }
  }

  return (
    <div
      className="rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#e2e8f0" }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between rounded-xl px-5 py-4 text-left transition-colors hover:bg-[#f8fafc]"
      >
        <div className="flex items-center gap-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: "#0f172a" }}
          >
            Contribution Requests
          </h2>
          {pendingRequests.length > 0 && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: "#7c3aed" }}
            >
              {pendingRequests.length}
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-[#64748b]" />
        ) : (
          <ChevronUp className="h-4 w-4 text-[#64748b]" />
        )}
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="border-t px-5 pb-4 pt-3" style={{ borderColor: "#e2e8f0" }}>
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "#f1f5f9" }}
              >
                <Inbox className="h-5 w-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm text-[#94a3b8]">No pending requests</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingRequests.map((request) => {
                const isLoading = loadingId === request.id
                return (
                  <li
                    key={request.id}
                    className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-all"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    {/* Contributor info */}
                    <ContributorAvatar
                      name={request.user?.full_name || "Unknown"}
                      avatarUrl={request.user?.avatar_url}
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className="truncate text-sm font-medium"
                        style={{ color: "#0f172a" }}
                      >
                        {request.user?.full_name || "Unknown User"}
                      </span>
                      <span
                        className="truncate text-xs"
                        style={{ color: "#64748b" }}
                      >
                        wants to work on{" "}
                        <span className="font-medium text-[#7c3aed]">
                          {request.feature?.title || "Unknown Feature"}
                        </span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(request, "approve")}
                        disabled={isLoading}
                        className="h-8 px-3 text-white hover:opacity-90"
                        style={{ backgroundColor: "#22c55e" }}
                      >
                        {isLoading && loadingAction === "approve" ? (
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
                        onClick={() => handleAction(request, "decline")}
                        disabled={isLoading}
                        className="h-8 px-3 border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] hover:text-[#ef4444]"
                      >
                        {isLoading && loadingAction === "decline" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <X className="mr-1 h-3.5 w-3.5" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
