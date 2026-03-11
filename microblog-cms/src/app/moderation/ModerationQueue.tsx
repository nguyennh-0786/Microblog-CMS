'use client'

import { useState } from 'react'
import ModerationItem from '@/components/ModerationItem'

interface Comment {
  id: string
  content: string
  author_name: string | null
  author_email: string | null
  created_at: string
  post_id: string
  post_title?: string
}

interface ModerationQueueProps {
  initialComments: Comment[]
}

export default function ModerationQueue({ initialComments }: ModerationQueueProps) {
  const [comments, setComments] = useState(initialComments)

  function handleProcessed(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  if (comments.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-6 text-sm text-center">
        ✓ Hàng chờ trống — không có bình luận nào cần kiểm duyệt.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{comments.length} bình luận đang chờ</p>
      {comments.map((comment) => (
        <ModerationItem key={comment.id} comment={comment} onProcessed={handleProcessed} />
      ))}
    </div>
  )
}
