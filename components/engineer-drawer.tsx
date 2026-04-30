// components/engineer-drawer.tsx
"use client"

import Link from "next/link"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Lightbulb,
    FolderKanban,
    Puzzle,
    Trophy,
    CheckCircle2,
    Star,
    GitPullRequest,
} from "lucide-react"

interface Engineer {
    name: string
    initials: string
    status: "active" | "recent" | "inactive"
    role: "lead" | "contributor" | "none"
    projects: string
    skills: string[]
    activityScore: number
    lastActive: string
}

interface EngineerDrawerProps {
    engineer: Engineer | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const skillColors: Record<string, { bg: string; text: string }> = {
    "Node.js": { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
    Redis: { bg: "bg-[#ede9fe]", text: "text-[#6d28d9]" },
    React: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
    Python: { bg: "bg-[#dcfce7]", text: "text-[#15803d]" },
    TypeScript: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
    PostgreSQL: { bg: "bg-[#dcfce7]", text: "text-[#15803d]" },
    Docker: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
    Backend: { bg: "bg-[#ede9fe]", text: "text-[#6d28d9]" },
    Frontend: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
    "Next.js": { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
}

const recentActivity = [
    {
        icon: CheckCircle2,
        event: "Solved Problem",
        description: "Rate Limiter implementation",
        points: "+25",
        date: "Today",
    },
    {
        icon: Star,
        event: "Skill Verified",
        description: "Backend architecture",
        points: "+50",
        date: "Yesterday",
    },
    {
        icon: GitPullRequest,
        event: "Feature Merged",
        description: "Redis caching layer",
        points: "+40",
        date: "2 days ago",
    },
    {
        icon: CheckCircle2,
        event: "Solved Problem",
        description: "JWT Authentication",
        points: "+20",
        date: "3 days ago",
    },
]

export function EngineerDrawer({
    engineer,
    open,
    onOpenChange,
}: EngineerDrawerProps) {
    if (!engineer) return null

    const statusConfig = {
        active: { dot: "bg-[#15803d]", text: "text-[#15803d]", label: "Active" },
        recent: { dot: "bg-[#b45309]", text: "text-[#b45309]", label: "Recent" },
        inactive: { dot: "bg-[#b91c1c]", text: "text-[#b91c1c]", label: "Inactive" },
    }

    const roleConfig = {
        lead: { bg: "bg-[#ede9fe]", text: "text-[#6d28d9]", label: "Lead Engineer" },
        contributor: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", label: "Contributor" },
        none: { bg: "bg-[#f1f5f9]", text: "text-[#475569]", label: "No active project" },
    }

    const status = statusConfig[engineer.status]
    const role = roleConfig[engineer.role]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto bg-white px-6 sm:max-w-md">
                <SheetHeader className="border-b border-[#e2e8f0] pb-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ede9fe] text-lg font-semibold text-[#7c3aed]">
                            {engineer.initials}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-[#0f172a]">{engineer.name}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge className={`${role.bg} ${role.text} hover:${role.bg}`}>
                                    {role.label}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                                    <span className={`text-sm ${status.text}`}>{status.label}</span>
                                </div>
                            </div>
                            <Link
                                href="/dashboard"
                                className="mt-2 inline-flex text-sm font-medium text-[#7c3aed] hover:underline"
                            >
                                View full dashboard &rarr;
                            </Link>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 py-6 px-1">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Lightbulb, label: "Problems solved", value: "12" },
                            { icon: FolderKanban, label: "Projects involved", value: "4" },
                            { icon: Puzzle, label: "Features built", value: "8" },
                            { icon: Trophy, label: "Points score", value: String(engineer.activityScore) },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-lg bg-[#f8fafc] p-3 text-center"
                            >
                                <stat.icon className="mx-auto h-5 w-5 text-[#7c3aed]" />
                                <p className="mt-1 text-lg font-bold text-[#0f172a]">{stat.value}</p>
                                <p className="text-xs text-[#64748b]">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Current Projects */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Current projects</h3>
                        {engineer.projects !== "—" ? (
                            <div className="space-y-3">
                                {engineer.projects.split(", ").map((project) => (
                                    <div
                                        key={project}
                                        className="rounded-lg border border-[#e2e8f0] p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-[#0f172a]">{project}</span>
                                            <Badge className={`${role.bg} ${role.text} text-xs hover:${role.bg}`}>
                                                {role.label}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge className="bg-[#dcfce7] text-[#15803d] text-xs hover:bg-[#dcfce7]">
                                                In Progress
                                            </Badge>
                                        </div>
                                        <div className="mt-2">
                                            <Progress value={65} className="h-1.5 bg-[#e2e8f0]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#64748b]">No active projects</p>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {engineer.skills.map((skill) => {
                                const colors = skillColors[skill] || { bg: "bg-[#f1f5f9]", text: "text-[#475569]" }
                                return (
                                    <Badge
                                        key={skill}
                                        className={`${colors.bg} ${colors.text} hover:${colors.bg}`}
                                    >
                                        {skill}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Recent activity</h3>
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ede9fe]">
                                        <activity.icon className="h-4 w-4 text-[#7c3aed]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-[#0f172a]">{activity.event}</p>
                                            <span className="text-sm font-semibold text-[#15803d]">
                                                {activity.points}
                                            </span>
                                        </div>
                                        <p className="truncate text-xs text-[#64748b]">{activity.description}</p>
                                        <p className="text-xs text-[#94a3b8]">{activity.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter className="border-t border-[#e2e8f0] pt-4">
                    <Button
                        variant="outline"
                        className="w-full border-[#7c3aed] text-[#7c3aed] hover:bg-[#ede9fe]"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
