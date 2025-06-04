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

export default function StudyPage() {
  // === React Hooks (Must be at the top) ===
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [studyWords, setStudyWords] = useState<VocabularyWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedWords, setStudiedWords] = useState<string[]>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [sessionStartTime] = useState(new Date());
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isRecordingStats, setIsRecordingStats] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);

  // Generate options state and effect
  const [options, setOptions] = useState<string[]>([]);

  // Use refs to store latest values for cleanup function
  const studiedWordsRef = useRef<string[]>([]);
  const knownWordsRef = useRef<string[]>([]);
  const statsRecordedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    studiedWordsRef.current = studiedWords;
  }, [studiedWords]);

  useEffect(() => {
    knownWordsRef.current = knownWords;
  }, [knownWords]);

  useEffect(() => {
    statsRecordedRef.current = statsRecorded;
  }, [statsRecorded]);

  // Redirect if user is not logged in after auth state is initialized
  useEffect(() => {
    console.log(
      "StudyPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "StudyPage: Auth state initialized. No user session found, redirecting to login..."
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

  // Load study words when user is available
  useEffect(() => {
    const loadStudyWords = async () => {
      if (!user?.id) return;

      setIsLoadingWords(true);
      try {
        const words = await VocabularyService.getNewWordsForStudy(user.id, 20);
        console.log("Loaded study words:", words);

        if (words.length === 0) {
          // No new words to study
          setIsSessionComplete(true);
        } else {
          setStudyWords(words);
        }
      } catch (error) {
        console.error("Error loading study words:", error);
      } finally {
        setIsLoadingWords(false);
      }
    };

    loadStudyWords();
  }, [user?.id]);

  // Generate options when the current word changes or component mounts
  useEffect(() => {
    if (studyWords.length === 0 || currentWordIndex >= studyWords.length)
      return;

    const currentWord = studyWords[currentWordIndex];
    if (currentWord && currentWord.meanings.length > 0) {
      const correctAnswer = currentWord.meanings[0].definition;
      const options = [correctAnswer];

      // Add other words' definitions as wrong options
      const otherWords = studyWords.filter(
        (w, index) => index !== currentWordIndex
      );
      const wrongOptions = otherWords
        .slice(0, 2)
        .filter((w) => w.meanings.length > 0)
        .map((w) => w.meanings[0].definition);

      // If we don't have enough wrong options, generate some generic ones
      while (wrongOptions.length < 2) {
        wrongOptions.push("其他含义");
      }

      options.push(...wrongOptions);

      // Shuffle options
      setOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [currentWordIndex, studyWords]);

  // Record study session when it's completed or when component unmounts
  useEffect(() => {
    const recordStudySession = async () => {
      if (
        isSessionComplete &&
        !statsRecorded &&
        user?.id &&
        studiedWords.length > 0
      ) {
        setIsRecordingStats(true);

        const sessionDuration = Math.floor(
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
        );

        try {
          const success = await StatsService.recordStudySession(
            user.id,
            studiedWords.length,
            knownWords.length,
            Math.max(1, sessionDuration) // Ensure at least 1 minute
          );

          if (success) {
            console.log("Study session recorded successfully");
            setStatsRecorded(true);
          } else {
            console.error("Failed to record study session");
          }
        } catch (error) {
          console.error("Error recording study session:", error);
        } finally {
          setIsRecordingStats(false);
        }
      }
    };

    recordStudySession();
  }, [
    isSessionComplete,
    statsRecorded,
    user?.id,
    studiedWords.length,
    knownWords.length,
    sessionStartTime,
  ]);

  // Save progress when component unmounts (handles all exit scenarios)
  useEffect(() => {
    // Return cleanup function that will run when component unmounts
    return () => {
      // Only save if there's progress and we haven't saved yet
      if (
        user?.id &&
        studiedWordsRef.current.length > 0 &&
        !statsRecordedRef.current
      ) {
        const sessionDuration = Math.floor(
          (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
        );

        // Use fire-and-forget approach for cleanup
        StatsService.recordStudySession(
          user.id,
          studiedWordsRef.current.length,
          knownWordsRef.current.length,
          Math.max(1, sessionDuration)
        )
          .then(() => {
            console.log("Progress saved on cleanup");
          })
          .catch((error) => {
            console.error("Error saving progress on cleanup:", error);
          });
      }
    };
  }, [user?.id, sessionStartTime]); // Only depend on stable values

  // === Conditional Rendering (Based on state) ===
  // While auth state is loading or user is not logged in, render a loading state or null
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
          <div className="text-white text-xl">加载学习单词中...</div>
        </div>
      </main>
    );
  }

  // === Component Logic (After conditional rendering) ===
  // Check if we have words to study
  if (studyWords.length === 0) {
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
              没有新单词了！
            </h1>
            <p className="text-white/70 text-lg mb-8">
              你已经学完了当前词书的所有单词，可以去复习已学过的单词，或者选择新的词书。
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => router.push("/review")}>
                去复习
              </Button>
              <Button variant="default" onClick={() => router.push("/courses")}>
                选择词书
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const currentWord = studyWords[currentWordIndex];
  const totalWords = studyWords.length;
  const progress = (studiedWords.length / totalWords) * 100;

  const handleOptionSelect = async (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
    setShowAnswer(true);

    const isCorrect = option === currentWord.meanings[0].definition;

    if (!studiedWords.includes(currentWord.id)) {
      setStudiedWords((prev) => [...prev, currentWord.id]);

      if (isCorrect) {
        setKnownWords((prev) => [...prev, currentWord.id]);
      } else {
        setUnknownWords((prev) => [...prev, currentWord.id]);
      }

      // Update word progress in database
      try {
        const masteryLevel = isCorrect ? 1 : 0; // Basic mastery level
        await VocabularyService.updateWordProgress(
          user.id,
          currentWord.id,
          masteryLevel,
          isCorrect
        );
      } catch (error) {
        console.error("Error updating word progress:", error);
      }
    }
  };

  const nextWord = () => {
    setShowAnswer(false);
    setShowResult(false);
    setSelectedOption(null);

    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentWordIndex(0);
    setShowAnswer(false);
    setStudiedWords([]);
    setKnownWords([]);
    setUnknownWords([]);
    setIsSessionComplete(false);
    setSelectedOption(null);
    setShowResult(false);
    setIsRecordingStats(false);
    setStatsRecorded(false);
  };

  const accuracy =
    studiedWords.length > 0
      ? (knownWords.length / studiedWords.length) * 100
      : 0;
  const sessionDuration = Math.floor(
    (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
  );

  if (isSessionComplete) {
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
            <h1 className="text-3xl font-bold text-white mb-6">学习完成！</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <p className="text-white/70 text-sm">学习单词</p>
                <p className="text-2xl font-bold text-white">
                  {studiedWords.length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">正确率</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round(accuracy)}%
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">认识</p>
                <p className="text-2xl font-bold text-green-400">
                  {knownWords.length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 text-sm">不认识</p>
                <p className="text-2xl font-bold text-red-400">
                  {unknownWords.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-white/70">学习时长: {sessionDuration} 分钟</p>

              {isRecordingStats && (
                <p className="text-white/60 text-sm">正在保存学习记录...</p>
              )}

              {statsRecorded && (
                <p className="text-green-400 text-sm">✓ 学习记录已保存</p>
              )}

              <div className="flex gap-4">
                <Button
                  variant="default"
                  onClick={restartSession}
                  className="flex-1"
                  disabled={isRecordingStats}
                >
                  再学一遍
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
              <p className="text-xl text-white/80">
                {currentWord.pronunciation?.us ||
                  currentWord.pronunciation?.uk ||
                  ""}
              </p>
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
                  {currentWord.meanings[0]?.examples &&
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
              label={`${currentWordIndex + 1} / ${totalWords}`}
              className="mb-2"
            />
            <div className="text-center text-sm text-white/70">
              正确率: {Math.round(accuracy)}%
            </div>
          </div>

          {!showAnswer ? (
            <div className="space-y-3">
              <p className="text-white/70 text-center mb-4">
                选择正确的中文释义
              </p>
              {options.map((option, index) => {
                let buttonClass = "py-3 text-sm border-2 transition-all";

                if (showResult) {
                  if (option === currentWord.meanings[0].definition) {
                    buttonClass +=
                      " bg-green-600/70 border-green-500 text-white";
                  } else if (option === selectedOption) {
                    buttonClass += " bg-red-600/70 border-red-500 text-white";
                  } else {
                    buttonClass += " bg-white/10 border-white/20 text-white/50";
                  }
                } else {
                  buttonClass +=
                    " bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40 text-white";
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && handleOptionSelect(option)}
                    disabled={showResult}
                    className={`w-full rounded-xl px-4 ${buttonClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={nextWord}
                className="py-4 text-lg"
              >
                下一个单词
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
