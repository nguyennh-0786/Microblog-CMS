# Microblog CMS

Full-stack microblog built with **Next.js 14 App Router**, **TypeScript**, and **Supabase** (PostgreSQL + Auth + RLS).

## Features

- ✍️ Tác giả soạn bài ngắn (Draft / Published), gắn Tag
- 🏠 Trang chủ theo timeline, trang Tag
- 💬 Độc giả bình luận (không cần đăng nhập) → kiểm duyệt trước khi hiển thị
- 🔐 Phân quyền Author / Moderator qua Supabase Auth

## Getting Started

### 1. Cài dependencies

```bash
npm install
```

### 2. Cấu hình Supabase

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Chạy migrations

Chạy các file SQL theo thứ tự trong **Supabase Dashboard → SQL Editor**:

```
supabase/migrations/001_create_posts.sql
supabase/migrations/002_create_tags.sql
supabase/migrations/003_create_post_tags.sql
supabase/migrations/004_create_comments.sql
supabase/migrations/005_rls_policies.sql
```

### 4. Chạy development server

```bash
npm run dev
```

Mở http://localhost:3000.

## Routes

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ — timeline bài Published |
| `/posts/[id]` | Chi tiết bài + bình luận |
| `/tags/[slug]` | Bài theo tag |
| `/login` | Đăng nhập |
| `/dashboard` | Quản lý bài (Author) |
| `/dashboard/posts/new` | Soạn bài mới |
| `/dashboard/posts/[id]/edit` | Chỉnh sửa bài |
| `/moderation` | Hàng chờ kiểm duyệt (Moderator) |

## Tài liệu

Xem chi tiết trong specs/001-microblog-post-tag-comment/:
- spec.md — Yêu cầu tính năng
- plan.md — Kế hoạch kỹ thuật
- data-model.md — Schema DB
- quickstart.md — Hướng dẫn chi tiết
