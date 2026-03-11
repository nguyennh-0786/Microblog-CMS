import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/tags — list all tags
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tags').select('id, name, slug').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
