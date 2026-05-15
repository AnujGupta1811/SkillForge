import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails/send'
import { contributionRequestEmail } from '@/lib/emails/templates'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[contributions POST] No authenticated user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log('[contributions POST] Body received:', body)
  console.log('[contributions POST] User:', user.id)

  const project_id = body.project_id
  const feature_id = body.feature_id || (body.feature_ids && body.feature_ids[0])

  if (!project_id || !feature_id) {
    return NextResponse.json({ error: 'project_id and feature_id required' }, { status: 400 })
  }

  // Check for existing pending request
  const { data: existing } = await supabase
    .from('contributions')
    .select('id')
    .eq('feature_id', feature_id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    console.log('[contributions POST] Already has pending request')
    return NextResponse.json({ error: 'Already requested' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert({
      project_id,
      feature_id,
      user_id: user.id,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('[contributions POST] Insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[contributions POST] Success:', data)

  // Notify the lead engineer about the new contribution request
  const admin = createAdminClient()
  const [
    { data: engineer },
    { data: feature },
    { data: project },
  ] = await Promise.all([
    admin.from('users').select('full_name').eq('id', user.id).single(),
    admin.from('features').select('title').eq('id', feature_id).single(),
    admin.from('projects').select('name, created_by').eq('id', project_id).single(),
  ])

  if (project?.created_by && project.created_by !== user.id) {
    const { data: lead } = await admin.from('users').select('email, full_name').eq('id', project.created_by).single()
    if (lead?.email) {
      await sendEmail({
        to: lead.email,
        subject: `New contribution request: ${feature?.title ?? 'a feature'} — ${project.name}`,
        html: contributionRequestEmail({
          leadName: lead.full_name ?? 'there',
          engineerName: engineer?.full_name ?? 'An engineer',
          featureTitle: feature?.title ?? 'Unknown Feature',
          projectName: project.name ?? 'Unknown Project',
        }),
      })
    }
  }

  return NextResponse.json({ contribution: data })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get('project_id')

  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  // Fetch ALL pending contributions for this project
  // RLS will allow this if user is the project creator OR the contributor themselves
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      status,
      created_at,
      feature_id,
      user_id,
      project_id,
      feature:features!contributions_feature_id_fkey (
        id,
        title,
        status
      ),
      user:users!contributions_user_id_fkey (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('project_id', project_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[contributions GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[contributions GET] user=${user.id} project=${project_id} found=${data?.length}`)

  const contributions = (data || []).map((c: any) => ({
    id: c.id,
    status: c.status,
    created_at: c.created_at,
    feature_id: c.feature_id,
    project_id: c.project_id,
    feature: {
      id: c.feature_id,
      title: c.feature?.title || 'Unknown Feature',
      status: c.feature?.status
    },
    user: {
      id: c.user_id,
      full_name: c.user?.full_name || c.user?.email || 'Unknown User',
      avatar_url: c.user?.avatar_url || null,
      email: c.user?.email
    }
  }))

  return NextResponse.json({ contributions })
}
