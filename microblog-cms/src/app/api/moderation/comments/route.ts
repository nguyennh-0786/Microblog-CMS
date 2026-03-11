import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/moderation/comments — pending queue (moderator only)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'moderator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const from = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('comments')
    .select('id, content, author_name, author_email, created_at, post_id, post:posts(title)', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const comments = (data ?? []).map((c) => ({
    ...c,
    post_title: (c.post as unknown as { title: string } | null)?.title,
    post: undefined,
  }))

  return NextResponse.json({
    data: comments,
    pagination: { page, limit, total: count ?? 0, has_more: from + limit < (count ?? 0) },
  })
}
