import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch project with creator
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        pitch,
        tech_stack,
        status,
        created_at,
        created_by,
        creator:users!projects_created_by_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (projectError || !project) {
      console.error('[projects/id] Fetch error:', projectError)
      return NextResponse.json(
        { error: projectError?.message || 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch features with assigned user details
    const { data: features } = await supabase
      .from('features')
      .select(`
        id,
        project_id,
        title,
        description,
        status,
        assigned_to,
        created_at,
        assigned_user:users!features_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: true })

    // Get team members (distinct users with approved contributions)
    const { data: contributions } = await supabase
      .from('contributions')
      .select(`
        user_id,
        user:users!contributions_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', id)
      .eq('status', 'approved')

    // Build team: creator + approved contributors (deduplicated)
    const seen = new Set<string>()
    const team: { id: string; full_name: string; avatar_url: string | null; is_lead: boolean }[] = []

    // Add creator as lead
    // Supabase join on .single() returns object, but TS may infer array
    const rawCreator = project.creator as unknown
    const creator = (Array.isArray(rawCreator) ? rawCreator[0] : rawCreator) as { id: string; full_name: string; avatar_url: string | null } | null
    if (creator) {
      seen.add(creator.id)
      team.push({ ...creator, is_lead: true })
    }

    // Add contributors
    if (contributions) {
      for (const c of contributions) {
        if (c.user_id && !seen.has(c.user_id) && c.user) {
          seen.add(c.user_id)
          const rawUser = c.user as unknown
          const u = (Array.isArray(rawUser) ? rawUser[0] : rawUser) as { id: string; full_name: string; avatar_url: string | null }
          team.push({ ...u, is_lead: false })
        }
      }
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      pitch: project.pitch,
      tech_stack: project.tech_stack || [],
      status: project.status || 'active',
      created_at: project.created_at,
      created_by: project.created_by,
      creator: project.creator,
      features: features || [],
      team,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch project'
    console.error('[projects/id] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
