import Link from 'next/link'

interface PaginationProps {
  page: number
  total: number
  limit: number
  basePath: string
}

export default function Pagination({ page, total, limit, basePath }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Link
          href={`${basePath}?page=${page - 1}`}
          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
        >
          ← Trước
        </Link>
      )}
      <span className="text-sm text-gray-500">
        Trang {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`${basePath}?page=${page + 1}`}
          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
        >
          Tiếp →
        </Link>
      )}
    </nav>
  )
}
