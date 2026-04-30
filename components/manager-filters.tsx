// components/manager-filters.tsx
"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ManagerFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    roleFilter: string
    onRoleChange: (value: string) => void
    skillFilter: string
    onSkillChange: (value: string) => void
    resultCount: number
}

export function ManagerFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    roleFilter,
    onRoleChange,
    skillFilter,
    onSkillChange,
    resultCount,
}: ManagerFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search Input */}
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                    <Input
                        placeholder="Search engineers..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 border-[#e2e8f0] focus-visible:ring-[#7c3aed]"
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap gap-2">
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[140px] border-[#e2e8f0]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="recent">Recent</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={onRoleChange}>
                        <SelectTrigger className="w-[160px] border-[#e2e8f0]">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="lead">Lead Engineer</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                            <SelectItem value="none">No active project</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={skillFilter} onValueChange={onSkillChange}>
                        <SelectTrigger className="w-[140px] border-[#e2e8f0]">
                            <SelectValue placeholder="All skills" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All skills</SelectItem>
                            <SelectItem value="Node.js">Node.js</SelectItem>
                            <SelectItem value="React">React</SelectItem>
                            <SelectItem value="Python">Python</SelectItem>
                            <SelectItem value="TypeScript">TypeScript</SelectItem>
                            <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                            <SelectItem value="Docker">Docker</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <p className="text-sm text-[#64748b]">
                Showing {resultCount} engineer{resultCount !== 1 ? "s" : ""}
            </p>
        </div>
    )
}
