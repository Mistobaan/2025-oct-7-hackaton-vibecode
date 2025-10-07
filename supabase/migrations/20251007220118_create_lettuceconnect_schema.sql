/*
  # LettuceConnect Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `display_name` (text)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `social_platforms`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `platform` (text) - e.g., 'linkedin', 'instagram', 'x', 'tiktok'
      - `username` (text)
      - `profile_url` (text)
      - `is_visible` (boolean) - global visibility toggle
      - `created_at` (timestamptz)
    
    - `events`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references profiles)
      - `name` (text)
      - `party_code` (text, unique) - 6-digit code for joining
      - `description` (text, nullable)
      - `max_attendees` (integer) - based on tier: 100/200/1000/unlimited
      - `tier` (text) - 'free', 'basic', 'pro', 'enterprise'
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `ends_at` (timestamptz, nullable)
    
    - `event_attendees`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)
      - `is_online` (boolean)
      - `last_seen` (timestamptz)
    
    - `event_social_visibility`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `social_platform_id` (uuid, references social_platforms)
      - `is_visible` (boolean) - per-event visibility override
      - `created_at` (timestamptz)
    
    - `connections`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `from_user_id` (uuid, references profiles)
      - `to_user_id` (uuid, references profiles)
      - `platform` (text)
      - `connected_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for event attendees to view other attendees
    - Add policies for event creators to manage their events
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create social_platforms table
CREATE TABLE IF NOT EXISTS social_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  platform text NOT NULL,
  username text NOT NULL,
  profile_url text NOT NULL,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own socials"
  ON social_platforms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own socials"
  ON social_platforms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own socials"
  ON social_platforms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own socials"
  ON social_platforms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name text NOT NULL,
  party_code text UNIQUE NOT NULL,
  description text,
  max_attendees integer DEFAULT 100,
  tier text DEFAULT 'free',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT true,
  last_seen timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event attendees can view other attendees"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = event_attendees.event_id
      AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance status"
  ON event_attendees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
  ON event_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create event_social_visibility table
CREATE TABLE IF NOT EXISTS event_social_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  social_platform_id uuid NOT NULL REFERENCES social_platforms ON DELETE CASCADE,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id, social_platform_id)
);

ALTER TABLE event_social_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their event social visibility"
  ON event_social_visibility FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event attendees can view social visibility"
  ON event_social_visibility FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = event_social_visibility.event_id
      AND ea.user_id = auth.uid()
    )
  );

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  platform text NOT NULL,
  connected_at timestamptz DEFAULT now()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_platforms_user_id ON social_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_events_party_code ON events(party_code);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_social_visibility_event_user ON event_social_visibility(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_connections_from_user ON connections(from_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_to_user ON connections(to_user_id);