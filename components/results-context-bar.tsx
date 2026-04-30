// components/results-context-bar.tsx
import Link from "next/link"
import { SlidersHorizontal } from "lucide-react"

interface ResultsContextBarProps {
  skill: string
  difficulty: string
  sources: string[]
  changeHref?: string
}

export function ResultsContextBar({
  skill,
  difficulty,
  sources,
  changeHref = "/dashboard/intake",
}: ResultsContextBarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#475569]">
        <span className="font-medium text-[#0f172a]">Showing results for:</span>
        <span className="font-medium text-[#0f172a]">{skill}</span>
        <span aria-hidden className="text-[#cbd5e1]">
          ·
        </span>
        <span className="font-medium text-[#0f172a]">{difficulty}</span>
        <span aria-hidden className="text-[#cbd5e1]">
          ·
        </span>
        <span className="text-[#475569]">{sources.join(", ")}</span>
      </div>
      <Link
        href={changeHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Change filters
      </Link>
    </div>
  )
}
