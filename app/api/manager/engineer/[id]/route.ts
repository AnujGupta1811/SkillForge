import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Project {
  id: string
  name: string
  status: string
  created_by: string
}

interface Feature {
  project_id: string
  status: string
}

interface ProjectWithRole extends Project {
  role: 'lead' | 'contributor'
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, company_domain')
    .eq('id', user.id)
    .single()

  if (!profile || !['manager', 'platform_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: targetId } = await params

  const { data: engineer } = await supabase
    .from('users')
    .select('*')
    .eq('id', targetId)
    .eq('company_domain', profile.company_domain)
    .single()

  if (!engineer) {
    return NextResponse.json({ error: 'Engineer not found' }, { status: 404 })
  }

  // Point events - use adminClient to bypass RLS for history
  const adminClient = createAdminClient()

  // Fetch engineer's data
  const { data: createdProjects } = await adminClient
    .from('projects')
    .select('id, name, status, created_by')
    .eq('created_by', targetId)

  // Projects where user is a contributor
  const { data: contributions } = await adminClient
    .from('contributions')
    .select('project_id, status')
    .eq('user_id', targetId)
    .eq('status', 'approved')
    
  const contributedProjectIds = contributions?.map(c => c.project_id) || []
  
  let contributedProjects: Project[] = []
  if (contributedProjectIds.length > 0) {
    const { data } = await adminClient
      .from('projects')
      .select('id, name, status, created_by')
      .in('id', contributedProjectIds)
    contributedProjects = data || []
  }

  // Merge projects
  const allProjectMap = new Map<string, ProjectWithRole>()
  createdProjects?.forEach(p => allProjectMap.set(p.id, { ...p, role: 'lead' }))
  contributedProjects?.forEach(p => {
    if (!allProjectMap.has(p.id)) {
      allProjectMap.set(p.id, { ...p, role: 'contributor' })
    }
  })
  
  const mergedProjects = Array.from(allProjectMap.values())

  // For each project, fetch feature counts
  const projectIds = mergedProjects.map(p => p.id)
  
  let features: Feature[] = []
  if (projectIds.length > 0) {
    const { data } = await adminClient
      .from('features')
      .select('project_id, status')
      .in('project_id', projectIds)
    features = data || []
  }

  const projectsWithStats = mergedProjects.map(p => {
    const pFeatures = features?.filter(f => f.project_id === p.id) || []
    return {
      ...p,
      feature_total: pFeatures.length,
      feature_done: pFeatures.filter(f => f.status === 'done').length
    }
  })

  // Features done by engineer
  const { data: userFeatures } = await adminClient
    .from('features')
    .select('id')
    .eq('assigned_to', targetId)
    .eq('status', 'done')
    
  const features_completed = userFeatures?.length || 0

  const { data: pointEvents } = await adminClient
    .from('point_events')
    .select('*')
    .eq('user_id', targetId)
    .order('created_at', { ascending: false })

  const recentPointEvents = pointEvents?.slice(0, 10) || []
  
  // Points this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const points_this_month = pointEvents
    ?.filter(e => new Date(e.created_at) >= firstDayOfMonth)
    .reduce((acc, e) => acc + e.points, 0) || 0

  // Daily activity for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)
  
  const activityMap = new Map()
  pointEvents?.forEach(e => {
    const d = new Date(e.created_at)
    if (d >= thirtyDaysAgo) {
      const dateStr = d.toISOString().split('T')[0]
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1)
    }
  })

  const activity = Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    profile: {
      id: engineer.id,
      full_name: engineer.full_name,
      avatar_url: engineer.avatar_url,
      email: engineer.email,
      role: engineer.role,
      points: engineer.points
    },
    stats: {
      projects_created: createdProjects?.length || 0,
      features_completed,
      contributions_approved: contributions?.length || 0,
      points_this_month
    },
    projects: projectsWithStats,
    point_events: recentPointEvents,
    activity
  })
}
