# Tasks: Microblog Post, Tag & Comment

**Input**: Design documents from `/specs/001-microblog-post-tag-comment/`  
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Organization**: Tasks nhóm theo User Story để từng story có thể implement và test độc lập.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc nhau)
- **[Story]**: User Story tương ứng (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo dự án Next.js + Supabase, cấu hình cơ sở

- [ ] T001 Bootstrap Next.js 14 App Router project với TypeScript, Tailwind, ESLint theo `quickstart.md` bước 1–2
- [ ] T002 Tạo file `.env.local` với `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] T003 [P] Tạo `src/lib/supabase/server.ts` — Supabase server client (cookie-based) theo `quickstart.md` bước 3.3
- [ ] T004 [P] Tạo `src/lib/supabase/client.ts` — Supabase browser client theo `quickstart.md` bước 3.3
- [ ] T005 [P] Tạo `src/lib/types.ts` — Tất cả TypeScript types từ `data-model.md` (Post, Tag, Comment, Profile, enums)
- [ ] T006 [P] Tạo `src/lib/utils.ts` — Helper functions: `slugify`, `truncate`, `formatDate`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB schema, Auth, Middleware — PHẢI hoàn thành trước khi bắt đầu bất kỳ User Story nào

**⚠️ CRITICAL**: Không có User Story nào có thể bắt đầu cho đến khi phase này hoàn tất

- [ ] T007 Chạy migration `supabase/migrations/001_create_posts.sql` — bảng `posts` với tất cả columns và indexes theo `data-model.md`
- [ ] T008 [P] Chạy migration `supabase/migrations/002_create_tags.sql` — bảng `tags` (id, name UNIQUE, slug UNIQUE)
- [ ] T009 [P] Chạy migration `supabase/migrations/003_create_post_tags.sql` — junction table `post_tags` với composite PK và index
- [ ] T010 Chạy migration `supabase/migrations/004_create_comments.sql` — bảng `comments` với status enum và indexes
- [ ] T011 Chạy migration `supabase/migrations/005_rls_policies.sql` — Tất cả RLS policies cho posts, tags, post_tags, comments theo `data-model.md`
- [ ] T012 Tạo Supabase Auth trigger để auto-create `profiles` row khi user đăng ký (SQL trong Supabase Dashboard)
- [ ] T013 Tạo `src/middleware.ts` — Bảo vệ routes `/dashboard/:path*` và `/moderation/:path*`, redirect về `/login` nếu chưa auth theo `quickstart.md` bước 5
- [ ] T014 Tạo `src/app/login/page.tsx` — Trang đăng nhập với Supabase Auth email/password (Client Component)

**Checkpoint**: Foundation sẵn sàng — có thể bắt đầu các User Story

---

## Phase 3: User Story 1 — Tác giả soạn & đăng bài ngắn (Priority: P1) 🎯 MVP

**Goal**: Tác giả có thể tạo bài, lưu Draft, Publish và quản lý bài của mình

**Independent Test**: Đăng nhập → `/dashboard/posts/new` → Soạn bài → Lưu Draft → Xác nhận bài không hiển thị ở `/` → Publish → Xác nhận bài xuất hiện ở `/`

### Implementation

- [ ] T015 [P] [US1] Tạo `src/app/api/posts/route.ts` — `GET` (danh sách published, phân trang) + `POST` (tạo bài mới, auth required) theo `contracts/posts.md`
- [ ] T016 [P] [US1] Tạo `src/app/api/posts/[id]/route.ts` — `GET` (chi tiết) + `PUT` (edit/publish/unpublish) + `DELETE` (xóa) theo `contracts/posts.md`
- [ ] T017 [US1] Tạo `src/components/PostForm.tsx` — Client Component: form soạn/chỉnh sửa bài (title, content, status toggle); gọi API POST/PUT
- [ ] T018 [US1] Tạo `src/app/dashboard/layout.tsx` — Protected layout: kiểm tra session, hiển thị nav dashboard
- [ ] T019 [US1] Tạo `src/app/dashboard/page.tsx` — Server Component: danh sách bài (Draft + Published) của tác giả hiện tại
- [ ] T020 [US1] Tạo `src/app/dashboard/posts/new/page.tsx` — Trang soạn bài mới, render `PostForm`
- [ ] T021 [US1] Tạo `src/app/dashboard/posts/[id]/edit/page.tsx` — Trang chỉnh sửa bài, load bài hiện tại, render `PostForm` với data

**Checkpoint**: User Story 1 hoạt động độc lập — tác giả có thể tạo, edit, publish/unpublish, xóa bài

---

## Phase 4: User Story 4 — Trang chủ timeline (Priority: P2)

**Goal**: Trang chủ hiển thị bài Published mới nhất, có phân trang

**Independent Test**: Truy cập `/` (không cần đăng nhập) → Chỉ bài Published hiển thị → Thứ tự mới nhất trước → Bài Draft không xuất hiện

### Implementation

- [ ] T022 [P] [US4] Tạo `src/components/PostCard.tsx` — Hiển thị tóm tắt bài: title, excerpt (truncated content), published_at, author username, tag badges
- [ ] T023 [P] [US4] Tạo `src/components/Pagination.tsx` — Component phân trang dùng chung (nhận page, total, limit)
- [ ] T024 [US4] Tạo `src/app/page.tsx` — Server Component: trang chủ, fetch bài Published từ Supabase, render PostCard list + Pagination
- [ ] T025 [US4] Tạo `src/app/posts/[id]/page.tsx` — Server Component: chi tiết bài (title, full content, author, tags, published_at); bài Draft chỉ hiện cho tác giả

**Checkpoint**: User Story 4 hoạt động — trang chủ public với timeline và trang chi tiết bài

---

## Phase 5: User Story 2 — Tác giả gắn Tag + User Story 5 — Trang Tag (Priority: P2/P3)

**Goal (US2)**: Tác giả gắn tag khi soạn bài; tag mới được tạo tự động  
**Goal (US5)**: Trang `/tags/[slug]` hiển thị bài Published theo tag

**Independent Test (US2)**: Soạn bài → Thêm tag "javascript" + tag mới "my-tag" → Publish → Truy cập `/tags/javascript` và `/tags/my-tag` → Bài xuất hiện  
**Independent Test (US5)**: Truy cập `/tags/[slug]` → Chỉ bài Published có tag đó hiển thị → Tag không tồn tại trả 404

### Implementation

- [ ] T026 [P] [US2] Tạo `src/app/api/tags/route.ts` — `GET` danh sách tất cả tags theo `contracts/tags.md`
- [ ] T027 [P] [US2] Tạo `src/app/api/tags/[slug]/route.ts` — `GET` bài Published theo tag slug, phân trang theo `contracts/tags.md`
- [ ] T028 [P] [US2] Tạo `src/app/api/posts/[id]/route.ts` — Cập nhật `PUT` handler: xử lý `tag_names` (normalize, upsert tags, sync `post_tags`); logic trong `src/lib/utils.ts`
- [ ] T029 [US2] Tạo `src/components/TagInput.tsx` — Client Component: input thêm/xóa tag (chip UI, autocomplete từ tags có sẵn); tích hợp vào `PostForm.tsx`
- [ ] T030 [P] [US2] Tạo `src/components/TagBadge.tsx` — Chip tag có link đến `/tags/[slug]`; cập nhật `PostCard.tsx` và trang chi tiết bài để render TagBadge
- [ ] T031 [US5] Tạo `src/app/tags/[slug]/page.tsx` — Server Component: trang Tag, fetch bài Published theo slug, render PostCard list + Pagination; 404 nếu tag không tồn tại

**Checkpoint**: US2 + US5 hoạt động — tác giả gắn tag, độc giả duyệt theo tag

---

## Phase 6: User Story 3 — Độc giả bình luận + User Story 3 cont. — Kiểm duyệt (Priority: P3)

**Goal**: Độc giả gửi bình luận → chờ duyệt → Moderator approve/reject → Bình luận hiển thị

**Independent Test**: Vào bài đã Publish → Gửi bình luận → Thấy "đang chờ kiểm duyệt" → Vào `/moderation` (với role moderator) → Approve → Reload bài → Bình luận hiển thị

### Implementation

- [ ] T032 [P] [US3] Tạo `src/app/api/posts/[id]/comments/route.ts` — `GET` (approved comments) + `POST` (submit comment, rate limiting 5/IP/10min) theo `contracts/comments.md`
- [ ] T033 [P] [US3] Tạo `src/app/api/moderation/comments/route.ts` — `GET` pending queue (moderator only) theo `contracts/comments.md`
- [ ] T034 [P] [US3] Tạo `src/app/api/moderation/comments/[id]/route.ts` — `PUT` approve/reject (moderator only) theo `contracts/comments.md`
- [ ] T035 [US3] Tạo `src/components/CommentForm.tsx` — Client Component: form gửi bình luận (content, author_name?, author_email?); hiển thị feedback "đang chờ duyệt" sau khi gửi
- [ ] T036 [US3] Tạo `src/components/CommentList.tsx` — Server Component: danh sách approved comments của một bài, thứ tự cũ nhất trước
- [ ] T037 [US3] Cập nhật `src/app/posts/[id]/page.tsx` — Thêm `CommentList` và `CommentForm` vào trang chi tiết bài
- [ ] T038 [US3] Tạo `src/components/ModerationItem.tsx` — Client Component: hiển thị một comment pending với nút Approve/Reject; gọi API PUT
- [ ] T039 [US3] Tạo `src/app/moderation/page.tsx` — Server Component + Client interaction: hàng chờ bình luận pending, render danh sách `ModerationItem`; chỉ accessible với role moderator

**Checkpoint**: US3 hoạt động — toàn bộ flow bình luận + kiểm duyệt hoàn chỉnh

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cải thiện ảnh hưởng nhiều User Stories, hoàn thiện sản phẩm

- [ ] T040 [P] Thêm error boundaries và loading states cho tất cả Server Components (Suspense + `loading.tsx`, `error.tsx`)
- [ ] T041 [P] Thêm metadata SEO (`generateMetadata`) cho `src/app/page.tsx`, `src/app/posts/[id]/page.tsx`, `src/app/tags/[slug]/page.tsx`
- [ ] T042 [P] Thêm validation đầu vào cho tất cả API Routes: giới hạn content length, sanitize input
- [ ] T043 [P] Tạo `src/app/layout.tsx` root layout: font, Tailwind base styles, Supabase session provider
- [ ] T044 Chạy bảng test luồng từ `quickstart.md` bước 7 — xác nhận toàn bộ happy paths hoạt động
- [ ] T045 [P] Responsive UI review: kiểm tra PostCard, PostForm, CommentForm trên mobile viewport
- [ ] T046 Cập nhật `README.md` tại root với hướng dẫn setup từ `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Không phụ thuộc — bắt đầu ngay
- **Phase 2 (Foundational)**: Phụ thuộc Phase 1 — **BLOCKS tất cả User Stories**
- **Phase 3 (US1)**: Phụ thuộc Phase 2 — MVP core
- **Phase 4 (US4 Timeline)**: Phụ thuộc Phase 3 (cần `PostCard` pattern)
- **Phase 5 (US2 Tag + US5 Tag Page)**: Phụ thuộc Phase 3 (Post API cần update để handle tags)
- **Phase 6 (US3 Comment + Moderation)**: Phụ thuộc Phase 4 (trang chi tiết bài cần tồn tại)
- **Phase 7 (Polish)**: Phụ thuộc tất cả phases trước

### User Story Dependencies

| Story | Depends on | Notes |
|-------|-----------|-------|
| US1 — Soạn bài (P1) | Foundation | Độc lập, MVP cốt lõi |
| US4 — Timeline (P2) | US1 | Cần Post API và PostCard |
| US2 — Tag (P2) | US1 | Cần Post API để sync tags |
| US5 — Trang Tag (P3) | US2 | Cần tag data tồn tại |
| US3 — Bình luận (P3) | US4 | Cần trang chi tiết bài |

### Parallel Opportunities

- T003, T004, T005, T006 — chạy song song (file khác nhau)
- T007–T012 — migrations có thể chạy song song trong SQL Editor
- T015, T016 — API Routes độc lập nhau
- T022, T023 — components độc lập
- T026, T027, T028, T030 — độc lập nhau
- T032, T033, T034, T035 — độc lập nhau

---

## Implementation Strategy

### MVP First (User Story 1 + 4 Only)

1. Hoàn thành Phase 1: Setup
2. Hoàn thành Phase 2: Foundational (**CRITICAL**)
3. Hoàn thành Phase 3: US1 — tác giả tạo/publish bài
4. Hoàn thành Phase 4: US4 — trang chủ timeline
5. **DỪNG và VALIDATE**: Tác giả publish bài → xuất hiện ở trang chủ
6. Deploy/demo nếu sẵn sàng

### Incremental Delivery

1. Setup + Foundational → Foundation sẵn sàng
2. US1 → Tác giả có thể viết bài (MVP!)
3. US4 → Độc giả có thể đọc (công khai)
4. US2 + US5 → Tag và trang Tag
5. US3 → Bình luận + kiểm duyệt
6. Polish → Production-ready

### Parallel Team Strategy

Sau khi hoàn thành Foundation:
- **Developer A**: Phase 3 (US1) + Phase 4 (US4)
- **Developer B**: Phase 5 (US2 + US5) — sau khi US1 API xong
- **Developer C**: Phase 6 (US3) — sau khi trang chi tiết bài xong

---

## Summary

| Phase | Tasks | User Story | Parallelizable |
|-------|-------|-----------|----------------|
| Phase 1: Setup | T001–T006 | — | T003–T006 |
| Phase 2: Foundation | T007–T014 | — | T008–T012 |
| Phase 3: US1 | T015–T021 | US1 (P1) | T015, T016 |
| Phase 4: US4 | T022–T025 | US4 (P2) | T022, T023 |
| Phase 5: US2+US5 | T026–T031 | US2 (P2), US5 (P3) | T026–T028, T030 |
| Phase 6: US3 | T032–T039 | US3 (P3) | T032–T035 |
| Phase 7: Polish | T040–T046 | — | T040–T043, T045 |
| **Total** | **46 tasks** | | |

## Notes

- `[P]` = file khác nhau, không phụ thuộc nhau trong phase
- Mỗi User Story có thể test độc lập sau khi hoàn thành phase của nó
- Migrations (T007–T012) PHẢI chạy theo thứ tự do foreign key constraints
- Commit sau mỗi task hoặc nhóm logic; dừng tại mỗi Checkpoint để validate
