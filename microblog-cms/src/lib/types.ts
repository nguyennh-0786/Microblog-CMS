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

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  has_more: boolean
}
