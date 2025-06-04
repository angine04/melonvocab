import { Word } from "@/types";

export const sampleWords: Word[] = [
  {
    id: "1",
    word: "abandon",
    pronunciation: "/əˈbændən/",
    definitions: [
      {
        partOfSpeech: "v.",
        meaning: "放弃；抛弃",
        englishMeaning: "to give up completely",
      },
    ],
    examples: [
      {
        sentence: "They had to abandon their car in the snow.",
        translation: "他们不得不把车丢弃在雪地里。",
      },
    ],
    difficulty: "medium",
    frequency: 85,
    tags: ["CET-4"],
  },
  {
    id: "2",
    word: "ability",
    pronunciation: "/əˈbɪləti/",
    definitions: [
      {
        partOfSpeech: "n.",
        meaning: "能力；才能",
        englishMeaning: "the capacity to do something",
      },
    ],
    examples: [
      {
        sentence: "She has the ability to learn languages quickly.",
        translation: "她有快速学习语言的能力。",
      },
    ],
    difficulty: "easy",
    frequency: 95,
    tags: ["CET-4"],
  },
  {
    id: "3",
    word: "absolute",
    pronunciation: "/ˈæbsəluːt/",
    definitions: [
      {
        partOfSpeech: "adj.",
        meaning: "绝对的；完全的",
        englishMeaning: "complete and total",
      },
    ],
    examples: [
      {
        sentence: "I have absolute confidence in your ability.",
        translation: "我对你的能力有绝对的信心。",
      },
    ],
    difficulty: "medium",
    frequency: 78,
    tags: ["CET-4"],
  },
  {
    id: "4",
    word: "academic",
    pronunciation: "/ˌækəˈdemɪk/",
    definitions: [
      {
        partOfSpeech: "adj.",
        meaning: "学术的；学院的",
        englishMeaning: "relating to education and scholarship",
      },
    ],
    examples: [
      {
        sentence: "He achieved academic excellence in university.",
        translation: "他在大学里取得了优异的学术成绩。",
      },
    ],
    difficulty: "medium",
    frequency: 82,
    tags: ["CET-4"],
  },
  {
    id: "5",
    word: "accept",
    pronunciation: "/əkˈsept/",
    definitions: [
      {
        partOfSpeech: "v.",
        meaning: "接受；承认",
        englishMeaning: "to receive willingly",
      },
    ],
    examples: [
      {
        sentence: "I accept your apology.",
        translation: "我接受你的道歉。",
      },
    ],
    difficulty: "easy",
    frequency: 92,
    tags: ["CET-4"],
  },
  {
    id: "6",
    word: "access",
    pronunciation: "/ˈækses/",
    definitions: [
      {
        partOfSpeech: "n.",
        meaning: "通道；接近",
        englishMeaning: "a way of approaching or entering",
      },
      {
        partOfSpeech: "v.",
        meaning: "访问；获取",
        englishMeaning: "to obtain or retrieve",
      },
    ],
    examples: [
      {
        sentence: "Students have access to the library 24 hours a day.",
        translation: "学生们可以24小时使用图书馆。",
      },
    ],
    difficulty: "medium",
    frequency: 88,
    tags: ["CET-4"],
  },
  {
    id: "7",
    word: "accident",
    pronunciation: "/ˈæksɪdənt/",
    definitions: [
      {
        partOfSpeech: "n.",
        meaning: "事故；意外",
        englishMeaning: "an unfortunate incident that happens unexpectedly",
      },
    ],
    examples: [
      {
        sentence: "The car accident happened at the intersection.",
        translation: "车祸发生在十字路口。",
      },
    ],
    difficulty: "easy",
    frequency: 90,
    tags: ["CET-4"],
  },
  {
    id: "8",
    word: "accompany",
    pronunciation: "/əˈkʌmpəni/",
    definitions: [
      {
        partOfSpeech: "v.",
        meaning: "陪伴；伴随",
        englishMeaning: "to go somewhere with someone",
      },
    ],
    examples: [
      {
        sentence: "I will accompany you to the hospital.",
        translation: "我会陪你去医院。",
      },
    ],
    difficulty: "medium",
    frequency: 75,
    tags: ["CET-4"],
  },
  {
    id: "9",
    word: "accomplish",
    pronunciation: "/əˈkʌmplɪʃ/",
    definitions: [
      {
        partOfSpeech: "v.",
        meaning: "完成；实现",
        englishMeaning: "to finish something successfully",
      },
    ],
    examples: [
      {
        sentence: "She accomplished her goal of learning Chinese.",
        translation: "她实现了学习中文的目标。",
      },
    ],
    difficulty: "medium",
    frequency: 73,
    tags: ["CET-4"],
  },
  {
    id: "10",
    word: "account",
    pronunciation: "/əˈkaʊnt/",
    definitions: [
      {
        partOfSpeech: "n.",
        meaning: "账户；描述",
        englishMeaning: "a record of money or a description",
      },
      {
        partOfSpeech: "v.",
        meaning: "解释；占",
        englishMeaning: "to explain or constitute",
      },
    ],
    examples: [
      {
        sentence: "Please give me an account of what happened.",
        translation: "请告诉我发生了什么事。",
      },
    ],
    difficulty: "medium",
    frequency: 87,
    tags: ["CET-4"],
  },
];

// 模拟用户数据
export const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  currentCourse: "CET-4",
  dailyGoal: 20,
  streak: 5,
  totalWordsLearned: 156,
  createdAt: new Date("2024-01-01"),
};

// 模拟课程数据
export const mockCourses = [
  {
    id: "cet4",
    name: "CET-4",
    description: "大学英语四级词汇",
    totalWords: 4500,
    difficulty: "intermediate" as const,
    tags: ["考试", "大学"],
  },
  {
    id: "cet6",
    name: "CET-6",
    description: "大学英语六级词汇",
    totalWords: 6000,
    difficulty: "advanced" as const,
    tags: ["考试", "大学"],
  },
  {
    id: "toefl",
    name: "TOEFL",
    description: "托福考试词汇",
    totalWords: 8000,
    difficulty: "advanced" as const,
    tags: ["考试", "留学"],
  },
];
