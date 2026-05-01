import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManagerDashboardClient } from '@/components/manager-dashboard-client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Check role from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['manager', 'platform_admin'].includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mb-6 text-gray-600">This page is only available to managers and admins.</p>
          <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <ManagerDashboardClient />
}
