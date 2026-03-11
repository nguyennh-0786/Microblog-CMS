import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// PUT /api/moderation/comments/[id] — approve or reject
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'moderator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { status } = body

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
  }

  const { data: existing } = await supabase.from('comments').select('status').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Comment has already been processed' }, { status: 400 })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: comment })
}
