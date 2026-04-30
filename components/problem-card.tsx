// components/problem-card.tsx
"use client"

import { useState } from "react"
import { ChevronDown, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProblemSource = "GitHub Issues" | "Hacker News" | "Stack Overflow"
export type ProblemDifficulty = "Beginner" | "Intermediate" | "Advanced"

export interface Problem {
  id: string
  source: ProblemSource
  difficulty: ProblemDifficulty
  title: string
  description: string
  tags: string[]
  aiSummary: string
}

interface ProblemCardProps {
  problem: Problem
  selected: boolean
  onSelect: (id: string) => void
}

const sourceStyles: Record<ProblemSource, string> = {
  "GitHub Issues": "bg-[#dbeafe] text-[#1d4ed8]",
  "Hacker News": "bg-[#ffedd5] text-[#c2410c]",
  "Stack Overflow": "bg-[#fef9c3] text-[#854d0e]",
}

const difficultyStyles: Record<ProblemDifficulty, string> = {
  Beginner: "bg-[#dcfce7] text-[#15803d]",
  Intermediate: "bg-[#fef9c3] text-[#854d0e]",
  Advanced: "bg-[#fee2e2] text-[#b91c1c]",
}

export function ProblemCard({ problem, selected, onSelect }: ProblemCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-5 transition-all sm:p-6",
        selected ? "border-[#7c3aed] ring-2 ring-[#ede9fe]" : "border-[#e2e8f0] hover:border-[#cbd5e1]",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                sourceStyles[problem.source],
              )}
            >
              {problem.source}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                difficultyStyles[problem.difficulty],
              )}
            >
              {problem.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 text-lg font-semibold leading-snug text-[#0f172a] text-pretty">
            {problem.title}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-sm leading-6 text-[#64748b] text-pretty">{problem.description}</p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#475569]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* AI Summary toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
            aria-expanded={expanded}
            aria-controls={`ai-summary-${problem.id}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {expanded ? "Hide AI summary" : "View AI summary"}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")}
            />
          </button>

          {/* Expandable AI summary */}
          <div
            id={`ai-summary-${problem.id}`}
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              expanded ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-lg border border-[#ede9fe] bg-[#faf5ff] p-3">
                <p className="text-sm leading-6 text-[#475569] text-pretty">{problem.aiSummary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Select button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(problem.id)}
            className={cn(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all sm:w-auto",
              selected
                ? "border-[#7c3aed] bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                : "border-[#7c3aed] bg-white text-[#7c3aed] hover:bg-[#faf5ff]",
            )}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                Selected
                <Check className="h-4 w-4" />
              </>
            ) : (
              "Select"
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
