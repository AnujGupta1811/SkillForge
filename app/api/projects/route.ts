import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's company_domain
    const { data: currentUser } = await supabase
      .from('users')
      .select('company_domain')
      .eq('id', user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch all projects for the company domain
    const { data: projects, error: projectsError } = await supabase
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
      .eq('company_domain', currentUser.company_domain)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('[projects] Fetch error:', projectsError)
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For each project, get feature counts and contributors
    const enrichedProjects = await Promise.all(
      (projects || []).map(async (project) => {
        // Get features count
        const { data: features } = await supabase
          .from('features')
          .select('id, status')
          .eq('project_id', project.id)

        const feature_total = features?.length || 0
        const feature_done = features?.filter(f => f.status === 'done').length || 0

        // Get unique contributors (users with approved contributions) using admin client to bypass RLS
        const { data: contributions } = await supabaseAdmin
          .from('contributions')
          .select('user_id, users(id, full_name, avatar_url)')
          .eq('project_id', project.id)
          .eq('status', 'approved')

        // Deduplicate contributors by user_id
        const seen = new Set<string>()
        const contributors = (contributions || [])
          .filter(c => {
            if (!c.user_id || seen.has(c.user_id)) return false
            seen.add(c.user_id)
            return true
          })
          .map(c => {
             const u = Array.isArray(c.users) ? c.users[0] : c.users;
             return u;
          })
          .filter(Boolean)

        return {
          id: project.id,
          name: project.name,
          pitch: project.pitch,
          tech_stack: project.tech_stack || [],
          status: project.status || 'active',
          created_at: project.created_at,
          creator: project.creator,
          feature_total,
          feature_done,
          contributors,
        }
      })
    )

    return NextResponse.json(enrichedProjects)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects'
    console.error('[projects] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
