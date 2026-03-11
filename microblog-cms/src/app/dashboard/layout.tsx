import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-bold text-lg">Microblog</Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Bài viết</Link>
          <Link href="/dashboard/posts/new" className="text-gray-600 hover:text-gray-900">Viết mới</Link>
          {profile?.role === 'moderator' && (
            <Link href="/moderation" className="text-gray-600 hover:text-gray-900">Kiểm duyệt</Link>
          )}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{profile?.username}</span>
          <form action={signOut}>
            <button type="submit" className="text-gray-500 hover:text-red-600">Đăng xuất</button>
          </form>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
