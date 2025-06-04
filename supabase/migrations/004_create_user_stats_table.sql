-- Create user_stats table to track learning statistics
CREATE TABLE user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_words_learned INTEGER DEFAULT 0,
    words_mastered INTEGER DEFAULT 0,
    words_in_progress INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- in minutes
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create study_sessions table to track individual study sessions
CREATE TABLE study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    words_studied INTEGER NOT NULL DEFAULT 0,
    words_correct INTEGER NOT NULL DEFAULT 0,
    words_incorrect INTEGER NOT NULL DEFAULT 0,
    study_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    accuracy DECIMAL(5,2), -- calculated accuracy percentage
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_progress table to track daily goals
CREATE TABLE daily_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_date DATE NOT NULL DEFAULT CURRENT_DATE,
    words_studied INTEGER DEFAULT 0,
    goal_achieved BOOLEAN DEFAULT false,
    study_time INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_date)
);

-- Create RLS policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily progress policies
CREATE POLICY "Users can view own daily progress" ON daily_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress" ON daily_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress" ON daily_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at
    BEFORE UPDATE ON daily_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create default stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_stats); 