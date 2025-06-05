"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { StatsService } from "@/services/statsService";
import { SettingsService, UserSettings } from "@/services/settingsService";
import {
  VocabularyService,
  VocabularyWord,
} from "@/services/vocabularyService";

export default function ReviewPage() {
  const [reviewWords, setReviewWords] = useState<VocabularyWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<string[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [isRecordingStats, setIsRecordingStats] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  // Use refs to store latest values for cleanup function
  const reviewedWordsRef = useRef<string[]>([]);
  const correctWordsRef = useRef<string[]>([]);
  const statsRecordedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    reviewedWordsRef.current = reviewedWords;
  }, [reviewedWords]);

  useEffect(() => {
    correctWordsRef.current = correctWords;
  }, [correctWords]);

  useEffect(() => {
    statsRecordedRef.current = statsRecorded;
  }, [statsRecorded]);

  useEffect(() => {
    console.log(
      "ReviewPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "ReviewPage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return;

      try {
        const settings = await SettingsService.getUserSettings(user.id);
        setUserSettings(settings);
        console.log("Loaded user settings:", settings);
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadUserSettings();
  }, [user?.id]);

  // Load review words when user is available
  useEffect(() => {
    const loadReviewWords = async () => {
      if (!user?.id) {
        console.log("No user ID available for loading review words");
        return;
      }

      console.log("Starting to load review words for user:", user.id);
      setIsLoadingWords(true);
      setLoadingError(null);
      try {
        const words = await VocabularyService.getReviewWordsFromCurrentBook(
          user.id,
          20
        );
        console.log("Loaded review words:", words);

        if (words.length === 0) {
          console.log("No words to review - setting review complete");
          // No words to review
          setIsReviewComplete(true);
        } else {
          console.log(`Setting ${words.length} review words`);
          setReviewWords(words);
        }
      } catch (error) {
        console.error("Error loading review words:", error);
        setLoadingError("加载复习单词时出错，请稍后重试");
      } finally {
        console.log("Finished loading review words - setting loading to false");
        setIsLoadingWords(false);
      }
    };

    loadReviewWords();
  }, [user?.id]);

  // Record review session when it's completed or when component unmounts
  useEffect(() => {
    const recordReviewSession = async () => {
      if (
        isReviewComplete &&
        !statsRecorded &&
        user?.id &&
        reviewedWords.length > 0
      ) {
        setIsRecordingStats(true);

        const sessionDuration = Math.floor(
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
        );

        try {
          const success = await StatsService.recordStudySession(
            user.id,
            reviewedWords.length,
            correctWords.length,
            Math.max(1, sessionDuration) // Ensure at least 1 minute
          );

          if (success) {
            console.log("Review session recorded successfully");
            setStatsRecorded(true);
          } else {
            console.error("Failed to record review session");
          }
        } catch (error) {
          console.error("Error recording review session:", error);
        } finally {
          setIsRecordingStats(false);
        }
      }
    };

    recordReviewSession();
  }, [
    isReviewComplete,
    statsRecorded,
    user?.id,
    reviewedWords.length,
    correctWords.length,
    sessionStartTime,
  ]);

  // Save progress when component unmounts (handles all exit scenarios)
  useEffect(() => {
    // Return cleanup function that will run when component unmounts
    return () => {
      // Only save if there's progress and we haven't saved yet
      if (
        user?.id &&
        reviewedWordsRef.current.length > 0 &&
        !statsRecordedRef.current
      ) {
        const sessionDuration = Math.floor(
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
        );

        // Use fire-and-forget approach for cleanup
        StatsService.recordStudySession(
          user.id,
          reviewedWordsRef.current.length,
          correctWordsRef.current.length,
          Math.max(1, sessionDuration)
        )
          .then(() => {
            console.log("Review progress saved on cleanup");
          })
          .catch((error) => {
            console.error("Error saving review progress on cleanup:", error);
          });
      }
    };
  }, [user?.id, sessionStartTime]); // Only depend on stable values

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Show loading while fetching words
  if (isLoadingWords) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-8 text-white">
        <Image
          src="/images/home-bg.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="-z-10"
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl text-white">正在加载复习单词...</p>
        </div>
      </main>
    );
  }

  // Show error if loading failed
  if (loadingError) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-8 text-white">
        <Image
          src="/images/home-bg.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="-z-10"
        />
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          <Card variant="stats" className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">加载失败</h1>
            <p className="text-white/70 text-lg mb-8">{loadingError}</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>
              <Button variant="default" onClick={() => router.push("/home")}>
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // Check if we have words to review
  if (reviewWords.length === 0 && !isLoadingWords) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-8 text-white">
        <Image
          src="/images/home-bg.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="-z-10"
        />
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          <Card variant="stats" className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">
              没有要复习的单词！
            </h1>
            <p className="text-white/70 text-lg mb-8">
              你暂时没有需要复习的单词。可以去学习新单词，或者稍后再来复习。
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => router.push("/study")}>
                学习新词
              </Button>
              <Button variant="default" onClick={() => router.push("/courses")}>
                选择词书
              </Button>
              <Button variant="default" onClick={() => router.push("/home")}>
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const currentWord = reviewWords[currentWordIndex];
  const totalWords = reviewWords.length;
  const progress = (reviewedWords.length / totalWords) * 100;

  const handleKnow = async () => {
    if (!reviewedWords.includes(currentWord.id)) {
      setReviewedWords((prev) => [...prev, currentWord.id]);
      setCorrectWords((prev) => [...prev, currentWord.id]);

      // Update word progress in database
      try {
        await VocabularyService.updateWordProgress(
          user.id,
          currentWord.id,
          2, // Increase mastery level
          true
        );
      } catch (error) {
        console.error("Error updating word progress:", error);
      }
    }
    nextWord();
  };

  const handleDontKnow = async () => {
    if (!reviewedWords.includes(currentWord.id)) {
      setReviewedWords((prev) => [...prev, currentWord.id]);
      setIncorrectWords((prev) => [...prev, currentWord.id]);

      // Update word progress in database
      try {
        await VocabularyService.updateWordProgress(
          user.id,
          currentWord.id,
          0, // Reset mastery level
          false
        );
      } catch (error) {
        console.error("Error updating word progress:", error);
      }
    }
    nextWord();
  };

  const nextWord = () => {
    setShowAnswer(false);
    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setIsReviewComplete(true);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const restartReview = () => {
    setCurrentWordIndex(0);
    setShowAnswer(false);
    setReviewedWords([]);
    setCorrectWords([]);
    setIncorrectWords([]);
    setIsReviewComplete(false);
    setIsRecordingStats(false);
    setStatsRecorded(false);
  };

  const accuracy =
    reviewedWords.length > 0
      ? (correctWords.length / reviewedWords.length) * 100
      : 0;

  if (isReviewComplete) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-8 text-white">
        <Image
          src="/images/home-bg.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="-z-10"
        />

        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          <Card variant="stats" className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">复习完成！</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <p className="text-white/70 text-sm">复习单词</p>
                <p className="text-2xl font-bold text-white">
                  {reviewedWords.length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">正确率</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round(accuracy)}%
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">掌握</p>
                <p className="text-2xl font-bold text-green-400">
                  {correctWords.length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">需加强</p>
                <p className="text-2xl font-bold text-red-400">
                  {incorrectWords.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {incorrectWords.length > 0 && (
                <p className="text-white/70">
                  建议继续复习 {incorrectWords.length} 个单词
                </p>
              )}

              {isRecordingStats && (
                <p className="text-white/60 text-sm">正在保存复习记录...</p>
              )}

              {statsRecorded && (
                <p className="text-green-400 text-sm">✓ 复习记录已保存</p>
              )}

              <div className="flex gap-4">
                <Button
                  variant="default"
                  onClick={restartReview}
                  className="flex-1"
                  disabled={isRecordingStats}
                >
                  重新复习
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push("/home")}
                  className="flex-1"
                  disabled={isRecordingStats}
                >
                  返回首页
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-8 text-white">
      <Image
        src="/images/home-bg.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="-z-10"
      />

      {/* Top Bar - Static, no animation */}
      <div className="w-full flex justify-start items-center">
        <div className="text-2xl font-medium text-white tracking-tight font-pacifico">
          melonvocab
        </div>
      </div>

      {/* Main Content Area - Left Right Layout */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:justify-between w-full max-w-6xl px-4 md:px-0 py-10 md:py-0 animate-fade-in">
        {/* Left Side - Word Display */}
        <div className="mb-10 md:mb-0 md:mr-10 flex-1">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="back" onClick={() => router.back()} />
          </div>

          <div className="text-left text-white">
            <h1 className="text-6xl font-light leading-tight mb-8">
              {currentWord.word}
            </h1>
            <div className="space-y-4">
              {userSettings?.showPronunciation && (
                <p className="text-xl text-white/80">
                  {currentWord.pronunciation?.us ||
                    currentWord.pronunciation?.uk ||
                    ""}
                </p>
              )}
              <p className="text-lg text-white/70">
                {currentWord.meanings[0]?.partOfSpeech}
              </p>
              {showAnswer && (
                <div className="space-y-4 mt-8">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      释义
                    </h3>
                    <div className="space-y-2">
                      {currentWord.meanings.map((meaning, index) => (
                        <p key={index} className="text-white/80">
                          {index + 1}. {meaning.definition}
                        </p>
                      ))}
                    </div>
                  </div>
                  {userSettings?.showExamples &&
                    currentWord.meanings[0]?.examples &&
                    currentWord.meanings[0].examples.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          例句
                        </h3>
                        <div className="space-y-3">
                          {currentWord.meanings[0].examples.map(
                            (example, index) => (
                              <div
                                key={index}
                                className="bg-white/5 rounded-lg p-4"
                              >
                                <p className="text-white/90 italic mb-2">
                                  {example.sentence}
                                </p>
                                <p className="text-white/70 text-sm">
                                  {example.translation}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          {/* Progress */}
          <div className="mb-4">
            <Progress
              value={progress}
              showLabel
              label={`复习进度 ${currentWordIndex + 1} / ${totalWords}`}
              className="mb-2"
            />
            <div className="text-center text-sm text-white/70">
              正确率: {Math.round(accuracy)}%
            </div>
          </div>

          {!showAnswer ? (
            <Button
              variant="primary"
              onClick={toggleAnswer}
              className="py-4 text-lg"
            >
              显示答案
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                variant="default"
                onClick={handleDontKnow}
                className="py-4 bg-red-600/70 hover:bg-red-500/70 border-red-500/50 text-lg"
              >
                需加强
              </Button>
              <Button
                variant="primary"
                onClick={handleKnow}
                className="py-4 bg-green-600/70 hover:bg-green-500/70 border-green-500/50 text-lg"
              >
                已掌握
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
