import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { contributionApprovedEmail, contributionRejectedEmail } from '@/lib/emails/templates'

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

      // Assign the feature to the contributor AND set status to in_progress
      let updatedFeature = null
      if (contribution.feature_id) {
        const { data: featureData, error: featureError } = await supabase
          .from('features')
          .update({
            assigned_to: contribution.user_id,
            status: 'in_progress',
          })
          .eq('id', contribution.feature_id)
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

        if (featureError) {
          console.error('[contributions/id] Feature update error:', featureError)
        } else {
          updatedFeature = featureData
        }
      }

      // Award 10 points to the contributor
      const adminClient = createAdminClient()
      const { error: rpcError } = await adminClient.rpc('increment_points', {
        user_id: contribution.user_id,
        amount: 10,
      })
      if (rpcError) console.error('[contributions/id] RPC increment_points error:', rpcError)

      // Log point event
      const { error: insertError } = await adminClient.from('point_events').insert({
        user_id: contribution.user_id,
        event_type: 'contribution_approved',
        points: 10,
        metadata: {
          project_id: contribution.project_id,
          contribution_id: contribution.id,
        },
      })
      if (insertError) console.error('[contributions/id] point_events insert error:', insertError)

      // Notify the engineer their contribution was approved
      const [{ data: engineer }, { data: projectData }] = await Promise.all([
        adminClient.from('users').select('email, full_name').eq('id', contribution.user_id).single(),
        adminClient.from('projects').select('name').eq('id', contribution.project_id).single(),
      ])
      if (engineer?.email) {
        await sendEmail({
          to: engineer.email,
          subject: `Contribution approved: ${updatedFeature?.title ?? 'Feature'} — ${projectData?.name ?? ''}`,
          html: contributionApprovedEmail({
            engineerName: engineer.full_name ?? 'there',
            featureTitle: updatedFeature?.title ?? 'the feature',
            projectName: projectData?.name ?? 'the project',
          }),
        })
      }

      return NextResponse.json({ success: true, action, feature: updatedFeature })
    } else {
      // Reject: update status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (updateError) {
        console.error('[contributions/id] Update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Notify the engineer their request was declined
      const adminClient = createAdminClient()
      const [
        { data: engineer },
        { data: featureData },
        { data: projectData },
      ] = await Promise.all([
        adminClient.from('users').select('email, full_name').eq('id', contribution.user_id).single(),
        contribution.feature_id
          ? adminClient.from('features').select('title').eq('id', contribution.feature_id).single()
          : Promise.resolve({ data: null }),
        adminClient.from('projects').select('name').eq('id', contribution.project_id).single(),
      ])
      if (engineer?.email) {
        await sendEmail({
          to: engineer.email,
          subject: `Contribution request declined: ${featureData?.title ?? 'Feature'} — ${projectData?.name ?? ''}`,
          html: contributionRejectedEmail({
            engineerName: engineer.full_name ?? 'there',
            featureTitle: featureData?.title ?? 'the feature',
            projectName: projectData?.name ?? 'the project',
          }),
        })
      }

      return NextResponse.json({ success: true, action })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update contribution'
    console.error('[contributions/id] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
