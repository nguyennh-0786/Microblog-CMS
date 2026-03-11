import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncTags } from '../route'

type Params = { params: Promise<{ id: string }> }

// GET /api/posts/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`id, title, content, status, published_at, created_at, updated_at, author_id,
             author:profiles(username),
             tags:post_tags(tag:tags(id, name, slug))`)
    .eq('id', id)
    .single()

  if (error || !post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Draft only visible to its author
  if (post.status === 'draft' && post.author_id !== user?.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      ...post,
      tags: ((post.tags as { tag: unknown }[]) ?? []).map((pt) => pt.tag),
    },
  })
}

// PUT /api/posts/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase.from('posts').select('author_id, published_at').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (body.title !== undefined) updates.title = body.title
  if (body.content !== undefined) {
    if (body.content.length < 1 || body.content.length > 1000)
      return NextResponse.json({ error: 'Content must be 1–1000 characters' }, { status: 400 })
    updates.content = body.content
  }
  if (body.status !== undefined) {
    if (!['draft', 'published'].includes(body.status))
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    updates.status = body.status
    // Set published_at on first publish
    if (body.status === 'published' && !existing.published_at) {
      updates.published_at = new Date().toISOString()
    }
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.tag_names !== undefined) {
    await syncTags(supabase, id, body.tag_names)
  }

  return NextResponse.json({ data: post })
}

// DELETE /api/posts/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase.from('posts').select('author_id').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
