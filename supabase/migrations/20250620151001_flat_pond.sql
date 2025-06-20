/*
  # MentorMind Database Schema

  1. New Tables
    - `profiles` - User profiles with additional mentor preferences
    - `mentors` - AI mentor configurations and personalities
    - `conversations` - Chat sessions between users and mentors
    - `messages` - Individual messages in conversations
    - `learning_paths` - Structured learning journeys
    - `progress_tracking` - User progress on various topics
    - `community_posts` - User-generated community content
    - `post_reactions` - Likes, comments on community posts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Community features with appropriate access controls

  3. Features
    - Full conversation history
    - Mentor personality customization
    - Progress tracking and analytics
    - Community interaction system
*/

-- Profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  preferred_learning_style text DEFAULT 'balanced',
  interests text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentors table for AI mentor configurations
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  personality text NOT NULL,
  expertise text[] DEFAULT '{}',
  avatar_url text,
  system_prompt text NOT NULL,
  voice_id text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations table for chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  title text,
  topic text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table for individual chat messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- Learning paths table for structured learning
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  topics text[] DEFAULT '{}',
  milestones jsonb DEFAULT '[]',
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  skill_level text DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  sessions_completed integer DEFAULT 0,
  total_time_minutes integer DEFAULT 0,
  achievements text[] DEFAULT '{}',
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic)
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  post_type text DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'achievement', 'resource')),
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post reactions table (likes, comments)
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'insightful')),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mentors policies (public read access)
CREATE POLICY "Anyone can read active mentors"
  ON mentors FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Conversations policies
CREATE POLICY "Users can manage own conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can manage messages in own conversations"
  ON messages FOR ALL
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Learning paths policies
CREATE POLICY "Users can manage own learning paths"
  ON learning_paths FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Progress tracking policies
CREATE POLICY "Users can manage own progress"
  ON progress_tracking FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Users can read all published posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Users can manage own posts"
  ON community_posts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Post reactions policies
CREATE POLICY "Users can read all reactions"
  ON post_reactions FOR SELECT
  TO authenticated;

CREATE POLICY "Users can manage own reactions"
  ON post_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default mentors
INSERT INTO mentors (name, description, personality, expertise, avatar_url, system_prompt, voice_id, is_default) VALUES
(
  'Alex Chen',
  'A supportive career mentor with expertise in technology and professional development.',
  'encouraging, analytical, practical',
  ARRAY['career development', 'technology', 'leadership', 'professional skills'],
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  'You are Alex Chen, a supportive career mentor. Help users with career development, technology skills, and professional growth. Be encouraging, practical, and provide actionable advice.',
  'alex_voice_id',
  true
),
(
  'Dr. Sarah Williams',
  'An academic mentor specializing in research, writing, and educational excellence.',
  'scholarly, patient, thorough',
  ARRAY['academic writing', 'research methods', 'study skills', 'critical thinking'],
  'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=400',
  'You are Dr. Sarah Williams, an academic mentor. Help users with research, writing, study skills, and academic excellence. Be scholarly, patient, and provide detailed explanations.',
  'sarah_voice_id',
  true
),
(
  'Marcus Rodriguez',
  'A creative mentor focused on artistic expression, design, and innovative thinking.',
  'creative, inspiring, open-minded',
  ARRAY['creative writing', 'design thinking', 'art', 'innovation', 'entrepreneurship'],
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  'You are Marcus Rodriguez, a creative mentor. Help users explore their creativity, develop artistic skills, and think innovatively. Be inspiring, open-minded, and encourage experimentation.',
  'marcus_voice_id',
  true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING gin(tags);