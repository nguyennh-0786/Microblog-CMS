import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import Link from 'next/link'
import type { Post, Tag } from '@/lib/types'

export const metadata = {
  title: 'Microblog — Trang chủ',
  description: 'Đọc các bài viết ngắn mới nhất',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const limit = 20
  const from = (page - 1) * limit

  const supabase = await createClient()
  const { data, count } = await supabase
    .from('posts')
    .select(
      `id, title, content, status, published_at, created_at, author_id,
       author:profiles(username),
       tags:post_tags(tag:tags(id, name, slug))`,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1)

  const posts = (data ?? []).map((p) => ({
    ...p,
    tags: ((p.tags as unknown as { tag: Tag }[]) ?? []).map((pt) => pt.tag),
  })) as unknown as (Post & { tags: Tag[] })[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">Microblog</span>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Viết bài
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Bài viết mới nhất</h1>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có bài viết nào.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination page={page} total={count ?? 0} limit={limit} basePath="/" />
      </main>
    </div>
  )
}
