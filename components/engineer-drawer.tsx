"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Lightbulb,
    FolderKanban,
    Puzzle,
    Trophy,
    CheckCircle2,
    Star,
    GitPullRequest,
    PlusCircle,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface EngineerDrawerProps {
    engineerId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
    manager: { bg: "bg-blue-100", text: "text-blue-700", label: "Manager" },
    platform_admin: { bg: "bg-blue-100", text: "text-blue-700", label: "Admin" },
    lead_engineer: { bg: "bg-violet-100", text: "text-violet-700", label: "Lead Engineer" },
    engineer: { bg: "bg-gray-100", text: "text-gray-600", label: "Engineer" },
}

const eventIconMap: Record<string, any> = {
    feature_completed: Puzzle,
    project_created: FolderKanban,
    contribution_approved: CheckCircle2,
    default: Star
}

export function EngineerDrawer({
    engineerId,
    open,
    onOpenChange,
}: EngineerDrawerProps) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!engineerId || !open) return

        async function fetchEngineer() {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/manager/engineer/${engineerId}`)
                if (res.ok) {
                    setData(await res.json())
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEngineer()
    }, [engineerId, open])

    if (!engineerId) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto bg-white px-6 sm:max-w-md flex flex-col h-full border-l border-slate-200">
                {isLoading || !data ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="border-b border-[#e2e8f0] pb-4 shrink-0">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={data.profile.avatar_url || ""} />
                                    <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold">
                                        {data.profile.full_name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-[#0f172a]">{data.profile.full_name}</h2>
                                    <p className="text-xs text-slate-500 mb-1">{data.profile.email}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={`${roleConfig[data.profile.role]?.bg || roleConfig.engineer.bg} ${roleConfig[data.profile.role]?.text || roleConfig.engineer.text} hover:bg-opacity-80 border-none`}>
                                            {roleConfig[data.profile.role]?.label || 'Engineer'}
                                        </Badge>
                                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                                            <Trophy className="h-3 w-3 text-yellow-500" />
                                            {data.profile.points}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/dashboard?userId=${data.profile.id}`}
                                        className="mt-2 inline-flex text-sm font-medium text-[#7c3aed] hover:underline"
                                    >
                                        View full dashboard &rarr;
                                    </Link>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto py-6 px-1 space-y-6">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: FolderKanban, label: "Projects Created", value: data.stats.projects_created },
                                    { icon: Puzzle, label: "Features Done", value: data.stats.features_completed },
                                    { icon: CheckCircle2, label: "Contributions", value: data.stats.contributions_approved },
                                    { icon: Star, label: "Points This Month", value: data.stats.points_this_month },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg bg-[#f8fafc] p-3 text-center border border-slate-100"
                                    >
                                        <stat.icon className="mx-auto h-5 w-5 text-[#7c3aed]" />
                                        <p className="mt-1 text-lg font-bold text-[#0f172a]">{stat.value}</p>
                                        <p className="text-xs text-[#64748b]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Current Projects */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Active Projects</h3>
                                {data.projects.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.projects.map((project: any) => (
                                            <div
                                                key={project.id}
                                                className="rounded-lg border border-[#e2e8f0] p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-[#0f172a] truncate mr-2">{project.name}</span>
                                                    <Badge className={`${project.role === 'lead' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'} text-[10px] shrink-0 border-none`}>
                                                        {project.role === 'lead' ? 'Lead' : 'Contributor'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                                                    <span>{project.feature_done} / {project.feature_total} features done</span>
                                                    <span className="capitalize">{project.status}</span>
                                                </div>
                                                <div className="mt-1">
                                                    <Progress value={project.feature_total > 0 ? (project.feature_done / project.feature_total) * 100 : 0} className="h-1.5 bg-[#e2e8f0]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#64748b]">No active projects</p>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Points History</h3>
                                {data.point_events.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.point_events.map((event: any) => {
                                            const Icon = eventIconMap[event.event_type] || eventIconMap.default
                                            return (
                                                <div key={event.id} className="flex items-start gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                                                        <Icon className="h-4 w-4 text-[#7c3aed]" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-[#0f172a] capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                                                            <span className="text-sm font-semibold text-[#15803d]">
                                                                +{event.points}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#94a3b8]">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#64748b]">No recent activity</p>
                                )}
                            </div>
                        </div>

                        <SheetFooter className="border-t border-[#e2e8f0] pt-4 pb-6 shrink-0 mt-auto">
                            <Button
                                variant="outline"
                                className="w-full text-slate-700"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
