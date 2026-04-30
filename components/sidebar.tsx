"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Zap,
  FolderOpen,
  LayoutGrid,
  BarChart2,
  Menu,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: "Find a problem", href: "/dashboard/intake", icon: Zap },
  { label: "My projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Project board", href: "/dashboard/board", icon: LayoutGrid },
  { label: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { label: "Manager view", href: "/dashboard/manager", icon: Users },
]

interface SidebarProps {
  activeHref?: string
}

function SidebarContent({ activeHref }: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()
  const pathname = usePathname()
  const currentPath = activeHref || pathname

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6">
        <Sparkles className="h-6 w-6 text-violet-600" />
        <span className="text-lg font-semibold text-slate-900">SkillForge</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-violet-600" : "text-slate-500"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-medium text-white">
            AK
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">
              Arjun Kapoor
            </span>
            <button 
              onClick={handleSignOut}
              className="text-left text-xs text-slate-500 hover:text-slate-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ activeHref }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sticky top-0 h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:block">
        <SidebarContent activeHref={activeHref} />
      </aside>

      {/* Mobile sidebar */}
      <div className="fixed left-0 top-0 z-40 flex h-14 w-full items-center border-b border-slate-200 bg-white px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent activeHref={activeHref} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <span className="font-semibold text-slate-900">SkillForge</span>
        </div>
      </div>
    </>
  )
}
