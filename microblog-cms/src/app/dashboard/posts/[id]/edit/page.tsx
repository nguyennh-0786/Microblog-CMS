import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PostForm from '@/components/PostForm'
import type { Tag } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select(`id, title, content, status, published_at, author_id,
             tags:post_tags(tag:tags(id, name, slug))`)
    .eq('id', id)
    .single()

  if (!post || post.author_id !== user.id) notFound()

  const tags = ((post.tags as unknown as { tag: Tag }[]) ?? []).map((pt) => pt.tag)

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Chỉnh sửa bài viết</h1>
      <PostForm initialPost={{ ...post, tags }} />
    </div>
  )
}
