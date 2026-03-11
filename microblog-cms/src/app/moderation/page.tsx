import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModerationQueue from './ModerationQueue'
import Link from 'next/link'

export const metadata = { title: 'Kiểm duyệt bình luận — Microblog' }

export default async function ModerationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'moderator') redirect('/dashboard')

  const { data } = await supabase
    .from('comments')
    .select('id, content, author_name, author_email, created_at, post_id, post:posts(title)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50)

  const comments = (data ?? []).map((c) => ({
    ...c,
    post_title: (c.post as unknown as { title: string } | null)?.title,
    post: undefined,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">Microblog</Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Kiểm duyệt bình luận</h1>
        <ModerationQueue initialComments={comments} />
      </main>
    </div>
  )
}
