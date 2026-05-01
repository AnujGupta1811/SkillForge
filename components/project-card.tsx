// components/project-card.tsx
"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { ProjectListItem } from "@/lib/types"

const statusStyles: Record<string, string> = {
    active: "bg-[#dcfce7] text-[#15803d]",
    completed: "bg-[#dbeafe] text-[#1d4ed8]",
    archived: "bg-[#f1f5f9] text-[#475569]",
    // Fallback for legacy data
    Active: "bg-[#dcfce7] text-[#15803d]",
    Stalled: "bg-[#fee2e2] text-[#b91c1c]",
    Complete: "bg-[#dbeafe] text-[#1d4ed8]",
}

interface ProjectCardProps {
    project: ProjectListItem
    currentUserId?: string
    onView: (project: ProjectListItem) => void
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function daysAgo(dateStr: string): string {
    const diff = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 0) return "today"
    if (diff === 1) return "1 day ago"
    return `${diff} days ago`
}

export function ProjectCard({ project, currentUserId, onView }: ProjectCardProps) {
    const progressPct =
        project.feature_total > 0
            ? Math.round((project.feature_done / project.feature_total) * 100)
            : 0

    const statusKey = project.status || "active"
    const isComplete = statusKey === "completed" || statusKey === "Complete"

    const tagsToShow = project.tech_stack.slice(0, 3)
    const extraTags = project.tech_stack.length - 3

    return (
        <Card
            className={cn(
                "relative flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-none transition-shadow hover:shadow-sm"
            )}
        >
            {/* Top row: name + status */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold leading-snug text-[#0f172a] text-pretty">
                    {project.name}
                </h3>
                <span
                    className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        statusStyles[statusKey] || statusStyles.active
                    )}
                >
                    {isComplete && <CheckCircle2 className="h-3 w-3" />}
                    {statusKey}
                </span>
            </div>

            {/* Description */}
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[#64748b]">
                {project.pitch}
            </p>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5">
                {tagsToShow.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#475569]"
                    >
                        {tag}
                    </span>
                ))}
                {extraTags > 0 && (
                    <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-medium text-[#94a3b8]">
                        +{extraTags} more
                    </span>
                )}
            </div>

            {/* Features progress */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0f172a]">Progress</span>
                    <span className="text-[#64748b]">
                        {project.feature_done} of {project.feature_total} done
                    </span>
                </div>
                <Progress
                    value={progressPct}
                    className="h-1.5 bg-[#f1f5f9] [&>div]:bg-[#7c3aed]"
                    aria-label={`${project.feature_done} of ${project.feature_total} features done`}
                />
            </div>

            {/* Creator row */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">Lead:</span>
                <Avatar
                    name={project.creator?.full_name || "Unknown"}
                    avatarUrl={project.creator?.avatar_url}
                />
                <span className="text-sm font-medium text-[#0f172a]">
                    {project.creator?.full_name || "Unknown"}
                </span>
                <span className="text-xs text-[#94a3b8]">
                    · Started {daysAgo(project.created_at)}
                </span>
            </div>

            {/* Bottom action row */}
            <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] pt-4">
                <div className="flex items-center gap-2">
                    {project.contributors.length > 0 ? (
                        <>
                            <div className="flex">
                                {project.contributors.slice(0, 4).map((c, i) => (
                                    <div key={c.id} className={cn(i > 0 && "-ml-2")}>
                                        <Avatar
                                            name={c.full_name}
                                            avatarUrl={c.avatar_url}
                                            ringed
                                        />
                                    </div>
                                ))}
                                {project.contributors.length > 4 && (
                                    <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f5f9] text-[10px] font-semibold text-[#64748b] ring-2 ring-white">
                                        +{project.contributors.length - 4}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-[#64748b]">
                                {project.contributors.length} contributor
                                {project.contributors.length === 1 ? "" : "s"}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-[#64748b]">No contributors yet</span>
                    )}
                </div>
                {currentUserId !== project.creator?.id && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(project)}
                        className="h-8 border-[#7c3aed] bg-white text-[#7c3aed] hover:bg-[#ede9fe] hover:text-[#7c3aed]"
                    >
                        Contribute
                    </Button>
                )}
            </div>
        </Card>
    )
}

function Avatar({
    name,
    avatarUrl,
    ringed = false,
}: {
    name: string
    avatarUrl?: string | null
    ringed?: boolean
}) {
    const initials = getInitials(name)

    if (avatarUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={avatarUrl}
                alt={name}
                className={cn(
                    "h-7 w-7 rounded-full object-cover",
                    ringed && "ring-2 ring-white"
                )}
            />
        )
    }

    return (
        <div
            className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-[#ede9fe] text-[11px] font-semibold text-[#7c3aed]",
                ringed && "ring-2 ring-white"
            )}
            aria-hidden="true"
        >
            {initials}
        </div>
    )
}
