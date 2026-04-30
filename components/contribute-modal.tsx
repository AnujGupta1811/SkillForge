// components/contribute-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ProjectListItem, Feature } from "@/lib/types"

interface ContributeModalProps {
  project: ProjectListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContributeModal({ project, open, onOpenChange }: ContributeModalProps) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Fetch features when modal opens
  useEffect(() => {
    if (!open || !project) {
      setSelected(new Set())
      setSubmitted(false)
      setFeatures([])
      return
    }

    async function fetchFeatures() {
      setLoading(true)
      try {
        const res = await fetch(`/api/projects/${project!.id}`)
        if (res.ok) {
          const data = await res.json()
          // Only show features with status: 'todo' (available to take)
          setFeatures(
            (data.features || []).filter((f: Feature) => f.status === "todo")
          )
        }
      } catch (err) {
        console.error("Failed to fetch features:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [open, project])

  function toggleFeature(featureId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(featureId)) {
        next.delete(featureId)
      } else {
        next.add(featureId)
      }
      return next
    })
  }

  async function handleSubmit() {
    if (!project || selected.size === 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          feature_ids: Array.from(selected),
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error("Failed to submit contribution:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-[#e2e8f0] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0f172a] text-pretty">{project.name}</DialogTitle>
          <DialogDescription className="text-[#64748b]">
            {submitted
              ? "Your contribution request has been sent!"
              : "Select features you want to contribute to."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7]">
              <CheckCircle2 className="h-6 w-6 text-[#15803d]" />
            </div>
            <p className="text-sm font-medium text-[#0f172a]">Request sent successfully</p>
            <p className="text-center text-xs text-[#64748b]">
              The project lead will review your request. You&apos;ll be notified once it&apos;s approved.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-2 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              Done
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-[#f1f5f9]"
              />
            ))}
          </div>
        ) : features.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#64748b]">No features available to contribute to.</p>
          </div>
        ) : (
          <ul className="flex max-h-[320px] flex-col gap-2 overflow-y-auto py-2">
            {features.map((feature) => {
              const isSelected = selected.has(feature.id)
              return (
                <li
                  key={feature.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFeature(feature.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleFeature(feature.id)
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-[#7c3aed] bg-[#ede9fe]/50"
                      : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-[#7c3aed] bg-[#7c3aed]"
                        : "border-[#d1d5db] bg-white"
                    )}
                  >
                    {isSelected && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-[#0f172a]">
                      {feature.title}
                    </span>
                    {feature.description && (
                      <span className="line-clamp-1 text-xs text-[#64748b]">
                        {feature.description}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!submitted && !loading && features.length > 0 && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
              className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                `Request ${selected.size} feature${selected.size === 1 ? "" : "s"}`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
