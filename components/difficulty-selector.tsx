// components/difficulty-selector.tsx
"use client"

import { cn } from "@/lib/utils"

type DifficultyLevel = "beginner" | "intermediate" | "advanced"

interface DifficultySelectorProps {
  value: DifficultyLevel
  onChange: (value: DifficultyLevel) => void
}

const levels: { value: DifficultyLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Difficulty level">
      {levels.map((level) => {
        const isSelected = value === level.value
        return (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(level.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isSelected
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {level.label}
          </button>
        )
      })}
    </div>
  )
}
