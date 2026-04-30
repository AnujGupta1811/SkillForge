// components/source-selector.tsx
"use client"

import { GitBranch, Flame, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Source = "github" | "hackernews" | "stackoverflow"

interface SourceSelectorProps {
  value: Source[]
  onChange: (value: Source[]) => void
}

const sources: { value: Source; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "github", label: "GitHub Issues", icon: GitBranch },
  { value: "hackernews", label: "Hacker News", icon: Flame },
  { value: "stackoverflow", label: "Stack Overflow", icon: HelpCircle },
]

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  const toggleSource = (source: Source) => {
    if (value.includes(source)) {
      onChange(value.filter((s) => s !== source))
    } else {
      onChange([...value, source])
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Problem sources">
      {sources.map((source) => {
        const isSelected = value.includes(source.value)
        const Icon = source.icon
        return (
          <button
            key={source.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggleSource(source.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
              isSelected
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                isSelected ? "text-violet-600" : "text-slate-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isSelected ? "text-violet-700" : "text-slate-700"
              )}
            >
              {source.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
