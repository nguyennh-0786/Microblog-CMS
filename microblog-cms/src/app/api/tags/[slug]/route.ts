import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ slug: string }> }

// GET /api/tags/[slug] — posts by tag
export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const from = (page - 1) * limit

  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })

  const { data: postTagRows, count } = await supabase
    .from('post_tags')
    .select('post:posts(id, title, content, published_at, author_id, author:profiles(username), tags:post_tags(tag:tags(id,name,slug)))', { count: 'exact' })
    .eq('tag_id', tag.id)
    .range(from, from + limit - 1)

  const posts = (postTagRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row) => (row.post as unknown as Record<string, any>))
    .filter(Boolean)
    .map((p) => ({
      ...p,
      tags: ((p.tags as { tag: unknown }[]) ?? []).map((pt) => pt.tag),
    }))

  return NextResponse.json({
    tag,
    data: posts,
    pagination: { page, limit, total: count ?? 0, has_more: from + limit < (count ?? 0) },
  })
}
