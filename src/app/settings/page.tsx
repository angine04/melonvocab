"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { SettingsService, UserSettings } from "@/services/settingsService";

export default function SettingsPage() {
  // === React Hooks (Must be at the top) ===
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [settings, setSettings] = useState<UserSettings>({
    dailyGoal: 20,
    showPronunciation: true,
    showExamples: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if user is not logged in after auth state is initialized
  useEffect(() => {
    console.log(
      "SettingsPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "SettingsPage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Load user settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userSettings = await SettingsService.getUserSettings(user.id);
          if (userSettings) {
            setSettings(userSettings);
          }
        } catch (error) {
          console.error("Failed to load settings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isInitialized && user) {
      loadSettings();
    }
  }, [user, isInitialized]);

  // While auth state is loading or user is not logged in, render a loading state or null
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const handleSettingChange = async (
    key: keyof UserSettings,
    value: string | number | boolean
  ) => {
    if (!user?.id || isSaving) return;

    setIsSaving(true);

    // Optimistically update UI
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    try {
      const success = await SettingsService.updateSingleSetting(
        user.id,
        key,
        value
      );
      if (!success) {
        // Revert on error
        setSettings((prev) => ({
          ...prev,
          [key]: settings[key], // revert to previous value
        }));
        console.error("Failed to save setting");
      }
    } catch (error) {
      console.error("Error saving setting:", error);
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        [key]: settings[key], // revert to previous value
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    console.log("Attempting to log out from settings page...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Logout failed: " + error.message);
    } else {
      console.log("Logged out successfully from settings page.");
      router.push("/login");
    }
    console.log("signOut function finished from settings page.");
  };

  if (isLoading) {
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
            <h1 className="text-6xl font-light leading-tight mb-4">Settings</h1>
            <p className="text-xl text-white/70">
              Customize your learning experience.
            </p>
          </div>
        </div>

        {/* Right Side - Settings Content */}
        <div className="flex flex-col w-full max-w-md h-full">
          {/* All Content - Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-200px)] custom-scrollbar">
            <div className="space-y-6 py-6">
              {/* Daily Goal */}
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  学习目标
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">每日目标</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleSettingChange(
                          "dailyGoal",
                          Math.max(5, settings.dailyGoal - 5)
                        )
                      }
                      disabled={isSaving}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-12 text-center">
                      {settings.dailyGoal}
                    </span>
                    <button
                      onClick={() =>
                        handleSettingChange(
                          "dailyGoal",
                          Math.min(100, settings.dailyGoal + 5)
                        )
                      }
                      disabled={isSaving}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>

              {/* Display Options */}
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  显示选项
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">显示音标</span>
                    <button
                      onClick={() =>
                        handleSettingChange(
                          "showPronunciation",
                          !settings.showPronunciation
                        )
                      }
                      disabled={isSaving}
                      className={`w-14 h-7 rounded-full transition-all duration-300 relative backdrop-blur-sm border ${
                        settings.showPronunciation
                          ? "bg-gradient-to-r from-emerald-500/30 to-green-400/30 border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                          : "bg-white/10 border-white/20 hover:bg-white/15"
                      } disabled:opacity-50`}
                      aria-label="切换显示音标"
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 shadow-lg ${
                          settings.showPronunciation
                            ? "translate-x-8 shadow-emerald-500/30"
                            : "translate-x-1 shadow-black/20"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">显示例句</span>
                    <button
                      onClick={() =>
                        handleSettingChange(
                          "showExamples",
                          !settings.showExamples
                        )
                      }
                      disabled={isSaving}
                      className={`w-14 h-7 rounded-full transition-all duration-300 relative backdrop-blur-sm border ${
                        settings.showExamples
                          ? "bg-gradient-to-r from-emerald-500/30 to-green-400/30 border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                          : "bg-white/10 border-white/20 hover:bg-white/15"
                      } relative disabled:opacity-50`}
                      aria-label="切换显示例句"
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 shadow-lg ${
                          settings.showExamples
                            ? "translate-x-8 shadow-emerald-500/30"
                            : "translate-x-1 shadow-black/20"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Account Actions */}
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  账户操作
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={() => router.push("/settings/change-password")}
                    className="flex-1"
                  >
                    修改密码
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleLogout}
                    className="flex-1 bg-red-600/70 hover:bg-red-500/70 border-red-500/50"
                  >
                    退出登录
                  </Button>
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
