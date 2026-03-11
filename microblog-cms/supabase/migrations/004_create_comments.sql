-- Migration 004: Create comments table

CREATE TABLE IF NOT EXISTS comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content      text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  author_name  text,
  author_email text,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id_status  ON comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_status_created  ON comments(status, created_at);
