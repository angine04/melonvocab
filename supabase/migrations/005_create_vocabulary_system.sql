-- Create vocabulary system tables

-- Vocabulary books/courses
CREATE TABLE vocabulary_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[], -- Array of tags like ['CET4', 'TOEFL', 'Business']
    total_words INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id), -- For future admin management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Words in vocabulary books
CREATE TABLE vocabulary_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES vocabulary_books(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    meaning TEXT NOT NULL,
    example_sentence TEXT,
    word_order INTEGER NOT NULL, -- Order within the book
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, word_order)
);

-- User's selected vocabulary books
CREATE TABLE user_vocabulary_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES vocabulary_books(id) ON DELETE CASCADE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, book_id)
);

-- User's progress on individual words
CREATE TABLE user_word_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5), -- 0: new, 5: mastered
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_words_book_id ON vocabulary_words(book_id);
CREATE INDEX idx_vocabulary_words_book_order ON vocabulary_words(book_id, word_order);
CREATE INDEX idx_user_vocabulary_books_user_id ON user_vocabulary_books(user_id);
CREATE INDEX idx_user_vocabulary_books_active ON user_vocabulary_books(user_id, is_active);
CREATE INDEX idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(user_id, next_review);

-- Enable RLS
ALTER TABLE vocabulary_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Vocabulary books: Everyone can read active books
CREATE POLICY "Anyone can view active vocabulary books" ON vocabulary_books
    FOR SELECT USING (is_active = true);

-- Vocabulary words: Everyone can read words from active books
CREATE POLICY "Anyone can view words from active books" ON vocabulary_words
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vocabulary_books 
            WHERE vocabulary_books.id = vocabulary_words.book_id 
            AND vocabulary_books.is_active = true
        )
    );

-- User vocabulary books: Users can manage their own selections
CREATE POLICY "Users can view own vocabulary books" ON user_vocabulary_books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary books" ON user_vocabulary_books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary books" ON user_vocabulary_books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary books" ON user_vocabulary_books
    FOR DELETE USING (auth.uid() = user_id);

-- User word progress: Users can manage their own progress
CREATE POLICY "Users can view own word progress" ON user_word_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word progress" ON user_word_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word progress" ON user_word_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_vocabulary_books_updated_at
    BEFORE UPDATE ON vocabulary_books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_word_progress_updated_at
    BEFORE UPDATE ON user_word_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update total_words count in vocabulary_books
CREATE OR REPLACE FUNCTION update_vocabulary_book_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vocabulary_books 
        SET total_words = total_words + 1 
        WHERE id = NEW.book_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vocabulary_books 
        SET total_words = total_words - 1 
        WHERE id = OLD.book_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update word count
CREATE TRIGGER vocabulary_book_word_count_trigger
    AFTER INSERT OR DELETE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_vocabulary_book_word_count();

-- Insert sample vocabulary books
INSERT INTO vocabulary_books (name, description, difficulty, tags) VALUES
('CET-4 核心词汇', '大学英语四级考试核心词汇，涵盖考试高频词汇，适合大学生备考使用。', 'intermediate', ARRAY['CET4', '大学英语', '考试']),
('CET-6 进阶词汇', '大学英语六级考试进阶词汇，在四级基础上扩展更多高级词汇。', 'advanced', ARRAY['CET6', '大学英语', '考试']),
('TOEFL 必备词汇', '托福考试必备词汇集合，涵盖学术场景和日常交流的重要词汇。', 'advanced', ARRAY['TOEFL', '留学', '学术英语']),
('商务英语词汇', '职场商务场景常用词汇，提升职业英语沟通能力。', 'intermediate', ARRAY['商务英语', '职场', '商务沟通']),
('日常生活词汇', '日常生活中最常用的基础词汇，适合英语初学者入门学习。', 'beginner', ARRAY['基础词汇', '日常生活', '入门']);

-- Insert sample words for CET-4 vocabulary book
INSERT INTO vocabulary_words (book_id, word, pronunciation, meaning, example_sentence, word_order)
SELECT 
    (SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'),
    word,
    pronunciation,
    meaning,
    example_sentence,
    ROW_NUMBER() OVER (ORDER BY word) as word_order
FROM (VALUES
    ('abandon', '/əˈbændən/', '放弃；抛弃', 'They had to abandon their car in the snow.'),
    ('ability', '/əˈbɪlətɪ/', '能力；才能', 'She has the ability to solve complex problems.'),
    ('abroad', '/əˈbrɔːd/', '在国外；到国外', 'He decided to study abroad for two years.'),
    ('absence', '/ˈæbsəns/', '缺席；不在', 'His absence from the meeting was noticed by everyone.'),
    ('absolute', '/ˈæbsəluːt/', '绝对的；完全的', 'There was absolute silence in the room.'),
    ('absorb', '/əbˈzɔːb/', '吸收；吸引', 'Plants absorb carbon dioxide from the air.'),
    ('academic', '/ˌækəˈdemɪk/', '学术的；学院的', 'She is working on her academic research project.'),
    ('accept', '/əkˈsept/', '接受；承认', 'I accept your apology and forgive you.'),
    ('access', '/ˈækses/', '进入；接近；通道', 'Students have access to the library 24 hours a day.'),
    ('accident', '/ˈæksɪdənt/', '事故；意外', 'The car accident happened at the busy intersection.')
) AS sample_words(word, pronunciation, meaning, example_sentence); 