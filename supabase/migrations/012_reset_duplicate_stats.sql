-- Reset duplicate statistics caused by bug in study session recording
-- This migration cleans up inflated statistics and resets them to correct values

-- First, let's see what we're dealing with (commented out for safety)
-- SELECT user_id, total_words_learned, total_sessions FROM user_stats;

-- Reset user stats to more reasonable values
-- We'll calculate actual values based on study sessions
UPDATE user_stats 
SET 
  total_words_learned = COALESCE(
    (SELECT SUM(words_studied) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  ),
  words_mastered = COALESCE(
    (SELECT SUM(words_correct) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  ),
  total_sessions = COALESCE(
    (SELECT COUNT(*) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  ),
  total_answers = COALESCE(
    (SELECT SUM(words_studied) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  ),
  correct_answers = COALESCE(
    (SELECT SUM(words_correct) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  ),
  total_study_time = COALESCE(
    (SELECT SUM(study_time) FROM study_sessions WHERE user_id = user_stats.user_id), 
    0
  );

-- Reset daily progress to be consistent with study sessions
-- This assumes each study session represents a day (which might not be accurate, but it's the best we can do)
UPDATE daily_progress
SET 
  words_studied = COALESCE(
    (SELECT SUM(words_studied) 
     FROM study_sessions 
     WHERE user_id = daily_progress.user_id 
     AND DATE(session_date) = daily_progress.target_date), 
    0
  ),
  study_time = COALESCE(
    (SELECT SUM(study_time) 
     FROM study_sessions 
     WHERE user_id = daily_progress.user_id 
     AND DATE(session_date) = daily_progress.target_date), 
    0
  );

-- Update goal_achieved based on corrected word counts and user settings
UPDATE daily_progress
SET goal_achieved = (
  words_studied >= COALESCE(
    (SELECT daily_goal FROM user_settings WHERE user_id = daily_progress.user_id), 
    20
  )
);

-- Log the changes (optional, for debugging)
-- SELECT 'Stats reset completed. Current user stats:' as message;
-- SELECT user_id, total_words_learned, total_sessions, total_study_time FROM user_stats; 