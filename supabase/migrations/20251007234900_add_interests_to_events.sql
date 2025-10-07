/*
  # Add interests field to events table

  1. Changes
    - Add `interests` column to `events` table (text array) to store event-specific interests/tags
    - This allows filtering events by interests and helps users find events that match their preferences

  2. Notes
    - Uses text[] array type for flexible storage of multiple interests per event
    - Existing events will have empty array as default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'interests'
  ) THEN
    ALTER TABLE events ADD COLUMN interests text[] DEFAULT '{}';
  END IF;
END $$;

-- Create index for interest-based queries
CREATE INDEX IF NOT EXISTS idx_events_interests ON events USING GIN(interests);
