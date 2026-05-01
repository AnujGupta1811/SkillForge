import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/*
TASK 1 & TASK 2 SUPABASE SETUP
===============================
Run this in Supabase SQL Editor:

-- Allow managers to read all users in their company domain
DROP POLICY IF EXISTS "managers_read_team" ON public.users;
CREATE POLICY "managers_read_team" ON public.users
  FOR SELECT TO authenticated
  USING (
    company_domain = public.get_my_company_domain()
    AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) IN ('manager', 'platform_admin')
  );

-- Find user IDs
SELECT id, email, role FROM public.users;

-- Set manager role (replace email as needed)
UPDATE public.users 
SET role = 'manager' 
WHERE email = 'anuj@infosys.com';
*/

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, company_domain')
    .eq('id', user.id)
    .single()

  if (!profile || !['manager', 'platform_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all engineers in the same company_domain
  const { data: engineers, error: engineersError } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, email, role, points')
    .eq('company_domain', profile.company_domain)

  if (engineersError || !engineers) {
    return NextResponse.json({ error: 'Failed to fetch engineers' }, { status: 500 })
  }

  const adminClient = createAdminClient()

  // Fetch stats for each engineer
  const { data: projects } = await adminClient
    .from('projects')
    .select('id, created_by, status')
    .eq('company_domain', profile.company_domain)

  const projectIds = projects?.map(p => p.id) || []
  const { data: features } = await adminClient
    .from('features')
    .select('id, assigned_to, status')
    .in('project_id', projectIds)
    
  const { data: contributions } = await adminClient
    .from('contributions')
    .select('id, user_id, status, project_id')
    .in('project_id', projectIds)

  const engineerIds = engineers.map(e => e.id)
  const { data: pointEvents } = await adminClient
    .from('point_events')
    .select('user_id, created_at')
    .in('user_id', engineerIds)

  const teamStats = engineers.map(eng => {
    const engProjects = projects?.filter(p => p.created_by === eng.id) || []
    const engContributions = contributions?.filter(c => c.user_id === eng.id && c.status === 'approved') || []
    
    // Unique project IDs the engineer is involved in
    const uniqueProjectIds = new Set([
      ...engProjects.map(p => p.id),
      ...engContributions.map(c => c.project_id)
    ])
    
    const projects_active = uniqueProjectIds.size
    
    const features_completed = features?.filter(f => f.assigned_to === eng.id && f.status === 'done').length || 0
    const contributions_approved = engContributions.length
    
    // Last active
    const engEvents = pointEvents?.filter(e => e.user_id === eng.id) || []
    const last_active = engEvents.length > 0 
      ? engEvents.reduce((latest, current) => new Date(latest.created_at) > new Date(current.created_at) ? latest : current).created_at
      : null

    const raw_activity_score = (features_completed * 3) + (contributions_approved * 2) + projects_active
    
    return {
      ...eng,
      projects_created: projects_active, // Renaming internally for the frontend component
      features_completed,
      contributions_approved,
      last_active,
      raw_activity_score
    }
  })

  const maxScore = Math.max(...teamStats.map(s => s.raw_activity_score), 1)

  const finalEngineers = teamStats.map(eng => ({
    id: eng.id,
    full_name: eng.full_name,
    avatar_url: eng.avatar_url,
    email: eng.email,
    role: eng.role,
    points: eng.points,
    projects_created: eng.projects_created,
    features_completed: eng.features_completed,
    contributions_approved: eng.contributions_approved,
    last_active: eng.last_active,
    activity_score: Math.round((eng.raw_activity_score / maxScore) * 100)
  }))

  const total_engineers = finalEngineers.length
  const total_projects = projects?.length || 0
  const total_features_completed = features?.filter(f => f.status === 'done').length || 0
  const avg_points = total_engineers > 0 
    ? Math.round(finalEngineers.reduce((acc, eng) => acc + (eng.points || 0), 0) / total_engineers)
    : 0

  return NextResponse.json({
    engineers: finalEngineers,
    stats: {
      total_engineers,
      total_projects,
      total_features_completed,
      avg_points
    }
  })
}
