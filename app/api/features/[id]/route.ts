import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { featureInReviewEmail, featureCompletedEmail, featureChangesRequestedEmail } from '@/lib/emails/templates'

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
    const { status, assigned_to, review_notes, review_comments } = body
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
    const updatePayload: Record<string, string | null> = {}
    if (status) updatePayload.status = status
    if (assigned_to) updatePayload.assigned_to = assigned_to
    if (review_notes !== undefined) updatePayload.review_notes = review_notes ?? null
    if (review_comments !== undefined) updatePayload.review_comments = review_comments ?? null

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
        review_notes,
        review_comments,
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

    const adminClient = createAdminClient()

    // Notify lead engineer when a feature is submitted for review
    if (status === 'in_review' && project?.created_by && project.created_by !== user.id) {
      const [{ data: contributor }, { data: lead }, { data: projectData }] = await Promise.all([
        adminClient.from('users').select('full_name').eq('id', user.id).single(),
        adminClient.from('users').select('email, full_name').eq('id', project.created_by).single(),
        adminClient.from('projects').select('name').eq('id', feature.project_id).single(),
      ])
      if (lead?.email) {
        await sendEmail({
          to: lead.email,
          subject: `Feature ready for review: ${updated.title} — ${projectData?.name ?? ''}`,
          html: featureInReviewEmail({
            leadName: lead.full_name ?? 'there',
            contributorName: contributor?.full_name ?? 'A contributor',
            featureTitle: updated.title,
            projectName: projectData?.name ?? 'the project',
            notes: review_notes ?? null,
          }),
        })
      }
    }

    // Notify contributor when lead requests changes (in_review → in_progress with comments)
    if (
      status === 'in_progress' &&
      feature.status === 'in_review' &&
      review_comments &&
      feature.assigned_to &&
      project?.created_by &&
      feature.assigned_to !== project.created_by
    ) {
      const [{ data: contributor }, { data: projectData }] = await Promise.all([
        adminClient.from('users').select('email, full_name').eq('id', feature.assigned_to).single(),
        adminClient.from('projects').select('name').eq('id', feature.project_id).single(),
      ])
      if (contributor?.email) {
        await sendEmail({
          to: contributor.email,
          subject: `Changes requested on: ${updated.title} — ${projectData?.name ?? ''}`,
          html: featureChangesRequestedEmail({
            contributorName: contributor.full_name ?? 'there',
            featureTitle: updated.title,
            projectName: projectData?.name ?? 'the project',
            comments: review_comments,
          }),
        })
      }
    }

    // Award points and notify contributor when feature is marked done
    if (status === 'done' && (feature.assigned_to || assigned_to)) {
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

      // Email the contributor — skip if lead marked their own feature done
      if (project?.created_by && awardUserId !== project.created_by) {
        const [{ data: contributor }, { data: projectData }] = await Promise.all([
          adminClient.from('users').select('email, full_name').eq('id', awardUserId).single(),
          adminClient.from('projects').select('name').eq('id', feature.project_id).single(),
        ])
        if (contributor?.email) {
          await sendEmail({
            to: contributor.email,
            subject: `Your feature was marked done: ${updated.title} — ${projectData?.name ?? ''}`,
            html: featureCompletedEmail({
              contributorName: contributor.full_name ?? 'there',
              featureTitle: updated.title,
              projectName: projectData?.name ?? 'the project',
            }),
          })
        }
      }
    }

    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update feature'
    console.error('[features/id] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
