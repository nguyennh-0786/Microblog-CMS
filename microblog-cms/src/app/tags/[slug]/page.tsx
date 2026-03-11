import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import Link from 'next/link'
import type { Post, Tag } from '@/lib/types'

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return { title: `#${slug} — Microblog`, description: `Bài viết về ${slug}` }
}

export default async function TagPage({ params, searchParams }: Params) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const limit = 20
  const from = (page - 1) * limit

  const supabase = await createClient()

  const { data: tag } = await supabase.from('tags').select('id, name, slug').eq('slug', slug).single()
  if (!tag) notFound()

  const { data: postTagRows, count } = await supabase
    .from('post_tags')
    .select(
      'post:posts!inner(id, title, content, status, published_at, author_id, author:profiles(username), tags:post_tags(tag:tags(id,name,slug)))',
      { count: 'exact' }
    )
    .eq('tag_id', tag.id)
    .eq('post.status', 'published')
    .order('post(published_at)', { ascending: false })
    .range(from, from + limit - 1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = (postTagRows ?? []).map((row) => {
    const p = row.post as unknown as Record<string, any>
    return { ...p, tags: ((p.tags as unknown as { tag: Tag }[]) ?? []).map((pt) => pt.tag) }
  }) as unknown as (Post & { tags: Tag[] })[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3">
        <Link href="/" className="font-bold text-lg">Microblog</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">#{tag.name}</h1>
        <p className="text-sm text-gray-500 mb-6">{count ?? 0} bài viết</p>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có bài viết nào với tag này.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination page={page} total={count ?? 0} limit={limit} basePath={`/tags/${slug}`} />
      </main>
    </div>
  )
}
