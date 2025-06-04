import { supabase } from '@/lib/supabaseClient';

export interface UserStats {
  totalWordsLearned: number;
  wordsMastered: number;
  wordsInProgress: number;
  totalStudyTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  correctAnswers: number;
  totalAnswers: number;
  averageAccuracy: number;
  lastStudyDate: string | null;
}

export interface StudySession {
  id: string;
  user_id: string;
  words_studied: number;
  words_correct: number;
  words_incorrect: number;
  study_time: number;
  accuracy: number;
  session_date: string;
  created_at: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  target_date: string;
  words_studied: number;
  goal_achieved: boolean;
  study_time: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyData {
  day: string;
  words: number;
  time: number;
}

export class StatsService {
  // Get user stats from database
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Create default stats if they don't exist
          return await this.createDefaultStats(userId);
        }
        console.error('Error fetching user stats:', error);
        return null;
      }

      const averageAccuracy = data.total_answers > 0 
        ? Math.round((data.correct_answers / data.total_answers) * 100)
        : 0;

      return {
        totalWordsLearned: data.total_words_learned,
        wordsMastered: data.words_mastered,
        wordsInProgress: data.words_in_progress,
        totalStudyTime: data.total_study_time,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        totalSessions: data.total_sessions,
        correctAnswers: data.correct_answers,
        totalAnswers: data.total_answers,
        averageAccuracy,
        lastStudyDate: data.last_study_date,
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }

  // Create default stats for new user
  static async createDefaultStats(userId: string): Promise<UserStats | null> {
    try {
      const { error } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          total_words_learned: 0,
          words_mastered: 0,
          words_in_progress: 0,
          total_study_time: 0,
          current_streak: 0,
          longest_streak: 0,
          total_sessions: 0,
          correct_answers: 0,
          total_answers: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default stats:', error);
        return null;
      }

      return {
        totalWordsLearned: 0,
        wordsMastered: 0,
        wordsInProgress: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalSessions: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        averageAccuracy: 0,
        lastStudyDate: null,
      };
    } catch (error) {
      console.error('Error in createDefaultStats:', error);
      return null;
    }
  }

  // Get today's progress
  static async getTodayProgress(userId: string): Promise<{
    todayProgress: number;
    goalAchieved: boolean;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('target_date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress for today, return 0
          return { todayProgress: 0, goalAchieved: false };
        }
        console.error('Error fetching today progress:', error);
        return { todayProgress: 0, goalAchieved: false };
      }

      return {
        todayProgress: data.words_studied,
        goalAchieved: data.goal_achieved,
      };
    } catch (error) {
      console.error('Error in getTodayProgress:', error);
      return { todayProgress: 0, goalAchieved: false };
    }
  }

  // Get weekly data
  static async getWeeklyData(userId: string): Promise<WeeklyData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days

      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .gte('target_date', startDate.toISOString().split('T')[0])
        .lte('target_date', endDate.toISOString().split('T')[0])
        .order('target_date', { ascending: true });

      if (error) {
        console.error('Error fetching weekly data:', error);
        return this.getEmptyWeeklyData();
      }

      // Create a map of the data
      const dataMap = new Map();
      data.forEach(item => {
        dataMap.set(item.target_date, item);
      });

      // Generate weekly data for the last 7 days
      const weeklyData: WeeklyData[] = [];
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        const dayData = dataMap.get(dateStr);
        weeklyData.push({
          day: dayName,
          words: dayData?.words_studied || 0,
          time: dayData?.study_time || 0,
        });
      }

      return weeklyData;
    } catch (error) {
      console.error('Error in getWeeklyData:', error);
      return this.getEmptyWeeklyData();
    }
  }

  // Helper method to get empty weekly data
  private static getEmptyWeeklyData(): WeeklyData[] {
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weeklyData: WeeklyData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      weeklyData.push({
        day: dayName,
        words: 0,
        time: 0,
      });
    }
    
    return weeklyData;
  }

  // Record a study session
  static async recordStudySession(
    userId: string, 
    wordsStudied: number, 
    wordsCorrect: number, 
    studyTime: number
  ): Promise<boolean> {
    try {
      const accuracy = wordsStudied > 0 ? (wordsCorrect / wordsStudied) * 100 : 0;
      const wordsIncorrect = wordsStudied - wordsCorrect;

      // Insert study session
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          words_studied: wordsStudied,
          words_correct: wordsCorrect,
          words_incorrect: wordsIncorrect,
          study_time: studyTime,
          accuracy: accuracy.toFixed(2),
        });

      if (sessionError) {
        console.error('Error recording study session:', sessionError);
        return false;
      }

      // Update daily progress
      await this.updateDailyProgress(userId, wordsStudied, studyTime);

      // Update user stats
      await this.updateUserStats(userId, wordsStudied, wordsCorrect, studyTime);

      return true;
    } catch (error) {
      console.error('Error in recordStudySession:', error);
      return false;
    }
  }

  // Update daily progress
  private static async updateDailyProgress(
    userId: string, 
    wordsStudied: number, 
    studyTime: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Get user's daily goal from settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('daily_goal')
        .eq('user_id', userId)
        .single();

      const dailyGoal = settingsData?.daily_goal || 20; // Default to 20 if no settings found

      const { data, error: fetchError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('target_date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching daily progress:', fetchError);
        return;
      }

      if (data) {
        // Update existing record
        const newWordsStudied = data.words_studied + wordsStudied;
        const goalAchieved = newWordsStudied >= dailyGoal;

        const { error: updateError } = await supabase
          .from('daily_progress')
          .update({
            words_studied: newWordsStudied,
            study_time: data.study_time + studyTime,
            goal_achieved: goalAchieved,
          })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating daily progress:', updateError);
        }
      } else {
        // Create new record
        const goalAchieved = wordsStudied >= dailyGoal;

        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert({
            user_id: userId,
            target_date: today,
            words_studied: wordsStudied,
            study_time: studyTime,
            goal_achieved: goalAchieved,
          });

        if (insertError) {
          console.error('Error inserting daily progress:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in updateDailyProgress:', error);
    }
  }

  // Update user stats
  private static async updateUserStats(
    userId: string, 
    wordsStudied: number, 
    wordsCorrect: number, 
    studyTime: number
  ): Promise<void> {
    try {
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        return;
      }

      const newTotalAnswers = currentStats.total_answers + wordsStudied;
      const newCorrectAnswers = currentStats.correct_answers + wordsCorrect;

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastStudyDate = currentStats.last_study_date;
      
      let newCurrentStreak = currentStats.current_streak;
      let newLongestStreak = currentStats.longest_streak;

      if (lastStudyDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === yesterdayStr) {
          // Consecutive day
          newCurrentStreak += 1;
        } else if (lastStudyDate !== today) {
          // Broke streak
          newCurrentStreak = 1;
        }
        // If lastStudyDate is today, don't change streak
      } else {
        // First study session
        newCurrentStreak = 1;
      }

      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          total_words_learned: currentStats.total_words_learned + wordsStudied,
          words_mastered: currentStats.words_mastered + wordsCorrect,
          total_study_time: currentStats.total_study_time + studyTime,
          total_sessions: currentStats.total_sessions + 1,
          correct_answers: newCorrectAnswers,
          total_answers: newTotalAnswers,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_study_date: today,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    } catch (error) {
      console.error('Error in updateUserStats:', error);
    }
  }

  // Reset user statistics (for debugging/fixing inflated stats)
  static async resetUserStats(userId: string): Promise<boolean> {
    try {
      // Calculate actual values based on study sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      if (sessionsError) {
        console.error('Error fetching study sessions:', sessionsError);
        return false;
      }

      const actualStats = sessions.reduce((acc, session) => ({
        totalWordsLearned: acc.totalWordsLearned + session.words_studied,
        wordsMastered: acc.wordsMastered + session.words_correct,
        totalStudyTime: acc.totalStudyTime + session.study_time,
        totalSessions: acc.totalSessions + 1,
        correctAnswers: acc.correctAnswers + session.words_correct,
        totalAnswers: acc.totalAnswers + session.words_studied,
      }), {
        totalWordsLearned: 0,
        wordsMastered: 0,
        totalStudyTime: 0,
        totalSessions: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      });

      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          total_words_learned: actualStats.totalWordsLearned,
          words_mastered: actualStats.wordsMastered,
          total_study_time: actualStats.totalStudyTime,
          total_sessions: actualStats.totalSessions,
          correct_answers: actualStats.correctAnswers,
          total_answers: actualStats.totalAnswers,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error resetting user stats:', updateError);
        return false;
      }

      console.log('User stats reset successfully');
      return true;
    } catch (error) {
      console.error('Error in resetUserStats:', error);
      return false;
    }
  }
} 