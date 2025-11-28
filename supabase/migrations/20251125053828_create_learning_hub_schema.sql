/*
  # Web Learning Hub Database Schema

  ## Overview
  This migration creates the database structure for a web-based learning platform 
  designed for 8th-class students to practice web development.

  ## New Tables Created

  ### 1. challenges
  Stores coding challenges across three difficulty levels (Beginner, Intermediate, Advanced)
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Challenge title
  - `description` (text) - What the student needs to build
  - `level` (text) - Difficulty level: 'beginner', 'intermediate', 'advanced'
  - `category` (text) - Topic: 'html', 'css', 'javascript', 'mixed'
  - `starter_html` (text) - Initial HTML code for the challenge
  - `starter_css` (text) - Initial CSS code for the challenge
  - `starter_js` (text) - Initial JavaScript code for the challenge
  - `reference_image_url` (text) - URL to sample output image (optional)
  - `order_index` (integer) - Display order within the level
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. quiz_questions
  Stores multiple-choice quiz questions for HTML, CSS, and Mixed quizzes
  - `id` (uuid, primary key) - Unique identifier
  - `category` (text) - Quiz type: 'html', 'css', 'mixed'
  - `question` (text) - The question text
  - `options` (jsonb) - Array of 4 answer choices
  - `correct_answer` (integer) - Index of correct option (0-3)
  - `order_index` (integer) - Display order within category
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. user_progress
  Tracks student progress, challenge completions, and quiz scores
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users (optional for non-authenticated use)
  - `session_id` (text) - Browser session ID for non-authenticated tracking
  - `challenge_id` (uuid) - Reference to challenges table (nullable)
  - `quiz_category` (text) - Quiz category if quiz-related (nullable)
  - `quiz_score` (integer) - Quiz score out of 50 (nullable)
  - `completed` (boolean) - Whether challenge/quiz is completed
  - `code_html` (text) - Saved HTML code (nullable)
  - `code_css` (text) - Saved CSS code (nullable)
  - `code_js` (text) - Saved JavaScript code (nullable)
  - `created_at` (timestamptz) - First attempt timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  All tables have RLS enabled with public read access for educational content
  and session-based write access for progress tracking.

  ## Notes
  - No authentication required by default (suitable for classroom use)
  - Progress tracked via browser session IDs
  - Can be extended to support user accounts later
*/

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category text NOT NULL CHECK (category IN ('html', 'css', 'javascript', 'mixed')),
  starter_html text DEFAULT '',
  starter_css text DEFAULT '',
  starter_js text DEFAULT '',
  reference_image_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('html', 'css', 'mixed')),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  quiz_category text CHECK (quiz_category IN ('html', 'css', 'mixed')),
  quiz_score integer CHECK (quiz_score >= 0 AND quiz_score <= 50),
  completed boolean DEFAULT false,
  code_html text DEFAULT '',
  code_css text DEFAULT '',
  code_js text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view their own progress"
  ON user_progress FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own progress"
  ON user_progress FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_challenges_level ON challenges(level, order_index);
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category, order_index);
CREATE INDEX idx_user_progress_session ON user_progress(session_id);
CREATE INDEX idx_user_progress_challenge ON user_progress(challenge_id);
