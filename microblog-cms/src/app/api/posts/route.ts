import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeTagName, slugify } from '@/lib/utils'

// GET /api/posts — list published posts (paginated)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const from = (page - 1) * limit

  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `id, title, content, published_at, created_at,
       author:profiles(username),
       tags:post_tags(tag:tags(id, name, slug))`,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const posts = (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    tags: ((p.tags as { tag: unknown }[]) ?? []).map((pt) => pt.tag),
  }))

  return NextResponse.json({
    data: posts,
    pagination: { page, limit, total: count ?? 0, has_more: from + limit < (count ?? 0) },
  })
}

// POST /api/posts — create new post (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, content, status = 'draft', tag_names = [] } = body

  if (!title || title.length < 1) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!content || content.length < 1 || content.length > 1000)
    return NextResponse.json({ error: 'Content must be 1–1000 characters' }, { status: 400 })
  if (!['draft', 'published'].includes(status))
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const postData: Record<string, unknown> = { title, content, status, author_id: user.id }
  if (status === 'published') postData.published_at = new Date().toISOString()

  const { data: post, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (tag_names.length > 0) {
    await syncTags(supabase, post.id, tag_names)
  }

  return NextResponse.json({ data: post }, { status: 201 })
}

export async function syncTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  tagNames: string[]
) {
  const normalized = tagNames
    .map((n: string) => ({ name: normalizeTagName(n), slug: slugify(n) }))
    .filter((t) => t.name.length > 0)
    .slice(0, 10)

  // Upsert tags
  const { data: tags } = await supabase
    .from('tags')
    .upsert(normalized, { onConflict: 'slug' })
    .select('id, slug')

  if (!tags) return

  // Replace post_tags
  await supabase.from('post_tags').delete().eq('post_id', postId)
  if (tags.length > 0) {
    await supabase.from('post_tags').insert(tags.map((t) => ({ post_id: postId, tag_id: t.id })))
  }
}
