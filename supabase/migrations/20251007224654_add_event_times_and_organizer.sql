/*
  # Add Event Times and Organizer Tracking

  1. Schema Changes
    - Add `start_time` (timestamptz) to events table
    - Add `end_time` (timestamptz, nullable) to events table
    - Add `organizer_id` (uuid) to events table as alias for created_by
    
  2. Notes
    - start_time is required for all events
    - end_time is optional (events can be open-ended)
    - organizer_id helps identify who created the event for dashboard display
*/

-- Add new columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE events ADD COLUMN start_time timestamptz NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE events ADD COLUMN end_time timestamptz;
  END IF;
END $$;