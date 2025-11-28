/*
  # Add Authentication and Scoring Fields

  ## Overview
  This migration adds fields for tracking user authentication and challenge scoring data.

  ## Changes

  ### 1. user_progress table - Add new columns
  - `attempts` (integer) - Number of times a challenge was attempted
  - `score` (integer) - Score obtained on the challenge (0-100)
  - `mistakes` (integer) - Number of mistakes/syntax errors made
  
  These fields allow comprehensive tracking of student performance and learning progress.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'attempts'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN attempts integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'score'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'mistakes'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN mistakes integer DEFAULT 0;
  END IF;
END $$;
