import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import type { Comment } from '@/lib/types'

export default async function CommentList({ postId }: { postId: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('id, content, author_name, created_at')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  const comments = (data ?? []) as Pick<Comment, 'id' | 'content' | 'author_name' | 'created_at'>[]

  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">Chưa có bình luận nào.</p>
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="bg-white rounded-xl border px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {comment.author_name ?? 'Ẩn danh'}
            </span>
            <span className="text-xs text-gray-400">{formatDateTime(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
        </li>
      ))}
    </ul>
  )
}
