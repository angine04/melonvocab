-- Auto-generated vocabulary SQL from JSON

-- Insert vocabulary book
INSERT INTO vocabulary_books (name, description, difficulty, tags) VALUES
('CET-4 Basic', '大学英语四级考试基础词汇，涵盖四级考试必备单词，适合英语基础学习。', 'intermediate', ARRAY['CET4', '大学英语', '考试'])
ON CONFLICT DO NOTHING;

-- Insert vocabulary words
INSERT INTO vocabulary_words (book_id, word, content, word_order) VALUES
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 Basic'), 'access', '{
  "pronunciation": {
    "us": "/''æksɛs/",
    "uk": "/''ækses/"
  },
  "meanings": [
    {
      "partOfSpeech": "v",
      "definition": "获取",
      "examples": [
        {
          "sentence": "Users can access their voice mail remotely.",
          "translation": "用户可以远程获取语音邮件。"
        },
        {
          "sentence": "Access to the papers is restricted to senior management.",
          "translation": "只有高级管理层才有权查阅这些文件。"
        }
      ]
    },
    {
      "partOfSpeech": "n",
      "definition": "接近，入口",
      "examples": []
    }
  ]
}', 1),
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 Basic'), 'project', '{
  "pronunciation": {
    "us": "/prəˈdʒɛkt/",
    "uk": "/prəˈdʒekt/"
  },
  "meanings": [
    {
      "partOfSpeech": "n",
      "definition": "工程；课题、作业",
      "examples": [
        {
          "sentence": "The project aims to provide an analysis of children''''s emotions.",
          "translation": "该计划旨在对儿童情绪作出分析。"
        },
        {
          "sentence": "a three-year research project",
          "translation": "一项为期三年的研究计划"
        }
      ]
    }
  ]
}', 2),
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 Basic'), 'intention', '{
  "pronunciation": {
    "us": "/ɪn''tɛnʃən/",
    "uk": "/ɪnˈtenʃn/"
  },
  "meanings": [
    {
      "partOfSpeech": "n",
      "definition": "打算，意图",
      "examples": [
        {
          "sentence": "They went into town with the intention of visiting the library.",
          "translation": "他们进了城，打算参观图书馆。"
        }
      ]
    }
  ]
}', 3),
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 Basic'), 'negotiate', '{
  "pronunciation": {
    "us": "/nɪ''ɡoʃɪet/",
    "uk": "/nɪ''ɡəʊʃɪeɪt/"
  },
  "meanings": [
    {
      "partOfSpeech": "v",
      "definition": "谈判，协商，交涉",
      "examples": [
        {
          "sentence": "His first aim is to get the warring parties back to the negotiating table.",
          "translation": "他的首要目标就是把交战各方拉回到谈判桌上。"
        }
      ]
    }
  ]
}', 4),
((SELECT id FROM vocabulary_books WHERE name = 'CET-4 Basic'), 'alternative', '{
  "pronunciation": {
    "us": "/ɔl''tɝnətɪv/",
    "uk": "/ɔ:lˈtɜ:nətɪv/"
  },
  "meanings": [
    {
      "partOfSpeech": "n",
      "definition": "代替品",
      "examples": [
        {
          "sentence": "New ways to treat arthritis may provide an alternative to painkillers.",
          "translation": "治疗关节炎的新方法可能会提供一种止痛药的替代品。"
        }
      ]
    }
  ]
}', 5);

-- Update total_words count
UPDATE vocabulary_books 
SET total_words = (
  SELECT COUNT(*) 
  FROM vocabulary_words 
  WHERE vocabulary_words.book_id = vocabulary_books.id
);
