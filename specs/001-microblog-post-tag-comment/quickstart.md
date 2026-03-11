# Quickstart: Microblog CMS

**Branch**: `001-microblog-post-tag-comment`  
**Stack**: Next.js 14+ · TypeScript · Supabase

---

## Prerequisites

- Node.js 18+
- npm / pnpm
- Supabase account (free tier đủ cho dev)
- Supabase CLI (optional, cho local dev)

---

## 1. Khởi tạo dự án Next.js

```bash
npx create-next-app@latest microblog-cms \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd microblog-cms
```

---

## 2. Cài dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 3. Cấu hình Supabase

### 3.1 Tạo project trên Supabase Dashboard

1. Truy cập [supabase.com](https://supabase.com) → New project
2. Lấy `Project URL` và `anon key` từ **Settings → API**

### 3.2 Biến môi trường

Tạo file `.env.local` ở root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 3.3 Supabase clients

**`src/lib/supabase/server.ts`** — dùng trong Server Components & API Routes:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

**`src/lib/supabase/client.ts`** — dùng trong Client Components:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 4. Chạy migrations

Chạy các file SQL sau theo thứ tự trong **Supabase Dashboard → SQL Editor** (hoặc qua Supabase CLI):

```
supabase/migrations/001_create_posts.sql
supabase/migrations/002_create_tags.sql
supabase/migrations/003_create_post_tags.sql
supabase/migrations/004_create_comments.sql
supabase/migrations/005_rls_policies.sql
```

Xem chi tiết schema trong [data-model.md](./data-model.md).

---

## 5. Cấu hình middleware

**`src/middleware.ts`** — bảo vệ route `/dashboard` và `/moderation`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/moderation/:path*'],
}
```

---

## 6. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

---

## 7. Luồng test nhanh

| Bước | Action | Expected |
|------|--------|----------|
| 1 | Truy cập `/login`, đăng nhập bằng email | Redirect về `/dashboard` |
| 2 | Vào `/dashboard/posts/new`, soạn bài, lưu Draft | Bài không xuất hiện ở trang chủ |
| 3 | Publish bài | Bài xuất hiện ở trang chủ (`/`) |
| 4 | Vào bài, gửi bình luận | Thông báo "đang chờ kiểm duyệt" |
| 5 | Vào `/moderation`, approve bình luận | Bình luận hiển thị dưới bài |
| 6 | Truy cập `/tags/[slug]` | Chỉ bài Published với tag đó hiện ra |

---

## 8. Cấu trúc thư mục đầy đủ

Xem [plan.md](./plan.md#source-code-repository-root).

---

## Tài liệu liên quan

- [spec.md](./spec.md) — Yêu cầu tính năng
- [data-model.md](./data-model.md) — Schema DB & TypeScript types
- [contracts/posts.md](./contracts/posts.md) — API Posts
- [contracts/tags.md](./contracts/tags.md) — API Tags
- [contracts/comments.md](./contracts/comments.md) — API Comments & Moderation
- [research.md](./research.md) — Quyết định kỹ thuật & lý do
