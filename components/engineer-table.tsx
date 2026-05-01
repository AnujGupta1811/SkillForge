"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export interface Engineer {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
    role: string
    points: number
    projects_created: number
    features_completed: number
    contributions_approved: number
    last_active: string | null
    activity_score: number
}

interface EngineerTableProps {
    engineers: Engineer[]
    onRowClick: (engineer: Engineer) => void
}

type SortField = "name" | "role" | "points" | "activity_score" | "features_completed" | "last_active"
type SortDirection = "asc" | "desc"

const roleConfig: Record<string, { bg: string; text: string; label: string; order: number }> = {
    manager: { bg: "bg-blue-100", text: "text-blue-700", label: "Manager", order: 1 },
    platform_admin: { bg: "bg-blue-100", text: "text-blue-700", label: "Admin", order: 2 },
    lead_engineer: { bg: "bg-violet-100", text: "text-violet-700", label: "Lead Engineer", order: 3 },
    engineer: { bg: "bg-gray-100", text: "text-gray-600", label: "Engineer", order: 4 },
}

function getActivityBarColor(score: number): string {
    return "bg-violet-500"
}

export function EngineerTable({ engineers, onRowClick }: EngineerTableProps) {
    const [sortField, setSortField] = useState<SortField>("points")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const sortedEngineers = [...engineers].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case "name":
                comparison = a.full_name.localeCompare(b.full_name)
                break
            case "role":
                comparison = (roleConfig[a.role]?.order || 99) - (roleConfig[b.role]?.order || 99)
                break
            case "points":
                comparison = (a.points || 0) - (b.points || 0)
                break
            case "activity_score":
                comparison = a.activity_score - b.activity_score
                break
            case "features_completed":
                comparison = a.features_completed - b.features_completed
                break
            case "last_active":
                const dateA = a.last_active ? new Date(a.last_active).getTime() : 0
                const dateB = b.last_active ? new Date(b.last_active).getTime() : 0
                comparison = dateA - dateB
                break
        }

        return sortDirection === "asc" ? comparison : -comparison
    })

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ChevronUp className="ml-1 h-4 w-4 opacity-30" />
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
        )
    }

    return (
        <div className="rounded-xl border border-[#e2e8f0] bg-white">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("name")}
                        >
                            <div className="flex items-center">
                                Engineer
                                <SortIcon field="name" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("role")}
                        >
                            <div className="flex items-center">
                                Role
                                <SortIcon field="role" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("points")}
                        >
                            <div className="flex items-center">
                                Points
                                <SortIcon field="points" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("activity_score")}
                        >
                            <div className="flex items-center">
                                Activity Score
                                <SortIcon field="activity_score" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("features_completed")}
                        >
                            <div className="flex items-center">
                                Features Done
                                <SortIcon field="features_completed" />
                            </div>
                        </TableHead>
                        <TableHead className="text-[#0f172a]">Projects</TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("last_active")}
                        >
                            <div className="flex items-center">
                                Last Active
                                <SortIcon field="last_active" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEngineers.map((engineer) => {
                        const role = roleConfig[engineer.role] || roleConfig.engineer

                        return (
                            <TableRow
                                key={engineer.id}
                                className="cursor-pointer border-[#e2e8f0] hover:bg-[#faf5ff]"
                                onClick={() => onRowClick(engineer)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={engineer.avatar_url || ""} />
                                            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                                                {engineer.full_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[#0f172a]">{engineer.full_name}</span>
                                            <span className="text-xs text-slate-500">{engineer.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${role.bg} ${role.text} hover:${role.bg} border-none`}>
                                        {role.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-medium text-slate-900">
                                        <Trophy className="h-3 w-3 text-yellow-500" />
                                        {engineer.points || 0}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full ${getActivityBarColor(engineer.activity_score)}`}
                                                style={{ width: `${Math.min(engineer.activity_score, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-[#0f172a]">
                                            {engineer.activity_score}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-[#0f172a]">
                                    {engineer.features_completed}
                                </TableCell>
                                <TableCell className="text-sm text-[#0f172a]">
                                    {engineer.projects_created}
                                </TableCell>
                                <TableCell className="text-sm text-[#64748b]">
                                    {engineer.last_active ? formatDistanceToNow(new Date(engineer.last_active), { addSuffix: true }) : "Never"}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
