# Research: Microblog Post, Tag & Comment

**Phase**: 0 — Outline & Research  
**Branch**: `001-microblog-post-tag-comment`  
**Date**: 2026-03-11

---

## 1. Next.js App Router — Data Fetching Strategy

**Decision**: Dùng Server Components để fetch dữ liệu công khai (trang chủ, trang Tag, chi tiết bài). Dùng Client Components (`"use client"`) chỉ cho form có tương tác (PostForm, CommentForm, TagInput).

**Rationale**: Server Components render phía server, không gửi JS xuống client, cải thiện hiệu năng và SEO. API Routes (`route.ts`) xử lý mutation (tạo/sửa/xóa bài, duyệt bình luận) để tách biệt trách nhiệm và dễ test.

**Alternatives considered**:
- `getServerSideProps` (Pages Router) — bị loại vì App Router là hướng chính thức từ Next.js 13+
- Toàn bộ client-side fetching — bị loại vì ảnh hưởng SEO và hiệu năng trang chủ

---

## 2. Supabase Auth — Roles & Permissions

**Decision**: Dùng Supabase Auth (email/password). Phân quyền Author vs Moderator qua cột `role` trong bảng `profiles` (linked 1-1 với `auth.users`). Middleware Next.js kiểm tra session và role trước khi cho vào `/dashboard` và `/moderation`.

**Rationale**: Supabase Auth tích hợp sẵn với PostgreSQL RLS, không cần JWT thủ công. Lưu role trong `profiles` đơn giản, dễ extend.

**Alternatives considered**:
- Supabase custom claims — phức tạp hơn, cần Postgres function; không cần thiết cho MVP
- NextAuth.js — thêm dependency không cần thiết khi đã dùng Supabase Auth

---

## 3. Row Level Security (RLS) Strategy

**Decision**: Bật RLS trên tất cả bảng. Policies:
- `posts`: Author chỉ đọc/sửa/xóa bài của mình; Public chỉ đọc bài `published`
- `tags`, `post_tags`: Public read; Author write khi gắn tag vào bài của mình
- `comments`: Public insert; Public chỉ đọc comment `approved`; Moderator đọc tất cả + update status

**Rationale**: RLS bảo vệ dữ liệu ở tầng DB, không phụ thuộc vào logic ứng dụng. Ngay cả khi có lỗi ở API Route, DB vẫn an toàn.

**Alternatives considered**:
- Kiểm tra quyền chỉ ở API Route — nguy hiểm nếu có query trực tiếp hoặc lỗi logic

---

## 4. Tag Normalization

**Decision**: Chuẩn hóa tag ở tầng application trước khi lưu: `tag.name = tag.toLowerCase().trim()`. Tạo `slug` từ name dùng hàm `slugify` (thay khoảng trắng bằng `-`, bỏ ký tự đặc biệt). Unique constraint trên `tags.slug`.

**Rationale**: Đơn giản, không cần extension PostgreSQL. Slug dùng cho URL thân thiện (`/tags/javascript`).

**Alternatives considered**:
- `citext` extension PostgreSQL — ít control hơn ở tầng application, khó kiểm soát slug

---

## 5. Comment Submission — Rate Limiting

**Decision**: Giới hạn tần suất comment bằng cách kiểm tra IP + thời gian ở API Route (tối đa 5 comment/IP/10 phút). Lưu tracking trong bảng `rate_limits` hoặc dùng Supabase Edge Function nếu cần scale.

**Rationale**: Ngăn spam cơ bản mà không cần thêm Redis hay service ngoài.

**Alternatives considered**:
- Vercel rate limiting middleware — chỉ hoạt động trên Vercel, không portable

---

## 6. Pagination Strategy

**Decision**: Cursor-based pagination dùng `created_at` + `id` (keyset pagination). Trang chủ và trang Tag nhận query param `?cursor=<timestamp_id>` và trả về 20 bài kế tiếp.

**Rationale**: Hiệu quả hơn offset pagination với dataset lớn; tránh vấn đề bài bị lặp khi có bài mới trong lúc phân trang.

**Alternatives considered**:
- Offset pagination (`?page=2`) — đơn giản hơn nhưng có vấn đề với real-time content; được dùng làm fallback nếu cursor phức tạp quá cho MVP

**MVP Decision**: Dùng offset pagination cho MVP (đơn giản), có thể migrate sang cursor-based sau.

---

## 7. Supabase Client — Server vs Browser

**Decision**:
- `lib/supabase/server.ts`: Dùng `createServerClient` từ `@supabase/ssr`, đọc cookie từ `next/headers` — dùng trong Server Components và API Routes
- `lib/supabase/client.ts`: Dùng `createBrowserClient` — dùng trong Client Components

**Rationale**: `@supabase/ssr` package xử lý session refresh tự động qua cookie, tương thích với Next.js App Router.

**Alternatives considered**:
- `@supabase/supabase-js` trực tiếp — thiếu session sync giữa server và client trong App Router
