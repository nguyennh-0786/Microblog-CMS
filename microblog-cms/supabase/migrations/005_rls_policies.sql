-- Migration 005: Row Level Security policies

-- Enable RLS
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments  ENABLE ROW LEVEL SECURITY;

-- =====================
-- profiles
-- =====================
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- =====================
-- posts
-- =====================
CREATE POLICY "posts_public_read_published" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "posts_author_read_own" ON posts
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "posts_author_insert" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_author_update_own" ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "posts_author_delete_own" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- =====================
-- tags (public read, authenticated write)
-- =====================
CREATE POLICY "tags_public_read" ON tags
  FOR SELECT USING (true);

CREATE POLICY "tags_authenticated_insert" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- post_tags
-- =====================
CREATE POLICY "post_tags_public_read" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "post_tags_author_insert" ON post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "post_tags_author_delete" ON post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id AND posts.author_id = auth.uid()
    )
  );

-- =====================
-- comments
-- =====================
CREATE POLICY "comments_public_read_approved" ON comments
  FOR SELECT USING (status = 'approved');

CREATE POLICY "comments_anyone_insert_pending" ON comments
  FOR INSERT WITH CHECK (status = 'pending');

-- Moderators can read all comments
CREATE POLICY "comments_moderator_read_all" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'moderator'
    )
  );

-- Moderators can update status
CREATE POLICY "comments_moderator_update" ON comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'moderator'
    )
  );

-- =====================
-- Auth trigger: auto-create profile on signup
-- =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'author'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
