import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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

    console.log(`[projects/id] Fetching project ${id} as user ${user.id}`)

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
      .maybeSingle()

    if (projectError) {
      console.error('[projects/id] Fetch error:', projectError)
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      )
    }

    if (!project) {
      console.warn(`[projects/id] No project found for id=${id} — likely RLS blocking or project does not exist`)
      return NextResponse.json(
        { error: 'Project not found' },
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

    // Get project creator
    const { data: creator } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, email')
      .eq('id', project.created_by)
      .single()

    // Get all approved contributors (distinct users) using admin client to bypass RLS
    // (safe because we already verified the current user has access to this project)
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: approvedContributions } = await supabaseAdmin
      .from('contributions')
      .select('user_id, users(id, full_name, avatar_url, email)')
      .eq('project_id', id)
      .eq('status', 'approved')

    // Build unique team members list
    const contributorMap = new Map()
    ;(approvedContributions || []).forEach((c: any) => {
      if (c.users && c.user_id !== project.created_by) {
        const u = Array.isArray(c.users) ? c.users[0] : c.users;
        contributorMap.set(c.user_id, {
          ...u,
          role: 'contributor'
        })
      }
    })

    const team = [
      { ...creator, role: 'lead' },
      ...Array.from(contributorMap.values())
    ]

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
