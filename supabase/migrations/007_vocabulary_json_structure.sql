-- Use JSON structure for vocabulary data - much simpler and more flexible

-- Drop the complex relational structure
DROP TABLE IF EXISTS word_examples CASCADE;
DROP TABLE IF EXISTS word_meanings CASCADE;
DROP TABLE IF EXISTS user_word_progress CASCADE;
DROP TABLE IF EXISTS vocabulary_words CASCADE;

-- Recreate vocabulary_books table (in case it was dropped)
CREATE TABLE IF NOT EXISTS vocabulary_books (
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

-- Enable RLS on vocabulary_books if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vocabulary_books' 
        AND policyname = 'Anyone can view active vocabulary books'
    ) THEN
        ALTER TABLE vocabulary_books ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view active vocabulary books" ON vocabulary_books
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Insert CET-4 vocabulary book
INSERT INTO vocabulary_books (name, description, difficulty, tags) VALUES
('CET-4 核心词汇', '大学英语四级考试核心词汇，涵盖考试高频词汇，适合大学生备考使用。', 'intermediate', ARRAY['CET4', '大学英语', '考试'])
ON CONFLICT DO NOTHING;

-- Create simple vocabulary words table with JSON content
CREATE TABLE vocabulary_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES vocabulary_books(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    content JSONB NOT NULL, -- All data including pronunciation, meanings and examples in JSON
    word_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, word_order)
);

-- Recreate user word progress table
CREATE TABLE user_word_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
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
CREATE INDEX idx_vocabulary_words_content ON vocabulary_words USING GIN (content); -- JSONB index
CREATE INDEX idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(user_id, next_review);

-- Enable RLS on new tables
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies

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
CREATE TRIGGER update_vocabulary_words_updated_at
    BEFORE UPDATE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_word_progress_updated_at
    BEFORE UPDATE ON user_word_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update word count trigger
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

-- Create trigger
CREATE TRIGGER vocabulary_book_word_count_trigger
    AFTER INSERT OR DELETE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_vocabulary_book_word_count();

-- Insert sample words with JSON content for CET-4 vocabulary book
INSERT INTO vocabulary_words (book_id, word, content, word_order) VALUES
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'), 'abandon', '{
  "pronunciation": {
    "us": "/əˈbændən/",
    "uk": "/əˈbændən/"
  },
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "放弃；抛弃",
      "examples": [
        {
          "sentence": "They had to abandon their car in the snow.",
          "translation": "他们不得不把车丢在雪中。"
        },
        {
          "sentence": "The project was abandoned due to lack of funding.",
          "translation": "由于缺乏资金，该项目被放弃了。"
        }
      ]
    },
    {
      "partOfSpeech": "verb", 
      "definition": "遗弃；离弃",
      "examples": [
        {
          "sentence": "The child was abandoned at birth.",
          "translation": "这个孩子出生时就被遗弃了。"
        }
      ]
    },
    {
      "partOfSpeech": "noun",
      "definition": "放纵；狂热", 
      "examples": [
        {
          "sentence": "She danced with wild abandon.",
          "translation": "她纵情地跳舞。"
        }
      ]
    }
  ]
}', 1),

((SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'), 'ability', '{
  "pronunciation": {
    "us": "/əˈbɪlətɪ/",
    "uk": "/əˈbɪlɪtɪ/"
  },
  "meanings": [
    {
      "partOfSpeech": "noun",
      "definition": "能力；才能",
      "examples": [
        {
          "sentence": "She has the ability to solve complex problems.",
          "translation": "她有解决复杂问题的能力。"
        },
        {
          "sentence": "His ability to learn languages is remarkable.",
          "translation": "他学习语言的能力很出色。"
        }
      ]
    },
    {
      "partOfSpeech": "noun",
      "definition": "技能；本领",
      "examples": [
        {
          "sentence": "He has great artistic abilities.",
          "translation": "他有很强的艺术才能。"
        }
      ]
    }
  ]
}', 2),

((SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'), 'abroad', '{
  "pronunciation": {
    "us": "/əˈbrɔːd/",
    "uk": "/əˈbrɔːd/"
  },
  "meanings": [
    {
      "partOfSpeech": "adverb",
      "definition": "在国外；到国外",
      "examples": [
        {
          "sentence": "He decided to study abroad for two years.",
          "translation": "他决定出国留学两年。"
        },
        {
          "sentence": "She has been living abroad since 2010.",
          "translation": "她从2010年开始就一直住在国外。"
        }
      ]
    },
    {
      "partOfSpeech": "adverb",
      "definition": "广泛流传",
      "examples": [
        {
          "sentence": "The news spread abroad quickly.",
          "translation": "消息很快传播开来。"
        }
      ]
    }
  ]
}', 3),

((SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'), 'absence', '{
  "pronunciation": {
    "us": "/ˈæbsəns/",
    "uk": "/ˈæbsəns/"
  },
  "meanings": [
    {
      "partOfSpeech": "noun",
      "definition": "缺席；不在",
      "examples": [
        {
          "sentence": "His absence from the meeting was noticed by everyone.",
          "translation": "大家都注意到他没有参加会议。"
        }
      ]
    },
    {
      "partOfSpeech": "noun", 
      "definition": "缺乏；没有",
      "examples": [
        {
          "sentence": "The absence of evidence does not prove innocence.",
          "translation": "没有证据不能证明清白。"
        }
      ]
    }
  ]
}', 4),

((SELECT id FROM vocabulary_books WHERE name = 'CET-4 核心词汇'), 'absolute', '{
  "pronunciation": {
    "us": "/ˈæbsəluːt/",
    "uk": "/ˈæbsəluːt/"
  },
  "meanings": [
    {
      "partOfSpeech": "adjective",
      "definition": "绝对的；完全的",
      "examples": [
        {
          "sentence": "There was absolute silence in the room.",
          "translation": "房间里一片寂静。"
        },
        {
          "sentence": "I have absolute confidence in her abilities.",
          "translation": "我对她的能力绝对有信心。"
        }
      ]
    },
    {
      "partOfSpeech": "adjective",
      "definition": "专制的；专断的",
      "examples": [
        {
          "sentence": "The king had absolute power over his subjects.",
          "translation": "国王对臣民拥有绝对的权力。"
        }
      ]
    }
  ]
}', 5);

-- Create user's selected vocabulary books table
CREATE TABLE user_vocabulary_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES vocabulary_books(id) ON DELETE CASCADE,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, book_id)
);

-- Create indexes for user_vocabulary_books
CREATE INDEX idx_user_vocabulary_books_user_id ON user_vocabulary_books(user_id);
CREATE INDEX idx_user_vocabulary_books_active ON user_vocabulary_books(user_id, is_active); 