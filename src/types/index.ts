// 单词相关类型
export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  definitions: Definition[];
  examples: Example[];
  difficulty: "easy" | "medium" | "hard";
  frequency: number; // 词频
  tags: string[]; // 标签，如 CET-4, CET-6, TOEFL 等
}

export interface Definition {
  partOfSpeech: string; // 词性
  meaning: string; // 中文释义
  englishMeaning?: string; // 英文释义
}

export interface Example {
  sentence: string;
  translation: string;
}

// 学习记录相关类型
export interface StudyRecord {
  id: string;
  wordId: string;
  userId: string;
  studyType: "recognition" | "spelling" | "listening"; // 学习类型
  result: "correct" | "incorrect" | "skipped";
  timeSpent: number; // 学习时间（秒）
  createdAt: Date;
}

// 单词学习状态
export interface WordProgress {
  wordId: string;
  userId: string;
  status: "new" | "learning" | "reviewing" | "mastered";
  correctCount: number;
  incorrectCount: number;
  lastStudied: Date;
  nextReview: Date;
  reviewInterval: number; // 复习间隔（天）
  easeFactor: number; // 难度因子（用于间隔重复算法）
}

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentCourse: string; // 当前学习课程
  dailyGoal: number; // 每日学习目标
  streak: number; // 连续学习天数
  totalWordsLearned: number;
  createdAt: Date;
}

// 学习会话
export interface StudySession {
  id: string;
  userId: string;
  courseId: string;
  startTime: Date;
  endTime?: Date;
  wordsStudied: number;
  correctAnswers: number;
  totalAnswers: number;
  timeSpent: number;
}

// 课程相关类型
export interface Course {
  id: string;
  name: string;
  description: string;
  totalWords: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

// 学习统计
export interface StudyStats {
  totalWordsLearned: number;
  wordsInProgress: number;
  wordsMastered: number;
  averageAccuracy: number;
  totalStudyTime: number; // 总学习时间（分钟）
  currentStreak: number;
  longestStreak: number;
  dailyProgress: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  wordsStudied: number;
  timeSpent: number;
  accuracy: number;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 学习模式配置
export interface StudyConfig {
  mode: "recognition" | "spelling" | "mixed";
  showPronunciation: boolean;
  showExamples: boolean;
  autoPlay: boolean;
  reviewMode: boolean;
}
