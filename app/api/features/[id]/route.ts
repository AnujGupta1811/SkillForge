import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, assigned_to } = body
    const validStatuses = ['todo', 'in_progress', 'in_review', 'done']

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the feature
    const { data: feature, error: fetchError } = await supabase
      .from('features')
      .select('id, project_id, assigned_to, status')
      .eq('id', id)
      .single()

    if (fetchError || !feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Check authorization: only assigned user or project creator can update
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', feature.project_id)
      .single()

    const isAssignee = feature.assigned_to === user.id
    const isCreator = project?.created_by === user.id

    if (!isAssignee && !isCreator) {
      return NextResponse.json(
        { error: 'Only the assigned user or project lead can update feature status' },
        { status: 403 }
      )
    }

    // Build the update payload
    const updatePayload: Record<string, string> = {}
    if (status) updatePayload.status = status
    if (assigned_to) updatePayload.assigned_to = assigned_to

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'Nothing to update. Provide status and/or assigned_to.' },
        { status: 400 }
      )
    }

    // Update the feature
    const { data: updated, error: updateError } = await supabase
      .from('features')
      .update(updatePayload)
      .eq('id', id)
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
      .single()

    if (updateError) {
      console.error('[features/id] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If status becomes 'done', award 20 points to the assigned user
    if (status === 'done' && (feature.assigned_to || assigned_to)) {
      const adminClient = createAdminClient()
      const awardUserId = feature.assigned_to || assigned_to
      
      const { error: rpcError } = await adminClient.rpc('increment_points', {
        user_id: awardUserId,
        amount: 20,
      })
      if (rpcError) console.error('[features/id] RPC increment_points error:', rpcError)

      const { error: insertError } = await adminClient.from('point_events').insert({
        user_id: awardUserId,
        event_type: 'feature_completed',
        points: 20,
        metadata: {
          project_id: feature.project_id,
          feature_id: feature.id,
        },
      })
      if (insertError) console.error('[features/id] point_events insert error:', insertError)
    }

    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update feature'
    console.error('[features/id] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
