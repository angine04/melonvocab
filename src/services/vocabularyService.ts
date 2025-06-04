import { supabase } from '@/lib/supabaseClient';

export interface VocabularyBook {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  totalWords: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordExample {
  sentence: string;
  translation: string;
}

export interface WordMeaning {
  partOfSpeech: string;
  definition: string;
  examples: WordExample[];
}

export interface WordPronunciation {
  us?: string;
  uk?: string;
}

export interface VocabularyWord {
  id: string;
  bookId: string;
  word: string;
  pronunciation?: WordPronunciation;
  meanings: WordMeaning[];
  wordOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserVocabularyBook {
  id: string;
  userId: string;
  bookId: string;
  selectedAt: string;
  isActive: boolean;
  book?: VocabularyBook;
}

export interface UserWordProgress {
  id: string;
  userId: string;
  wordId: string;
  masteryLevel: number; // 0-5
  lastReviewed?: string;
  reviewCount: number;
  correctCount: number;
  nextReview?: string;
  createdAt: string;
  updatedAt: string;
  word?: VocabularyWord;
}

export class VocabularyService {
  // Get all available vocabulary books
  static async getAllBooks(): Promise<VocabularyBook[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary_books')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching vocabulary books:', error);
        return [];
      }

      return data.map(this.dbToClientBook);
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      return [];
    }
  }

  // Get user's selected vocabulary books
  static async getUserBooks(userId: string): Promise<UserVocabularyBook[]> {
    try {
      const { data, error } = await supabase
        .from('user_vocabulary_books')
        .select(`
          *,
          vocabulary_books (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('selected_at', { ascending: false });

      if (error) {
        console.error('Error fetching user vocabulary books:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        bookId: item.book_id,
        selectedAt: item.selected_at,
        isActive: item.is_active,
        book: item.vocabulary_books ? this.dbToClientBook(item.vocabulary_books) : undefined,
      }));
    } catch (error) {
      console.error('Error in getUserBooks:', error);
      return [];
    }
  }

  // Add a vocabulary book to user's collection
  static async addBookToUser(userId: string, bookId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_vocabulary_books')
        .upsert({
          user_id: userId,
          book_id: bookId,
          is_active: true,
        }, {
          onConflict: 'user_id,book_id',
        });

      if (error) {
        console.error('Error adding book to user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addBookToUser:', error);
      return false;
    }
  }

  // Remove a vocabulary book from user's collection
  static async removeBookFromUser(userId: string, bookId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_vocabulary_books')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Error removing book from user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeBookFromUser:', error);
      return false;
    }
  }

  // Get words from a vocabulary book
  static async getWordsFromBook(bookId: string, limit?: number, offset?: number): Promise<VocabularyWord[]> {
    try {
      let query = supabase
        .from('vocabulary_words')
        .select('*')
        .eq('book_id', bookId)
        .order('word_order', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching words from book:', error);
        return [];
      }

      return data.map(this.dbToClientWord);
    } catch (error) {
      console.error('Error in getWordsFromBook:', error);
      return [];
    }
  }

  // Get user's progress on words
  static async getUserWordProgress(userId: string, bookId?: string): Promise<UserWordProgress[]> {
    try {
      let query = supabase
        .from('user_word_progress')
        .select(`
          *,
          vocabulary_words (*)
        `)
        .eq('user_id', userId);

      if (bookId) {
        query = query.eq('vocabulary_words.book_id', bookId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user word progress:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        wordId: item.word_id,
        masteryLevel: item.mastery_level,
        lastReviewed: item.last_reviewed,
        reviewCount: item.review_count,
        correctCount: item.correct_count,
        nextReview: item.next_review,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        word: item.vocabulary_words ? this.dbToClientWord(item.vocabulary_words) : undefined,
      }));
    } catch (error) {
      console.error('Error in getUserWordProgress:', error);
      return [];
    }
  }

  // Update user's progress on a word
  static async updateWordProgress(
    userId: string,
    wordId: string,
    masteryLevel: number,
    isCorrect: boolean
  ): Promise<boolean> {
    try {
      console.log(`Updating word progress: wordId=${wordId}, masteryLevel=${masteryLevel}, isCorrect=${isCorrect}`);
      
      // First try to get existing progress
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .single();

      const now = new Date().toISOString();
      const nextReview = this.calculateNextReview(masteryLevel);
      
      console.log(`Next review scheduled for: ${nextReview}`);
      
      if (existing) {
        // Update existing progress
        const newCorrectCount = isCorrect ? existing.correct_count + 1 : existing.correct_count;
        const newReviewCount = existing.review_count + 1;

        const { error } = await supabase
          .from('user_word_progress')
          .update({
            mastery_level: masteryLevel,
            last_reviewed: now,
            review_count: newReviewCount,
            correct_count: newCorrectCount,
            next_review: nextReview,
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating word progress:', error);
          return false;
        }
        
        console.log('Word progress updated successfully');
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_word_progress')
          .insert({
            user_id: userId,
            word_id: wordId,
            mastery_level: masteryLevel,
            last_reviewed: now,
            review_count: 1,
            correct_count: isCorrect ? 1 : 0,
            next_review: nextReview,
          });

        if (error) {
          console.error('Error creating word progress:', error);
          return false;
        }
        
        console.log('New word progress created successfully');
      }

      return true;
    } catch (error) {
      console.error('Error in updateWordProgress:', error);
      return false;
    }
  }

  // Get words that need review (spaced repetition)
  static async getWordsForReview(userId: string, limit = 20): Promise<VocabularyWord[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('user_word_progress')
        .select(`
          *,
          vocabulary_words (*)
        `)
        .eq('user_id', userId)
        .lte('next_review', now)
        .order('next_review', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching words for review:', error);
        return [];
      }

      return data
        .filter(item => item.vocabulary_words)
        .map(item => this.dbToClientWord(item.vocabulary_words));
    } catch (error) {
      console.error('Error in getWordsForReview:', error);
      return [];
    }
  }

  // Get new words for study from user's current vocabulary book
  static async getNewWordsForStudy(userId: string, limit = 20): Promise<VocabularyWord[]> {
    try {
      // First get user's current book
      const currentBook = await this.getCurrentBook(userId);
      if (!currentBook) {
        console.log('No current book selected for user');
        return [];
      }

      console.log('Current book for study:', currentBook.name, currentBook.id);

      // First, try to get all words from the current book
      const { data: allWords, error: allWordsError } = await supabase
        .from('vocabulary_words')
        .select('*')
        .eq('book_id', currentBook.id)
        .order('word_order', { ascending: true })
        .limit(limit);

      if (allWordsError) {
        console.error('Error fetching words from book:', allWordsError);
        return [];
      }

      console.log(`Found ${allWords.length} total words in book`);

      // If no words in book, return empty
      if (allWords.length === 0) {
        console.log('No words found in current book');
        return [];
      }

      // Get user's studied word IDs
      const { data: studiedProgress, error: progressError } = await supabase
        .from('user_word_progress')
        .select('word_id')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
        // If we can't get progress, just return the first few words
        return allWords.slice(0, limit).map(this.dbToClientWord);
      }

      const studiedWordIds = new Set(studiedProgress.map(p => p.word_id));
      console.log(`User has studied ${studiedWordIds.size} words`);

      // Filter out studied words
      const newWords = allWords.filter(word => !studiedWordIds.has(word.id));
      console.log(`Found ${newWords.length} new words to study`);

      return newWords.map(this.dbToClientWord);
    } catch (error) {
      console.error('Error in getNewWordsForStudy:', error);
      return [];
    }
  }

  // Get review words from user's current vocabulary book
  static async getReviewWordsFromCurrentBook(userId: string, limit = 20): Promise<VocabularyWord[]> {
    try {
      // First get user's current book
      const currentBook = await this.getCurrentBook(userId);
      if (!currentBook) {
        console.log('No current book selected for user');
        return [];
      }

      console.log('Current book for review:', currentBook.name, currentBook.id);

      const now = new Date().toISOString();
      console.log('Current time for review check:', now);
      
      const { data, error } = await supabase
        .from('user_word_progress')
        .select(`
          *,
          vocabulary_words!inner (*)
        `)
        .eq('user_id', userId)
        .eq('vocabulary_words.book_id', currentBook.id)
        .lte('next_review', now)
        .order('next_review', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching review words from current book:', error);
        return [];
      }

      console.log(`Found ${data.length} words ready for review`);
      
      // Also log all progress for this user in current book for debugging
      const { data: allProgress } = await supabase
        .from('user_word_progress')
        .select(`
          *,
          vocabulary_words!inner (*)
        `)
        .eq('user_id', userId)
        .eq('vocabulary_words.book_id', currentBook.id);
      
      console.log(`Total progress records in current book: ${allProgress?.length || 0}`);
      if (allProgress && allProgress.length > 0) {
        allProgress.forEach(p => {
          console.log(`Word progress: next_review=${p.next_review}, now=${now}, ready=${p.next_review <= now}`);
        });
      }

      return data
        .filter(item => item.vocabulary_words)
        .map(item => this.dbToClientWord(item.vocabulary_words));
    } catch (error) {
      console.error('Error in getReviewWordsFromCurrentBook:', error);
      return [];
    }
  }

  // Calculate next review date based on mastery level (spaced repetition)
  private static calculateNextReview(masteryLevel: number): string {
    const now = new Date();
    const days = [0, 1, 3, 7, 14, 30][masteryLevel] || 30; // 0: immediate, 1: 1 day, etc.
    now.setDate(now.getDate() + days);
    return now.toISOString();
  }

  // Convert database format to client format
  private static dbToClientBook(dbBook: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    tags: string[];
    total_words: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }): VocabularyBook {
    return {
      id: dbBook.id,
      name: dbBook.name,
      description: dbBook.description,
      difficulty: dbBook.difficulty as 'beginner' | 'intermediate' | 'advanced',
      tags: dbBook.tags || [],
      totalWords: dbBook.total_words,
      isActive: dbBook.is_active,
      createdAt: dbBook.created_at,
      updatedAt: dbBook.updated_at,
    };
  }

  private static dbToClientWord(dbWord: {
    id: string;
    book_id: string;
    word: string;
    content: {
      pronunciation?: {
        us?: string;
        uk?: string;
      };
      meanings: Array<{
        partOfSpeech: string;
        definition: string;
        examples: Array<{
          sentence: string;
          translation: string;
        }>;
      }>;
    };
    word_order: number;
    created_at: string;
    updated_at: string;
  }): VocabularyWord {
    return {
      id: dbWord.id,
      bookId: dbWord.book_id,
      word: dbWord.word,
      pronunciation: dbWord.content.pronunciation,
      meanings: dbWord.content.meanings || [],
      wordOrder: dbWord.word_order,
      createdAt: dbWord.created_at,
      updatedAt: dbWord.updated_at,
    };
  }

  // Get user's currently selected vocabulary book
  static async getCurrentBook(userId: string): Promise<VocabularyBook | null> {
    try {
      const { data, error } = await supabase
        .from('user_vocabulary_books')
        .select(`
          *,
          vocabulary_books (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        // No book selected
        return null;
      }

      return data.vocabulary_books ? this.dbToClientBook(data.vocabulary_books) : null;
    } catch (error) {
      console.error('Error in getCurrentBook:', error);
      return null;
    }
  }
} 