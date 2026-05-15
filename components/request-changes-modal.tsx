// components/request-changes-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Feature } from "@/lib/types"

interface RequestChangesModalProps {
  feature: Feature | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (feature: Feature, comments: string) => void
}

export function RequestChangesModal({ feature, open, onOpenChange, onConfirm }: RequestChangesModalProps) {
  const [comments, setComments] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) {
      setComments("")
      setSubmitting(false)
      setError("")
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feature) return
    if (!comments.trim()) {
      setError("Please describe what needs to be changed.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_progress",
          review_comments: comments.trim(),
        }),
      })
      if (res.ok) {
        onConfirm(feature, comments.trim())
      } else {
        setError("Failed to submit. Please try again.")
      }
    } catch (err) {
      console.error("Failed to request changes:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: "#0f172a" }}>Request changes</DialogTitle>
          <DialogDescription style={{ color: "#64748b" }}>
            Explain what needs to be fixed. The engineer will receive your feedback by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <p className="text-sm font-medium text-[#0f172a]">{feature?.title}</p>
          </div>

          {feature?.review_notes && (
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Engineer's notes
              </p>
              <p className="text-sm text-[#475569] whitespace-pre-wrap">{feature.review_notes}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="change-comments" style={{ color: "#0f172a" }}>
              Feedback <span className="text-[#ef4444]">*</span>
            </Label>
            <Textarea
              id="change-comments"
              rows={4}
              value={comments}
              onChange={(e) => { setComments(e.target.value); setError("") }}
              placeholder="Describe what needs to be changed or improved…"
              className={error ? "border-[#ef4444]" : ""}
            />
            {error && <p className="text-xs text-[#ef4444]">{error}</p>}
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: "#f97316" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Request changes"
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
