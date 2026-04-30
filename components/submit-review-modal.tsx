// components/submit-review-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Feature } from "@/lib/types"

interface SubmitReviewModalProps {
  feature: Feature | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (feature: Feature) => void
}

export function SubmitReviewModal({ feature, open, onOpenChange, onConfirm }: SubmitReviewModalProps) {
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setNotes("")
      setSubmitting(false)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feature) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_review" }),
      })
      if (res.ok) {
        // Optimistic update — caller will update state
        onConfirm(feature)
      }
    } catch (err) {
      console.error("Failed to submit for review:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: "#0f172a" }}>Submit feature for review</DialogTitle>
          <DialogDescription style={{ color: "#64748b" }}>
            Describe what you built so the Lead Engineer can review your work.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <p className="text-sm font-medium text-[#0f172a]">{feature?.title}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="review-notes" style={{ color: "#0f172a" }}>
              Notes (optional)
            </Label>
            <Textarea
              id="review-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you implemented, any decisions you made…"
            />
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit for review"
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
