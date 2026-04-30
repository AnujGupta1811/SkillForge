import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManagerDashboardClient } from '@/components/manager-dashboard-client'

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
    redirect('/dashboard') // Non-managers bounce back
  }

  return <ManagerDashboardClient />
}
