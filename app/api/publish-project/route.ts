import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS — used only for server-side mutations
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(req: NextRequest) {
    try {
        const { name, pitch, tech_stack, features, problem_id } = await req.json()

        // Use the normal client to verify the user is authenticated
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Use admin client for DB mutations (bypasses RLS)
        const admin = createAdminClient()

        // Fetch user's company_domain so we can scope the project correctly
        const { data: currentUser } = await admin
            .from('users')
            .select('company_domain')
            .eq('id', user.id)
            .single()

        if (!currentUser?.company_domain) {
            return NextResponse.json(
                { error: 'User profile or company_domain not found' },
                { status: 400 }
            )
        }

        // Save project
        const { data: project, error: projectError } = await admin
            .from('projects')
            .insert({
                name,
                pitch,
                tech_stack,
                problem_id,
                created_by: user.id,
                company_domain: currentUser.company_domain,
            })
            .select()
            .single()

        if (projectError) {
            console.error('[publish-project] Insert error:', projectError)
            return NextResponse.json({ error: projectError.message }, { status: 500 })
        }

        // Save features
        const featureRows = features.map((f: any) => ({
            project_id: project.id,
            title: f.title,
            description: f.description,
            status: 'todo',
        }))

        const { error: featError } = await admin.from('features').insert(featureRows)
        if (featError) console.warn('[publish-project] Features insert warning:', featError)

        // Award points for publishing a project (best-effort)
        await admin.from('point_events').insert({
            user_id: user.id,
            event_type: 'project_published',
            points: 50,
            metadata: { project_id: project.id },
        }).then(() => { }, (e: any) => console.warn('[publish-project] Points event warning:', e))

        // Update total points on user (best-effort)
        await admin.rpc('increment_points', { user_id: user.id, amount: 50 })
            .then(() => { }, (e: any) => console.warn('[publish-project] Increment points warning:', e))

        console.log('[publish-project] Published project:', project.id)
        return NextResponse.json({ project_id: project.id })
    } catch (err: any) {
        console.error('[publish-project] Unhandled error:', err?.message || err)
        return NextResponse.json({ error: err?.message || 'Publish failed' }, { status: 500 })
    }
}