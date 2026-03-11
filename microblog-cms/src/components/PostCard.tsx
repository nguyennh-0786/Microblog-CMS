import Link from 'next/link'
import { formatDate, truncate } from '@/lib/utils'
import type { Post, Tag } from '@/lib/types'
import TagBadge from './TagBadge'

interface PostCardProps {
  post: Post & { tags: Tag[]; author?: { username: string } }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-xl border px-6 py-5 hover:shadow-sm transition-shadow">
      <Link href={`/posts/${post.id}`} className="block group">
        <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
          {post.title}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {truncate(post.content, 120)}
        </p>
      </Link>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
        <div className="text-xs text-gray-400 shrink-0">
          {post.author?.username && (
            <span className="mr-2">@{post.author.username}</span>
          )}
          {post.published_at && formatDate(post.published_at)}
        </div>
      </div>
    </article>
  )
}
