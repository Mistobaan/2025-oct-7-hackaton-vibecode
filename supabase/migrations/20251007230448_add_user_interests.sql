/*
  # Add User Interests System

  1. New Tables
    - `user_interests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `interest` (text) - the interest/hobby name
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, interest) to prevent duplicates

  2. Security
    - Enable RLS on user_interests table
    - Users can view all interests (for filtering/matching)
    - Users can only manage their own interests
    - Policies for select, insert, and delete operations

  3. Notes
    - Interests are stored as text for flexibility
    - Users can add/remove interests freely
    - Common interests will help users connect at events
*/

-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Enable RLS
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view interests (for matching/filtering)
CREATE POLICY "Users can view all interests"
  ON user_interests FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own interests
CREATE POLICY "Users can add own interests"
  ON user_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interests
CREATE POLICY "Users can remove own interests"
  ON user_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest);