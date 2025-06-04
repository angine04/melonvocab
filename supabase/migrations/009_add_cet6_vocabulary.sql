-- Add CET-6 vocabulary book and sample words

-- Insert CET-6 vocabulary book
INSERT INTO vocabulary_books (name, description, difficulty, tags) VALUES
('CET-6 Core', '大学英语六级考试核心词汇，在四级基础上扩展更多高级词汇，提升英语综合能力。', 'advanced', ARRAY['CET6', '大学英语', '考试'])
ON CONFLICT DO NOTHING;

-- Insert sample words with JSON content for CET-6 vocabulary book
INSERT INTO vocabulary_words (book_id, word, content, word_order) VALUES
((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'acknowledge', '{
  "pronunciation": {
    "us": "/əkˈnɑːlɪdʒ/",
    "uk": "/əkˈnɒlɪdʒ/"
  },
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "承认；确认",
      "examples": [
        {
          "sentence": "He acknowledged his mistake and apologized.",
          "translation": "他承认了错误并道歉。"
        },
        {
          "sentence": "The company acknowledged the complaints from customers.",
          "translation": "公司确认了客户的投诉。"
        }
      ]
    },
    {
      "partOfSpeech": "verb",
      "definition": "感谢；答谢",
      "examples": [
        {
          "sentence": "She acknowledged his help with a warm smile.",
          "translation": "她用温暖的笑容感谢他的帮助。"
        }
      ]
    }
  ]
}', 1),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'adequate', '{
  "pronunciation": {
    "us": "/ˈædɪkwət/",
    "uk": "/ˈædɪkwət/"
  },
  "meanings": [
    {
      "partOfSpeech": "adjective",
      "definition": "足够的；充分的",
      "examples": [
        {
          "sentence": "The salary is adequate for basic living expenses.",
          "translation": "这份薪水足够支付基本生活费用。"
        },
        {
          "sentence": "We need adequate preparation for the exam.",
          "translation": "我们需要为考试做充分的准备。"
        }
      ]
    },
    {
      "partOfSpeech": "adjective",
      "definition": "胜任的；合格的",
      "examples": [
        {
          "sentence": "She proved to be more than adequate for the job.",
          "translation": "她证明自己完全胜任这项工作。"
        }
      ]
    }
  ]
}', 2),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'anonymous', '{
  "pronunciation": {
    "us": "/əˈnɑːnɪməs/",
    "uk": "/əˈnɒnɪməs/"
  },
  "meanings": [
    {
      "partOfSpeech": "adjective",
      "definition": "匿名的；无名的",
      "examples": [
        {
          "sentence": "The donation was made by an anonymous benefactor.",
          "translation": "这笔捐款是由一位匿名捐助者提供的。"
        },
        {
          "sentence": "She received an anonymous letter threatening her safety.",
          "translation": "她收到了一封威胁她安全的匿名信。"
        }
      ]
    },
    {
      "partOfSpeech": "adjective",
      "definition": "缺乏特色的；平淡无奇的",
      "examples": [
        {
          "sentence": "The building has an anonymous, corporate appearance.",
          "translation": "这栋建筑有着缺乏特色的企业外观。"
        }
      ]
    }
  ]
}', 3),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'anticipate', '{
  "pronunciation": {
    "us": "/ænˈtɪsɪpeɪt/",
    "uk": "/ænˈtɪsɪpeɪt/"
  },
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "预期；期望",
      "examples": [
        {
          "sentence": "We anticipate a significant increase in sales this quarter.",
          "translation": "我们预期本季度销售额会大幅增长。"
        },
        {
          "sentence": "I anticipate that the project will be completed on time.",
          "translation": "我预期项目会按时完成。"
        }
      ]
    },
    {
      "partOfSpeech": "verb",
      "definition": "预先考虑；提前准备",
      "examples": [
        {
          "sentence": "The company anticipated the market changes and adjusted its strategy.",
          "translation": "公司预先考虑了市场变化并调整了策略。"
        }
      ]
    }
  ]
}', 4),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'arbitrary', '{
  "pronunciation": {
    "us": "/ˈɑːrbɪtreri/",
    "uk": "/ˈɑːbɪtrəri/"
  },
  "meanings": [
    {
      "partOfSpeech": "adjective",
      "definition": "任意的；随意的",
      "examples": [
        {
          "sentence": "The decision seemed arbitrary and unfair to many employees.",
          "translation": "这个决定对许多员工来说似乎是任意和不公平的。"
        },
        {
          "sentence": "The teacher set arbitrary deadlines for the assignments.",
          "translation": "老师为作业设定了任意的截止日期。"
        }
      ]
    },
    {
      "partOfSpeech": "adjective",
      "definition": "专制的；独断的",
      "examples": [
        {
          "sentence": "The king ruled with arbitrary power over his subjects.",
          "translation": "国王对臣民实行专制统治。"
        }
      ]
    }
  ]
}', 5),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'authentic', '{
  "pronunciation": {
    "us": "/ɔːˈθentɪk/",
    "uk": "/ɔːˈθentɪk/"
  },
  "meanings": [
    {
      "partOfSpeech": "adjective",
      "definition": "真正的；真实的",
      "examples": [
        {
          "sentence": "This is an authentic Van Gogh painting from 1888.",
          "translation": "这是1888年梵高的真迹。"
        },
        {
          "sentence": "We serve authentic Italian cuisine in our restaurant.",
          "translation": "我们餐厅提供正宗的意大利菜。"
        }
      ]
    },
    {
      "partOfSpeech": "adjective",
      "definition": "可信的；可靠的",
      "examples": [
        {
          "sentence": "The witness provided an authentic account of the accident.",
          "translation": "证人提供了对事故的可信描述。"
        }
      ]
    }
  ]
}', 6),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'contemplate', '{
  "pronunciation": {
    "us": "/ˈkɑːntəmpleɪt/",
    "uk": "/ˈkɒntəmpleɪt/"
  },
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "考虑；思考",
      "examples": [
        {
          "sentence": "She is contemplating a career change after graduation.",
          "translation": "她正在考虑毕业后转换职业。"
        },
        {
          "sentence": "He contemplated the offer for several days before responding.",
          "translation": "他考虑了这个提议几天才回复。"
        }
      ]
    },
    {
      "partOfSpeech": "verb",
      "definition": "凝视；注视",
      "examples": [
        {
          "sentence": "She sat by the window, contemplating the sunset.",
          "translation": "她坐在窗边，凝视着日落。"
        }
      ]
    }
  ]
}', 7),

((SELECT id FROM vocabulary_books WHERE name = 'CET-6 Core'), 'deteriorate', '{
  "pronunciation": {
    "us": "/dɪˈtɪriəreɪt/",
    "uk": "/dɪˈtɪəriəreɪt/"
  },
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "恶化；变坏",
      "examples": [
        {
          "sentence": "His health began to deteriorate after the surgery.",
          "translation": "手术后他的健康状况开始恶化。"
        },
        {
          "sentence": "The relationship between the two countries has deteriorated significantly.",
          "translation": "两国关系已经明显恶化。"
        }
      ]
    },
    {
      "partOfSpeech": "verb",
      "definition": "磨损；损坏",
      "examples": [
        {
          "sentence": "The old building continued to deteriorate due to lack of maintenance.",
          "translation": "由于缺乏维护，这栋老建筑继续损坏。"
        }
      ]
    }
  ]
}', 8);

-- Update total_words count for all vocabulary books
UPDATE vocabulary_books 
SET total_words = (
  SELECT COUNT(*) 
  FROM vocabulary_words 
  WHERE vocabulary_words.book_id = vocabulary_books.id
); 