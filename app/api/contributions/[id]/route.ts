import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { action } = await req.json()

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch the contribution
    const { data: contribution, error: fetchError } = await supabase
      .from('contributions')
      .select('id, project_id, user_id, feature_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    // Verify current user is the project creator (lead engineer)
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', contribution.project_id)
      .single()

    if (!project || project.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the project lead can approve/reject contributions' },
        { status: 403 }
      )
    }

    if (action === 'approve') {
      // Update contribution status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'approved' })
        .eq('id', id)

      if (updateError) {
        console.error('[contributions/id] Update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Assign the feature to the contributor
      if (contribution.feature_id) {
        await supabase
          .from('features')
          .update({ assigned_to: contribution.user_id })
          .eq('id', contribution.feature_id)
      }

      // Award 30 points to the contributor
      await supabase.rpc('increment_points', {
        user_id: contribution.user_id,
        amount: 30,
      })

      // Log point event
      await supabase.from('point_events').insert({
        user_id: contribution.user_id,
        event_type: 'contribution_approved',
        points: 30,
        metadata: {
          project_id: contribution.project_id,
          contribution_id: contribution.id,
        },
      })
    } else {
      // Reject: just update status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (updateError) {
        console.error('[contributions/id] Update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, action })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update contribution'
    console.error('[contributions/id] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
