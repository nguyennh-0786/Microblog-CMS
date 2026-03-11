'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Post, Tag } from '@/lib/types'

interface PostFormProps {
  initialPost?: Partial<Post & { tags: Tag[] }>
}

export default function PostForm({ initialPost }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status ?? 'draft')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialPost?.tags?.map((t) => t.name) ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isEdit = !!initialPost?.id
  const remainingChars = 1000 - content.length

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  function removeTag(name: string) {
    setTags(tags.filter((t) => t !== name))
  }

  async function handleSubmit(e: React.FormEvent, submitStatus: 'draft' | 'published') {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = { title, content, status: submitStatus, tag_names: tags }
    const url = isEdit ? `/api/posts/${initialPost!.id}` : '/api/posts'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Đã có lỗi xảy ra')
      setSaving(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tiêu đề bài viết…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung
          <span className={`ml-2 text-xs ${remainingChars < 50 ? 'text-red-500' : 'text-gray-400'}`}>
            {remainingChars} ký tự còn lại
          </span>
        </label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Nội dung bài ngắn (tối đa 1000 ký tự)…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Thêm tag (Enter để xác nhận)…"
            disabled={tags.length >= 10}
          />
          <button
            type="button"
            onClick={addTag}
            disabled={tags.length >= 10}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            Thêm
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{tags.length}/10 tags</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          onClick={(e) => handleSubmit(e, 'draft')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? 'Đang lưu…' : 'Lưu nháp'}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={(e) => handleSubmit(e, 'published')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Đang lưu…' : 'Xuất bản'}
        </button>
      </div>
    </form>
  )
}
