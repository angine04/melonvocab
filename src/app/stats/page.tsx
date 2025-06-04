"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { StatsService, UserStats, WeeklyData } from "@/services/statsService";
import { SettingsService, UserSettings } from "@/services/settingsService";

export default function StatsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(
      "StatsPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "StatsPage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Load all data when user is available
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          // Load user stats, settings, today's progress, and weekly data in parallel
          const [userStats, userSettings, todayData, weeklyStats] =
            await Promise.all([
              StatsService.getUserStats(user.id),
              SettingsService.getUserSettings(user.id),
              StatsService.getTodayProgress(user.id),
              StatsService.getWeeklyData(user.id),
            ]);

          if (userStats) setStats(userStats);
          if (userSettings) setSettings(userSettings);
          if (todayData) {
            setTodayProgress(todayData.todayProgress);
          }
          setWeeklyData(weeklyStats);
        } catch (error) {
          console.error("Failed to load stats data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isInitialized && user) {
      loadData();
    }
  }, [user, isInitialized]);

  // While auth state is loading or user is not logged in, render a loading state
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (isLoading || !stats || !settings) {
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
        {/* Left Side - Title */}
        <div className="mb-10 md:mb-0 md:mr-10 flex-1">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="back" onClick={() => router.back()} />
          </div>

          <div className="text-left text-white">
            <h1 className="text-6xl font-light leading-tight mb-4">
              Your
              <br />
              Progress
            </h1>
            <p className="text-xl text-white/70">
              Track your learning journey and achievements.
            </p>
          </div>
        </div>

        {/* Right Side - Stats Content */}
        <div className="flex flex-col w-full max-w-md h-full">
          {/* All Content - Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-200px)] custom-scrollbar">
            <div className="space-y-6 py-6">
              {/* Today's Progress */}
              <Card variant="stats" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  今日进度
                </h3>
                <Progress
                  value={todayProgress}
                  max={settings.dailyGoal}
                  showLabel
                  label={`${todayProgress}/${settings.dailyGoal} 个单词`}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-white/70">
                  <span>连续 {stats.currentStreak} 天</span>
                  <span>最长 {stats.longestStreak} 天</span>
                </div>
              </Card>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card variant="stats" className="text-center p-4">
                  <h4 className="text-white/70 text-sm mb-1">总学习</h4>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalWordsLearned}
                  </p>
                </Card>

                <Card variant="stats" className="text-center p-4">
                  <h4 className="text-white/70 text-sm mb-1">已掌握</h4>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.wordsMastered}
                  </p>
                </Card>

                <Card variant="stats" className="text-center p-4">
                  <h4 className="text-white/70 text-sm mb-1">学习中</h4>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.wordsInProgress}
                  </p>
                </Card>

                <Card variant="stats" className="text-center p-4">
                  <h4 className="text-white/70 text-sm mb-1">正确率</h4>
                  <p className="text-2xl font-bold text-sky-400">
                    {stats.averageAccuracy}%
                  </p>
                </Card>
              </div>

              {/* Learning Time */}
              <Card variant="stats" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  学习时间
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-white/70 text-xs">总时长</p>
                    <p className="text-lg font-bold text-white">
                      {Math.floor(stats.totalStudyTime / 60)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">日均</p>
                    <p className="text-lg font-bold text-white">
                      {stats.totalSessions > 0
                        ? Math.round(stats.totalStudyTime / stats.totalSessions)
                        : 0}
                      m
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">本周</p>
                    <p className="text-lg font-bold text-white">
                      {weeklyData.reduce((sum, day) => sum + day.time, 0)}m
                    </p>
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card variant="stats" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">成就</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg mb-1">🔥</div>
                    <p className="text-white/70 text-xs">连续学习</p>
                    <p className="text-white font-medium text-sm">
                      {stats.currentStreak} 天
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg mb-1">📚</div>
                    <p className="text-white/70 text-xs">单词达人</p>
                    <p className="text-white font-medium text-sm">
                      {stats.totalWordsLearned} 词
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg mb-1">⏰</div>
                    <p className="text-white/70 text-xs">时间投入</p>
                    <p className="text-white font-medium text-sm">
                      {Math.floor(stats.totalStudyTime / 60)}h+
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg mb-1">🎯</div>
                    <p className="text-white/70 text-xs">准确率</p>
                    <p className="text-white font-medium text-sm">
                      {stats.averageAccuracy}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* Weekly Data - Additional content that can be scrolled */}
              <Card variant="stats" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  本周表现
                </h3>
                <div className="space-y-3">
                  {weeklyData.map((day, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-white/70 text-sm">{day.day}</span>
                      <div className="flex gap-4">
                        <span className="text-white text-sm">
                          {day.words} 词
                        </span>
                        <span className="text-white/60 text-sm">
                          {day.time} 分钟
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
