// components/take-feature-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Feature } from "@/lib/types"

interface TakeFeatureModalProps {
  feature: Feature | null
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TakeFeatureModal({ feature, projectId, open, onOpenChange, onSuccess }: TakeFeatureModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setSubmitted(false)
    }
  }, [open])

  async function handleSubmit() {
    if (!feature) return
    setSubmitting(true)
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
        setSubmitted(true)
        onSuccess()
      }
    } catch (err) {
      console.error("Failed to request contribution:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: "#0f172a" }}>
            {submitted ? "Request Sent!" : "Request to contribute"}
          </DialogTitle>
          <DialogDescription style={{ color: "#64748b" }}>
            {submitted
              ? "The project lead will review your request."
              : "Request to work on this feature. The Lead Engineer will review your request."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7]">
              <CheckCircle2 className="h-6 w-6 text-[#15803d]" />
            </div>
            <p className="text-sm font-medium text-[#0f172a]">Request sent successfully</p>
            <p className="text-center text-xs text-[#64748b]">
              You&apos;ll be assigned to &quot;{feature?.title}&quot; once approved.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-2 bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Feature info */}
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <p className="text-sm font-medium text-[#0f172a]">{feature?.title}</p>
              {feature?.description && (
                <p className="mt-1 text-xs text-[#64748b]">{feature.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Request to contribute"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                style={{ color: "#64748b" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
