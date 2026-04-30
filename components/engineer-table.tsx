// components/engineer-table.tsx
"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface Engineer {
    name: string
    initials: string
    status: "active" | "recent" | "inactive"
    role: "lead" | "contributor" | "none"
    projects: string
    skills: string[]
    activityScore: number
    lastActive: string
}

interface EngineerTableProps {
    engineers: Engineer[]
    onRowClick: (engineer: Engineer) => void
}

type SortField = "status" | "role" | "activityScore" | "lastActive"
type SortDirection = "asc" | "desc"

const statusConfig = {
    active: { dot: "bg-[#15803d]", text: "text-[#15803d]", label: "Active", order: 1 },
    recent: { dot: "bg-[#b45309]", text: "text-[#b45309]", label: "Recent", order: 2 },
    inactive: { dot: "bg-[#b91c1c]", text: "text-[#b91c1c]", label: "Inactive", order: 3 },
}

const roleConfig = {
    lead: { bg: "bg-[#ede9fe]", text: "text-[#6d28d9]", label: "Lead Engineer", order: 1 },
    contributor: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", label: "Contributor", order: 2 },
    none: { bg: "bg-[#f1f5f9]", text: "text-[#475569]", label: "No active project", order: 3 },
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

const lastActiveOrder: Record<string, number> = {
    "Today": 1,
    "Yesterday": 2,
    "3 days ago": 3,
    "9 days ago": 4,
    "14 days ago": 5,
}

function getActivityBarColor(score: number): string {
    if (score >= 200) return "bg-[#7c3aed]"
    if (score >= 100) return "bg-[#f59e0b]"
    return "bg-[#94a3b8]"
}

export function EngineerTable({ engineers, onRowClick }: EngineerTableProps) {
    const [sortField, setSortField] = useState<SortField>("activityScore")
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
            case "status":
                comparison = statusConfig[a.status].order - statusConfig[b.status].order
                break
            case "role":
                comparison = roleConfig[a.role].order - roleConfig[b.role].order
                break
            case "activityScore":
                comparison = a.activityScore - b.activityScore
                break
            case "lastActive":
                comparison = (lastActiveOrder[a.lastActive] || 99) - (lastActiveOrder[b.lastActive] || 99)
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
                        <TableHead className="text-[#0f172a]">Engineer</TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center">
                                Status
                                <SortIcon field="status" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("role")}
                        >
                            <div className="flex items-center">
                                Current role
                                <SortIcon field="role" />
                            </div>
                        </TableHead>
                        <TableHead className="text-[#0f172a]">Projects</TableHead>
                        <TableHead className="text-[#0f172a]">Skills</TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("activityScore")}
                        >
                            <div className="flex items-center">
                                Activity score
                                <SortIcon field="activityScore" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-[#0f172a]"
                            onClick={() => handleSort("lastActive")}
                        >
                            <div className="flex items-center">
                                Last active
                                <SortIcon field="lastActive" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEngineers.map((engineer) => {
                        const status = statusConfig[engineer.status]
                        const role = roleConfig[engineer.role]

                        return (
                            <TableRow
                                key={engineer.name}
                                className="cursor-pointer border-[#e2e8f0] hover:bg-[#faf5ff]"
                                onClick={() => onRowClick(engineer)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ede9fe] text-xs font-semibold text-[#7c3aed]">
                                            {engineer.initials}
                                        </div>
                                        <span className="font-medium text-[#0f172a]">{engineer.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                                        <span className={`text-sm ${status.text}`}>{status.label}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${role.bg} ${role.text} hover:${role.bg}`}>
                                        {role.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-[#0f172a]">
                                    {engineer.projects}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {engineer.skills.slice(0, 3).map((skill) => {
                                            const colors = skillColors[skill] || { bg: "bg-[#f1f5f9]", text: "text-[#475569]" }
                                            return (
                                                <Badge
                                                    key={skill}
                                                    className={`${colors.bg} ${colors.text} text-xs hover:${colors.bg}`}
                                                >
                                                    {skill}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-20 overflow-hidden rounded-full bg-[#e2e8f0]">
                                            <div
                                                className={`h-full rounded-full ${getActivityBarColor(engineer.activityScore)}`}
                                                style={{ width: `${Math.min((engineer.activityScore / 400) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-[#0f172a]">
                                            {engineer.activityScore}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-[#64748b]">
                                    {engineer.lastActive}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
