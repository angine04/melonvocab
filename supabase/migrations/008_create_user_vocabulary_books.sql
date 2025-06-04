-- Create user's selected vocabulary books table
CREATE TABLE IF NOT EXISTS user_vocabulary_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES vocabulary_books(id) ON DELETE CASCADE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, book_id)
);

-- Create indexes for user_vocabulary_books
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_books_user_id ON user_vocabulary_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_books_active ON user_vocabulary_books(user_id, is_active);

-- Enable RLS on user_vocabulary_books
ALTER TABLE user_vocabulary_books ENABLE ROW LEVEL SECURITY;

-- User vocabulary books: Users can manage their own selections
CREATE POLICY "Users can view own vocabulary books" ON user_vocabulary_books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary books" ON user_vocabulary_books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary books" ON user_vocabulary_books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary books" ON user_vocabulary_books
    FOR DELETE USING (auth.uid() = user_id); 