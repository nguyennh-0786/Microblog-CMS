import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Post, Tag } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select(`id, title, status, published_at, created_at,
             tags:post_tags(tag:tags(id, name, slug))`)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const normalized = (posts ?? []).map((p) => ({
    ...p,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: ((p.tags as unknown as { tag: Tag }[]) ?? []).map((pt) => pt.tag),
  })) as (Post & { tags: Tag[] })[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Bài viết của tôi</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Viết mới
        </Link>
      </div>

      {normalized.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có bài viết nào.</p>
      ) : (
        <ul className="space-y-3">
          {normalized.map((post) => (
            <li key={post.id} className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {post.status === 'published'
                    ? `Xuất bản ${formatDate(post.published_at!)}`
                    : `Nháp — tạo ${formatDate(post.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                </span>
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Sửa
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
