# Data Model: Microblog Post, Tag & Comment

**Phase**: 1 — Design  
**Branch**: `001-microblog-post-tag-comment`  
**Date**: 2026-03-11

---

## Entities & Schema

### `profiles`

Mở rộng `auth.users` của Supabase. Tạo tự động qua trigger khi user đăng ký.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, FK → `auth.users.id` ON DELETE CASCADE | |
| `username` | `text` | NOT NULL, UNIQUE | Tên hiển thị |
| `role` | `text` | NOT NULL, DEFAULT `'author'` | `'author'` \| `'moderator'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

---

### `posts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `author_id` | `uuid` | NOT NULL, FK → `profiles.id` ON DELETE CASCADE | |
| `title` | `text` | NOT NULL, CHECK `length(title) >= 1` | |
| `content` | `text` | NOT NULL, CHECK `length(content) BETWEEN 1 AND 1000` | Max 1000 ký tự |
| `status` | `text` | NOT NULL, DEFAULT `'draft'` | `'draft'` \| `'published'` |
| `published_at` | `timestamptz` | NULLABLE | Set khi chuyển sang `published` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Cập nhật qua trigger |

**Indexes**:
- `idx_posts_status_published_at` ON `(status, published_at DESC)` — trang chủ timeline
- `idx_posts_author_id` ON `(author_id)` — dashboard tác giả

---

### `tags`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `name` | `text` | NOT NULL, UNIQUE | Đã lowercase + trim |
| `slug` | `text` | NOT NULL, UNIQUE | URL-friendly, e.g. `javascript` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

---

### `post_tags`

Junction table — quan hệ nhiều-nhiều giữa `posts` và `tags`.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `post_id` | `uuid` | NOT NULL, FK → `posts.id` ON DELETE CASCADE | |
| `tag_id` | `uuid` | NOT NULL, FK → `tags.id` ON DELETE CASCADE | |

**Primary Key**: `(post_id, tag_id)`

**Index**: `idx_post_tags_tag_id` ON `(tag_id)` — trang Tag

---

### `comments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `post_id` | `uuid` | NOT NULL, FK → `posts.id` ON DELETE CASCADE | |
| `content` | `text` | NOT NULL, CHECK `length(content) BETWEEN 1 AND 2000` | |
| `author_name` | `text` | NULLABLE | Tên người gửi (không bắt buộc) |
| `author_email` | `text` | NULLABLE | Email người gửi (không bắt buộc) |
| `status` | `text` | NOT NULL, DEFAULT `'pending'` | `'pending'` \| `'approved'` \| `'rejected'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes**:
- `idx_comments_post_id_status` ON `(post_id, status)` — lấy comment approved của bài
- `idx_comments_status_created_at` ON `(status, created_at)` — hàng chờ kiểm duyệt

---

## State Transitions

### Post Status

```
[Draft] ──publish──▶ [Published]
[Published] ──unpublish──▶ [Draft]
[Draft | Published] ──delete──▶ (xóa)
```

- Khi chuyển sang `published`: set `published_at = now()` nếu chưa có giá trị
- Khi chuyển về `draft`: giữ nguyên `published_at` (để biết lịch sử)

### Comment Status

```
[Pending] ──approve──▶ [Approved]  (hiển thị công khai)
[Pending] ──reject──▶  [Rejected]  (ẩn vĩnh viễn)
```

- Chỉ Moderator được thay đổi trạng thái comment
- Không có chuyển trạng thái từ `Approved` hay `Rejected` ngược về

---

## Row Level Security Policies

### `posts`

| Policy | Role | Operation | Condition |
|--------|------|-----------|-----------|
| Public read published | `anon`, `authenticated` | SELECT | `status = 'published'` |
| Author read own | `authenticated` | SELECT | `author_id = auth.uid()` |
| Author insert | `authenticated` | INSERT | `author_id = auth.uid()` |
| Author update own | `authenticated` | UPDATE | `author_id = auth.uid()` |
| Author delete own | `authenticated` | DELETE | `author_id = auth.uid()` |

### `tags` & `post_tags`

| Policy | Role | Operation | Condition |
|--------|------|-----------|-----------|
| Public read | `anon`, `authenticated` | SELECT | `true` |
| Author manage post_tags | `authenticated` | INSERT/DELETE | Post belongs to `auth.uid()` |

### `comments`

| Policy | Role | Operation | Condition |
|--------|------|-----------|-----------|
| Public read approved | `anon`, `authenticated` | SELECT | `status = 'approved'` |
| Anyone insert | `anon`, `authenticated` | INSERT | `status = 'pending'` (enforced) |
| Moderator read all | `authenticated` | SELECT | `role = 'moderator'` (via profiles join) |
| Moderator update status | `authenticated` | UPDATE | `role = 'moderator'` (via profiles join) |

---

## TypeScript Types (`src/lib/types.ts`)

```typescript
export type PostStatus = 'draft' | 'published'
export type CommentStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'author' | 'moderator'

export interface Profile {
  id: string
  username: string
  role: UserRole
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  content: string
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
  // Relations (joined)
  author?: Pick<Profile, 'username'>
  tags?: Tag[]
}

export interface Comment {
  id: string
  post_id: string
  content: string
  author_name: string | null
  author_email: string | null
  status: CommentStatus
  created_at: string
}
```
