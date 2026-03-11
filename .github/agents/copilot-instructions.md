# Microblog CMS Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-11

## Active Technologies

- **Language**: TypeScript 5.x
- **Framework**: Next.js 14+ (App Router), Supabase JS Client v2, Tailwind CSS
- **Database**: Supabase (PostgreSQL với Row Level Security; Supabase Auth cho xác thực)
- **Testing**: Jest + React Testing Library, Playwright (E2E)
- **Project Type**: Full-stack web application (single Next.js project — BE + FE trong một repo)

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Trang chủ timeline
│   ├── posts/[id]/page.tsx               # Chi tiết bài + bình luận
│   ├── tags/[slug]/page.tsx              # Trang Tag
│   ├── dashboard/                        # Protected (Author)
│   ├── moderation/page.tsx               # Protected (Moderator)
│   ├── login/page.tsx
│   └── api/                              # API Routes (mutations)
├── components/
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
└── supabase/migrations/
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Jest unit/component tests
npx playwright test  # E2E tests
```

## Code Style

- Use Server Components by default; add `"use client"` only for interactive forms
- Use `src/lib/supabase/server.ts` in Server Components & API Routes
- Use `src/lib/supabase/client.ts` in Client Components
- All types defined in `src/lib/types.ts`
- API Routes handle mutations (POST/PUT/DELETE); Server Components handle reads
- Tag names normalized: `name.toLowerCase().trim()` before saving

## Recent Changes

- **001-microblog-post-tag-comment**: Initial feature — Post (Draft/Published), Tags, Comments with moderation, Homepage timeline, Tag pages

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
