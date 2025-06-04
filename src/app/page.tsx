"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log(
      "RootPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );

    if (isInitialized) {
      if (user) {
        console.log("RootPage: User found, redirecting to /home...");
        router.push("/home");
      } else {
        console.log("RootPage: No user found, redirecting to /login...");
        router.push("/login");
      }
    }
  }, [user, isInitialized, router]);

  // Optional: Render a loading indicator or null while checking auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 transition-opacity duration-300 ease-in-out opacity-100">
        <div className="text-center animate-fade-in">
          <div className="text-2xl font-medium text-white tracking-tight font-pacifico mb-4">
            melonvocab
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // Return null or a simple div if already redirecting or initialized
  return null;
}
