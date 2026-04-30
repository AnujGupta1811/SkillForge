import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { project_id, feature_ids } = await req.json()

    if (!project_id || !feature_ids || !Array.isArray(feature_ids) || feature_ids.length === 0) {
      return NextResponse.json(
        { error: 'project_id and feature_ids[] are required' },
        { status: 400 }
      )
    }

    // Insert a contribution row for each feature
    const rows = feature_ids.map((feature_id: string) => ({
      project_id,
      user_id: user.id,
      feature_id,
      status: 'pending',
    }))

    const { data, error } = await supabase
      .from('contributions')
      .insert(rows)
      .select()

    if (error) {
      console.error('[contributions] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contributions: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create contribution'
    console.error('[contributions] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const project_id = searchParams.get('project_id')

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id query param is required' },
        { status: 400 }
      )
    }

    const { data: contributions, error } = await supabase
      .from('contributions')
      .select(`
        id,
        project_id,
        user_id,
        feature_id,
        status,
        created_at,
        user:users!contributions_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        feature:features!contributions_feature_id_fkey (
          id,
          title
        )
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[contributions] Fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(contributions || [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch contributions'
    console.error('[contributions] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
