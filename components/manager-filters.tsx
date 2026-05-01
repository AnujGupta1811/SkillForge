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
    roleFilter: string
    onRoleChange: (value: string) => void
    resultCount: number
}

export function ManagerFilters({
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleChange,
    resultCount,
}: ManagerFiltersProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search Input */}
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 border-[#e2e8f0] focus-visible:ring-[#7c3aed]"
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap gap-2">
                    <Select value={roleFilter} onValueChange={onRoleChange}>
                        <SelectTrigger className="w-[160px] border-[#e2e8f0]">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                            <SelectItem value="lead_engineer">Lead Engineer</SelectItem>
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
