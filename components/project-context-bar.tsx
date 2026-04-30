// components/project-context-bar.tsx
"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectContextBarProps {
    title: string
    source: string
    difficulty: string
    changeHref?: string
}

const sourceStyles: Record<string, string> = {
    "GitHub Issues": "bg-[#dbeafe] text-[#1d4ed8]",
    "Hacker News": "bg-[#ffedd5] text-[#c2410c]",
    "Stack Overflow": "bg-[#fef9c3] text-[#854d0e]",
}

const difficultyStyles: Record<string, string> = {
    Beginner: "bg-[#dcfce7] text-[#15803d]",
    Intermediate: "bg-[#fef9c3] text-[#854d0e]",
    Advanced: "bg-[#fee2e2] text-[#b91c1c]",
}

export function ProjectContextBar({
    title,
    source,
    difficulty,
    changeHref = "/dashboard/problems",
}: ProjectContextBarProps) {
    return (
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">
                        Generating project for:
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-[#0f172a] text-pretty">{title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                sourceStyles[source] ?? "bg-[#f1f5f9] text-[#475569]",
                            )}
                        >
                            {source}
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                difficultyStyles[difficulty] ?? "bg-[#f1f5f9] text-[#475569]",
                            )}
                        >
                            {difficulty}
                        </span>
                    </div>
                </div>

                <Link
                    href={changeHref}
                    className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change problem
                </Link>
            </div>
        </div>
    )
}
