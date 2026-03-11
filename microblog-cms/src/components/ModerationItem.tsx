'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'

interface ModerationItemProps {
  comment: {
    id: string
    content: string
    author_name: string | null
    author_email: string | null
    created_at: string
    post_id: string
    post_title?: string
  }
  onProcessed: (id: string) => void
}

export default function ModerationItem({ comment, onProcessed }: ModerationItemProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle(status: 'approved' | 'rejected') {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/moderation/comments/${comment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Lỗi xảy ra')
      setLoading(false)
      return
    }

    onProcessed(comment.id)
  }

  return (
    <div className="bg-white rounded-xl border px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 mb-1">
            Bài: <span className="text-gray-600">{comment.post_title ?? comment.post_id}</span>
            {' · '}
            {formatDateTime(comment.created_at)}
            {comment.author_name && ` · ${comment.author_name}`}
            {comment.author_email && ` <${comment.author_email}>`}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle('approved')}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
          >
            Duyệt
          </button>
          <button
            onClick={() => handle('rejected')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg disabled:opacity-50"
          >
            Từ chối
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
