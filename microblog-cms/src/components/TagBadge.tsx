import Link from 'next/link'
import type { Tag } from '@/lib/types'

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full transition-colors"
    >
      #{tag.name}
    </Link>
  )
}
