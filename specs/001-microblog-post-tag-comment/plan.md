# Implementation Plan: Microblog Post, Tag & Comment

**Branch**: `001-microblog-post-tag-comment` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-microblog-post-tag-comment/spec.md`

---

## Summary

Xây dựng hệ thống Microblog CMS full-stack cho phép tác giả viết bài ngắn (Draft/Published), gắn Tag, hiển thị trang chủ theo timeline và trang Tag. Độc giả có thể bình luận, bình luận được kiểm duyệt trước khi hiển thị công khai. Toàn bộ chạy trên một dự án Next.js (App Router) với TypeScript và Supabase làm backend-as-a-service (PostgreSQL + Auth + RLS).

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 14+ (App Router), Supabase JS Client v2, Tailwind CSS  
**Storage**: Supabase (PostgreSQL với Row Level Security; Supabase Auth cho xác thực)  
**Testing**: Jest + React Testing Library (unit/component), Playwright (E2E)  
**Target Platform**: Web — có thể deploy lên Vercel hoặc bất kỳ Node.js host nào  
**Project Type**: Full-stack web application (single Next.js project — BE + FE trong một repo)  
**Performance Goals**: Trang chủ và trang Tag tải < 2 giây với 100 bài; bình luận xuất hiện trong hàng chờ < 3 giây  
**Constraints**: Không có CDN bắt buộc; Supabase free tier đủ cho demo; RLS bảo vệ dữ liệu ở tầng DB  
**Scale/Scope**: MVP — vài tác giả, vài trăm bài, hàng nghìn lượt xem

---

## Constitution Check

*Constitution hiện tại chưa được điền (chỉ có template placeholder). Không có gates nào bị vi phạm.*

| Check | Status | Note |
|-------|--------|------|
| Single project — không tách backend/frontend riêng | ✅ Pass | Next.js monorepo gộp API Routes + UI |
| Không thêm dependency không cần thiết | ✅ Pass | Chỉ Supabase + Next.js + Tailwind |
| Tính năng phân quyền rõ ràng | ✅ Pass | Supabase Auth + RLS + middleware |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-microblog-post-tag-comment/
├── plan.md              ← file này
├── research.md          ← Phase 0
├── data-model.md        ← Phase 1
├── quickstart.md        ← Phase 1
├── contracts/           ← Phase 1
│   ├── posts.md
│   ├── tags.md
│   └── comments.md
└── tasks.md             ← Phase 2 (/speckit.tasks — chưa tạo)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                        # Root layout (font, Supabase provider)
│   ├── page.tsx                          # Trang chủ — timeline bài Published
│   ├── posts/
│   │   └── [id]/
│   │       └── page.tsx                  # Chi tiết bài + form bình luận
│   ├── tags/
│   │   └── [slug]/
│   │       └── page.tsx                  # Trang Tag — danh sách bài theo tag
│   ├── dashboard/
│   │   ├── layout.tsx                    # Protected layout (yêu cầu đăng nhập)
│   │   ├── page.tsx                      # Danh sách bài của tác giả
│   │   └── posts/
│   │       ├── new/page.tsx              # Soạn bài mới
│   │       └── [id]/edit/page.tsx        # Chỉnh sửa bài
│   ├── moderation/
│   │   └── page.tsx                      # Hàng chờ bình luận (role: moderator)
│   ├── login/
│   │   └── page.tsx                      # Đăng nhập Supabase Auth
│   └── api/
│       ├── posts/
│       │   ├── route.ts                  # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts              # GET, PUT (edit/publish), DELETE
│       │       └── comments/
│       │           └── route.ts          # GET (approved), POST (submit)
│       ├── tags/
│       │   ├── route.ts                  # GET (list all tags)
│       │   └── [slug]/
│       │       └── route.ts              # GET (posts by tag)
│       └── moderation/
│           └── comments/
│               ├── route.ts              # GET (pending queue)
│               └── [id]/
│                   └── route.ts          # PUT (approve/reject)
├── components/
│   ├── PostCard.tsx                      # Hiển thị tóm tắt bài trong list
│   ├── PostForm.tsx                      # Form soạn/chỉnh sửa bài + tag
│   ├── TagBadge.tsx                      # Chip tag có link đến trang Tag
│   ├── TagInput.tsx                      # Input thêm/xóa tag trong PostForm
│   ├── CommentForm.tsx                   # Form gửi bình luận (tên, email, nội dung)
│   ├── CommentList.tsx                   # Danh sách bình luận đã duyệt
│   ├── ModerationItem.tsx                # Item bình luận trong hàng chờ
│   └── Pagination.tsx                    # Phân trang dùng chung
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Supabase browser client (singleton)
│   │   ├── server.ts                     # Supabase server client (cookie-based)
│   │   └── middleware.ts                 # Helper kiểm tra session
│   ├── types.ts                          # Shared TypeScript types/interfaces
│   └── utils.ts                          # slugify, truncate, format date
├── middleware.ts                         # Bảo vệ route /dashboard, /moderation
└── supabase/
    └── migrations/                       # SQL migration files
        ├── 001_create_posts.sql
        ├── 002_create_tags.sql
        ├── 003_create_post_tags.sql
        ├── 004_create_comments.sql
        └── 005_rls_policies.sql
```

**Structure Decision**: Single Next.js project (App Router). Server Components đọc dữ liệu trực tiếp từ Supabase server client khi có thể. Client Components chỉ dùng cho form có trạng thái tương tác. API Routes phục vụ mutation (POST/PUT/DELETE).

---

## Complexity Tracking

> Không có vi phạm cần biện minh.
