import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import TagBadge from '@/components/TagBadge'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'
import Link from 'next/link'
import type { Tag } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('title, content').eq('id', id).single()
  if (!data) return {}
  return { title: data.title, description: data.content.slice(0, 120) }
}

export default async function PostDetailPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select(`id, title, content, status, published_at, author_id,
             author:profiles(username),
             tags:post_tags(tag:tags(id, name, slug))`)
    .eq('id', id)
    .single()

  if (!post) notFound()
  if (post.status === 'draft' && post.author_id !== user?.id) notFound()

  const tags = ((post.tags as unknown as { tag: Tag }[]) ?? []).map((pt) => pt.tag)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3">
        <Link href="/" className="font-bold text-lg">Microblog</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl border px-8 py-7 mb-8">
          {post.status === 'draft' && (
            <div className="mb-4 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded px-3 py-1.5">
              Đây là bài nháp — chỉ bạn mới thấy
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-5">
            <span>@{(post.author as unknown as { username: string })?.username}</span>
            {post.published_at && <span>{formatDateTime(post.published_at)}</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-5">
              {tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
            </div>
          )}
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </article>

        {post.status === 'published' && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Bình luận</h2>
            <CommentList postId={post.id} />
            <div className="mt-6">
              <CommentForm postId={post.id} />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
