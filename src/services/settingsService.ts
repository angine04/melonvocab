import { supabase } from '@/lib/supabaseClient';

export interface UserSettings {
  dailyGoal: number;
  showPronunciation: boolean;
  showExamples: boolean;
}

export interface UserSettingsDB {
  id: string;
  user_id: string;
  daily_goal: number;
  show_pronunciation: boolean;
  show_examples: boolean;
  created_at: string;
  updated_at: string;
}

// Convert DB format to client format
export const dbToClientSettings = (dbSettings: UserSettingsDB): UserSettings => ({
  dailyGoal: dbSettings.daily_goal,
  showPronunciation: dbSettings.show_pronunciation,
  showExamples: dbSettings.show_examples,
});

// Convert client format to DB format
export const clientToDbSettings = (clientSettings: UserSettings): Partial<UserSettingsDB> => ({
  daily_goal: clientSettings.dailyGoal,
  show_pronunciation: clientSettings.showPronunciation,
  show_examples: clientSettings.showExamples,
});

export class SettingsService {
  // Get user settings from database
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If settings don't exist, create default settings
        if (error.code === 'PGRST116') {
          console.log('No settings found for user, creating default settings');
          return await this.createDefaultSettings(userId);
        }
        console.error('Error fetching user settings:', error);
        return null;
      }

      return dbToClientSettings(data as UserSettingsDB);
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return null;
    }
  }

  // Create default settings for a new user
  static async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    const defaultSettings: UserSettings = {
      dailyGoal: 20,
      showPronunciation: true,
      showExamples: true,
    };

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...clientToDbSettings(defaultSettings)
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return null;
      }

      return dbToClientSettings(data as UserSettingsDB);
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      return null;
    }
  }

  // Update user settings in database
  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      const dbSettings = clientToDbSettings(settings as UserSettings);
      
      const { data, error } = await supabase
        .from('user_settings')
        .update(dbSettings)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        return null;
      }

      return dbToClientSettings(data as UserSettingsDB);
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return null;
    }
  }

  // Update a single setting
  static async updateSingleSetting(
    userId: string, 
    key: keyof UserSettings, 
    value: string | number | boolean
  ): Promise<boolean> {
    try {
      const partialSettings: Partial<UserSettings> = {
        [key]: value
      };

      const result = await this.updateUserSettings(userId, partialSettings);
      return result !== null;
    } catch (error) {
      console.error('Error in updateSingleSetting:', error);
      return false;
    }
  }

  // Reset settings to default
  static async resetToDefault(userId: string): Promise<UserSettings | null> {
    const defaultSettings: UserSettings = {
      dailyGoal: 20,
      showPronunciation: true,
      showExamples: true,
    };

    return await this.updateUserSettings(userId, defaultSettings);
  }
} 