"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  VocabularyService,
  VocabularyBook,
} from "@/services/vocabularyService";

export default function CoursesPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [allBooks, setAllBooks] = useState<VocabularyBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    console.log(
      "CoursesPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "CoursesPage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [books, userBooks] = await Promise.all([
        VocabularyService.getAllBooks(),
        VocabularyService.getUserBooks(user.id),
      ]);

      setAllBooks(books);
      const activeBook = userBooks.find((ub) => ub.isActive);
      setSelectedBookId(activeBook?.bookId || null);
    } catch (error) {
      console.error("Error loading vocabulary data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = async (book: VocabularyBook) => {
    if (!user || isUpdating) return;

    if (selectedBookId === book.id) {
      return;
    }

    setIsUpdating(book.id);
    try {
      if (selectedBookId) {
        await VocabularyService.removeBookFromUser(user.id, selectedBookId);
      }
      await VocabularyService.addBookToUser(user.id, book.id);
      setSelectedBookId(book.id);
    } catch (error) {
      console.error("Error selecting book:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-600/20 text-green-300";
      case "intermediate":
        return "bg-yellow-600/20 text-yellow-300";
      case "advanced":
        return "bg-red-600/20 text-red-300";
      default:
        return "bg-gray-600/20 text-gray-300";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "初级";
      case "intermediate":
        return "中级";
      case "advanced":
        return "高级";
      default:
        return "未知";
    }
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

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
        <div className="text-center">
          <div className="text-white">加载词库中...</div>
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
        {/* Left Side - Title */}
        <div className="mb-10 md:mb-0 md:mr-10 flex-1">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="back" onClick={() => router.back()} />
          </div>

          <div className="text-left text-white">
            <h1 className="text-6xl font-light leading-tight mb-4">
              Vocabulary
              <br />
              Books
            </h1>
            <p className="text-xl text-white/70">
              Choose your learning material.
            </p>
          </div>
        </div>

        {/* Right Side - Vocabulary Books */}
        <div className="flex flex-col w-full max-w-md h-full">
          {/* All Content - Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-200px)] custom-scrollbar">
            <div className="flex flex-col space-y-4 py-6">
              {allBooks.map((book) => {
                const isSelected = selectedBookId === book.id;
                const isUpdatingThis = isUpdating === book.id;

                return (
                  <Card
                    key={book.id}
                    variant="default"
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-500/30 to-green-400/30 border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                        : "hover:bg-white/15"
                    } ${isUpdatingThis ? "opacity-50" : ""}`}
                    onClick={() => handleBookSelect(book)}
                  >
                    {/* Header with title and toggle */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 text-left">
                          {book.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                              book.difficulty
                            )}`}
                          >
                            {getDifficultyText(book.difficulty)}
                          </span>
                          <span className="text-white/60 text-sm">
                            {book.totalWords} 个单词
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm text-left leading-relaxed mb-4">
                      {book.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {book.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
