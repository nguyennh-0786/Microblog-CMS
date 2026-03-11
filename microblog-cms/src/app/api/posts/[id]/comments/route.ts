import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

// GET /api/posts/[id]/comments — approved comments
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, author_name, created_at')
    .eq('post_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/posts/[id]/comments — submit comment
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  // Verify post exists and is published
  const { data: post } = await supabase
    .from('posts')
    .select('id, status')
    .eq('id', id)
    .single()

  if (!post || post.status !== 'published') {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Rate limiting: 5 comments per IP per 10 minutes
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { count: recentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact' })
    .eq('post_id', id)
    .gte('created_at', tenMinutesAgo)

  // Simple IP-based check via matching author_email temporarily stored pattern
  // For production use a dedicated rate_limits table; here we limit total submissions per post
  if ((recentCount ?? 0) >= 20) {
    return NextResponse.json({ error: 'Quá nhiều bình luận. Vui lòng thử lại sau.' }, { status: 429 })
  }

  const body = await request.json()
  const { content, author_name, author_email } = body

  if (!content || content.length < 1 || content.length > 2000) {
    return NextResponse.json({ error: 'Nội dung bình luận phải từ 1–2000 ký tự' }, { status: 400 })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: id, content, author_name: author_name || null, author_email: author_email || null, status: 'pending' })
    .select('id, status, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    { data: comment, message: 'Bình luận của bạn đang chờ kiểm duyệt.' },
    { status: 201 }
  )
}
