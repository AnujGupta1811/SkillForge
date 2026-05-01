import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')

    const supabase = await createClient()
    const adminClient = createAdminClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 1. Current User Profile (for permissions) ──────────────────────────────
    const { data: currentProfile } = await supabase
      .from('users')
      .select('id, role, company_domain')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let targetUserId = currentUser.id
    if (requestedUserId && requestedUserId !== currentUser.id) {
      // Permission check: only managers or admins can view others
      if (!['manager', 'platform_admin'].includes(currentProfile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      targetUserId = requestedUserId
    }

    // ── 2. Target Profile ───────────────────────────────────────────────────────
    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('id, full_name, avatar_url, email, points, role, company_domain')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) {
      console.error('[dashboard] profile fetch error:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Security check: must be in same company (unless platform_admin)
    if (profile.company_domain !== currentProfile.company_domain && currentProfile.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── 3. Stats ──────────────────────────────────────────────────────────────
    const [
      { count: projects_created },
      { count: features_completed },
      { count: contributions_approved },
    ] = await Promise.all([
      adminClient
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', targetUserId),
      adminClient
        .from('features')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', targetUserId)
        .eq('status', 'done'),
      adminClient
        .from('contributions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('status', 'approved'),
    ])

    // Points this calendar month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // ── 4. Rank ───────────────────────────────────────────────────────────────
    const { data: companyUsers } = await adminClient
      .from('users')
      .select('id, points')
      .eq('company_domain', profile.company_domain)
      .order('points', { ascending: false })

    const engineers = companyUsers ?? []
    const total_engineers = engineers.length
    const rank_number =
      engineers.findIndex((u) => u.id === targetUserId) + 1 || total_engineers
    const users_below = total_engineers - rank_number
    const percentile =
      total_engineers > 1
        ? Math.round((users_below / (total_engineers - 1)) * 100)
        : 100

    // ── 5. Skill tags ─────────────────────────────────────────────────────────
    const { data: doneFeatures } = await adminClient
      .from('features')
      .select('project_id')
      .eq('assigned_to', targetUserId)
      .eq('status', 'done')

    let skill_tags: string[] = []
    if (doneFeatures && doneFeatures.length > 0) {
      const projectIds = [...new Set(doneFeatures.map((f) => f.project_id))]
      const { data: tagProjects } = await adminClient
        .from('projects')
        .select('tech_stack')
        .in('id', projectIds)

      const allTags = (tagProjects ?? []).flatMap(
        (p) => (p.tech_stack as string[]) ?? [],
      )
      skill_tags = [...new Set(allTags)]
    }

    // ── 6. Point events ──────────────────────────────────────────────────────
    const { data: rawPointEvents } = await adminClient
      .from('point_events')
      .select('event_type, points, created_at, metadata')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    const allEvents = rawPointEvents ?? []

    // ── 7. Deduplicate and Calculate Points ──────────────────────────────────
    // Get project names for deduplication
    const projectIds = allEvents
      .filter(e => e.event_type === 'project_published' && e.metadata?.project_id)
      .map(e => e.metadata?.project_id as string)
    
    let projectMap: Record<string, string> = {}
    if (projectIds.length > 0) {
      const { data: projects } = await adminClient
        .from('projects')
        .select('id, name')
        .in('id', projectIds)
      projects?.forEach(p => { projectMap[p.id] = p.name })
    }

    const seenProjectNames = new Set<string>()
    const deduplicatedEvents: any[] = []
    let total_points = 0
    let points_this_month = 0
    
    for (const event of allEvents) {
      let skip = false
      if (event.event_type === 'project_published') {
        const projectName = projectMap[event.metadata?.project_id as string] || event.metadata?.project_id
        if (projectName && seenProjectNames.has(projectName)) {
          skip = true
        } else if (projectName) {
          seenProjectNames.add(projectName)
        }
      }

      if (!skip) {
        deduplicatedEvents.push(event)
        total_points += (event.points ?? 0)
        if (new Date(event.created_at) >= startOfMonth) {
          points_this_month += (event.points ?? 0)
        }
      }
    }

    const point_events = deduplicatedEvents.slice(0, 20)

    // ── 8. Activity (last 90 days) ────────────────────────────────────────────
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89)
    ninetyDaysAgo.setHours(0, 0, 0, 0)

    const activityMap: Record<string, number> = {}
    for (const event of deduplicatedEvents) {
      const d = new Date(event.created_at)
      if (d >= ninetyDaysAgo) {
        const dateKey = event.created_at.slice(0, 10)
        activityMap[dateKey] = (activityMap[dateKey] ?? 0) + 1
      }
    }

    const activity: { date: string; count: number }[] = []
    for (let i = 89; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      activity.push({ date: key, count: activityMap[key] ?? 0 })
    }

    // ── 9. Projects ───────────────────────────────────────────────────────────
    const { data: createdProjects } = await adminClient
      .from('projects')
      .select('id, name, status')
      .eq('created_by', targetUserId)

    const { data: contributedRaw } = await adminClient
      .from('contributions')
      .select('project_id')
      .eq('user_id', targetUserId)
      .eq('status', 'approved')

    const contributedProjectIds = [
      ...new Set((contributedRaw ?? []).map((c) => c.project_id)),
    ]

    const createdIds = new Set((createdProjects ?? []).map((p) => p.id))
    const uniqueContribIds = contributedProjectIds.filter(
      (id) => !createdIds.has(id),
    )

    let contributedProjects: { id: string; name: string; status: string }[] = []
    if (uniqueContribIds.length > 0) {
      const { data } = await adminClient
        .from('projects')
        .select('id, name, status')
        .in('id', uniqueContribIds)
      contributedProjects = data ?? []
    }

    const allProjectIds = [
      ...(createdProjects ?? []).map((p) => p.id),
      ...contributedProjects.map((p) => p.id),
    ]

    const featureCounts: Record<string, { total: number; done: number }> = {}
    if (allProjectIds.length > 0) {
      const { data: allFeatures } = await adminClient
        .from('features')
        .select('project_id, status')
        .in('project_id', allProjectIds)

      for (const f of allFeatures ?? []) {
        if (!featureCounts[f.project_id]) {
          featureCounts[f.project_id] = { total: 0, done: 0 }
        }
        featureCounts[f.project_id].total++
        if (f.status === 'done') featureCounts[f.project_id].done++
      }
    }

    const projects = [
      ...(createdProjects ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status ?? 'active',
        feature_total: featureCounts[p.id]?.total ?? 0,
        feature_done: featureCounts[p.id]?.done ?? 0,
        role: 'lead' as const,
      })),
      ...contributedProjects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status ?? 'active',
        feature_total: featureCounts[p.id]?.total ?? 0,
        feature_done: featureCounts[p.id]?.done ?? 0,
        role: 'contributor' as const,
      })),
    ]

    return NextResponse.json({
      profile: {
        ...profile,
        points: total_points
      },
      stats: {
        projects_created: projects_created ?? 0,
        features_completed: features_completed ?? 0,
        contributions_approved: contributions_approved ?? 0,
        points_this_month,
      },
      rank: {
        percentile,
        rank_number,
        total_engineers,
      },
      skill_tags,
      point_events,
      projects,
      activity,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load dashboard'
    console.error('[dashboard] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
