"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import the Supabase client
import { useRouter } from "next/navigation"; // Import useRouter
import { useAuthStore } from "@/store/authStore"; // Import Zustand store
import { StatsService } from "@/services/statsService";
import { SettingsService } from "@/services/settingsService";
import {
  VocabularyService,
  VocabularyBook,
} from "@/services/vocabularyService";

// Placeholder for the avatar image, replace with actual if available
const UserAvatar = () => (
  <Image
    src="/images/avatar.svg"
    alt="User Avatar"
    width={48}
    height={48}
    className="rounded-full object-cover"
  />
);

const Greeting = ({
  firstName,
  lastName,
  currentStreak,
  todayProgress,
  dailyGoal,
}: {
  firstName: string;
  lastName: string | null;
  currentStreak: number;
  todayProgress: number;
  dailyGoal: number;
}) => {
  const displayLastName = lastName ? lastName : ""; // Handle optional last name
  const displayName = `${firstName} ${displayLastName}`.trim();

  // Generate different messages based on today's study status
  const getGreetingMessage = () => {
    if (todayProgress === 0) {
      // Haven't studied today
      if (currentStreak > 0) {
        return `Don't break your ${currentStreak}-day streak! Start studying now.`;
      } else {
        return "Start your learning journey today!";
      }
    } else if (todayProgress >= dailyGoal) {
      // Completed daily goal
      return `Great job! You've completed today's goal of ${dailyGoal} words. Keep going!`;
    } else {
      // Partially completed
      const remaining = dailyGoal - todayProgress;
      return `You've studied ${todayProgress} words today. ${remaining} more to reach your goal!`;
    }
  };

  return (
    <div className="text-left text-white">
      <h1 className="text-5xl font-light leading-tight">
        Good morning,
        <br />
        {displayName || "there"} {/* Display name or a fallback */}
      </h1>
      <p className="mt-4 text-lg font-light text-neutral-300">
        {getGreetingMessage()}
      </p>
    </div>
  );
};

const UserActions = ({
  currentBook,
}: {
  currentBook: VocabularyBook | null;
}) => (
  <div className="flex flex-col space-y-3 w-full max-w-xs">
    <div className="grid grid-cols-2 gap-3">
      <Link href="/stats" className="flex-1">
        <Button variant="profile" icon={<UserAvatar />} className="w-full">
          Your Profile
        </Button>
      </Link>
      <Link href="/settings" className="flex-1">
        <Button variant="default" className="w-full">
          Settings
        </Button>
      </Link>
    </div>
    <Link href="/courses" className="w-full">
      <Button variant="default" className="py-4 w-full">
        {currentBook ? `Current Course: ${currentBook.name}` : "Select Course"}
      </Button>
    </Link>
    <div className="grid grid-cols-2 gap-3">
      <Link href="/review" className="flex-1">
        <Button variant="default" className="w-full">
          Review
        </Button>
      </Link>
      <Link href="/study" className="flex-1">
        <Button variant="primary" className="w-full">
          Start learning
        </Button>
      </Link>
    </div>
  </div>
);

const Logo = () => (
  <div className="text-2xl font-medium text-white tracking-tight font-pacifico">
    melonvocab
  </div>
);

export default function HomePage() {
  // React Hooks (Must be at the top)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayProgress, setTodayProgress] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [currentBook, setCurrentBook] = useState<VocabularyBook | null>(null);
  const router = useRouter(); // Initialize useRouter
  const { user, isInitialized } = useAuthStore(); // Get user and isInitialized from Zustand store

  // Effect to check auth state and redirect
  useEffect(() => {
    console.log(
      "HomePage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );

    // Wait for auth state to be initialized before checking user and redirecting
    if (isInitialized && !user) {
      console.log(
        "HomePage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Fetch profile data and stats if user is logged in
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      // Fetch profile, stats, today's progress, settings, and current book in parallel
      const [
        profileResponse,
        statsResponse,
        todayResponse,
        settingsResponse,
        currentBookResponse,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", userId)
          .single(),
        StatsService.getUserStats(userId),
        StatsService.getTodayProgress(userId),
        SettingsService.getUserSettings(userId),
        VocabularyService.getCurrentBook(userId),
      ]);

      // Handle profile data
      if (profileResponse.error) {
        console.error("Error fetching profile:\n", profileResponse.error);
      } else if (profileResponse.data) {
        setFirstName(profileResponse.data.first_name);
        setLastName(profileResponse.data.last_name);
      }

      // Handle stats data
      if (statsResponse) {
        setCurrentStreak(statsResponse.currentStreak);
      }

      // Handle today's progress
      if (todayResponse) {
        setTodayProgress(todayResponse.todayProgress);
      }

      // Handle settings data
      if (settingsResponse) {
        setDailyGoal(settingsResponse.dailyGoal);
      }

      // Handle current book data
      setCurrentBook(currentBookResponse);
    };

    // Fetch data only if user is available in Zustand store
    if (user) {
      fetchUserData(user.id);
    }
  }, [user]); // Rerun effect when user changes

  // Conditional rendering based on authentication state
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Component logic and JSX (Only render when authenticated)
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-8 text-white">
      {/* Background Image */}
      <Image
        src="/images/home-bg.jpg"
        alt="Abstract background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="-z-10"
      />

      {/* Top Bar - Static, no animation */}
      <div className="w-full flex justify-start items-center">
        <Logo />
      </div>

      {/* Main Content Area - 保持flex-1结构 */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:justify-between w-full max-w-6xl px-4 md:px-0 py-10 md:py-0 animate-fade-in">
        <div className="mb-10 md:mb-0 md:mr-10">
          <Greeting
            firstName={firstName}
            lastName={lastName}
            currentStreak={currentStreak}
            todayProgress={todayProgress}
            dailyGoal={dailyGoal}
          />
        </div>
        <UserActions currentBook={currentBook} />
      </div>

      {/* Footer area if needed, can be empty or have minimal content */}
      <div className="w-full h-16"></div>
    </main>
  );
}
