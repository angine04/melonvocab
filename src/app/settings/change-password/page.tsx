"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useAuthStore } from "@/store/authStore"; // Import Zustand store
import { Button } from "@/components/ui/Button"; // Import Button component
// import { Card } from "@/components/ui/Card"; // Removed Card component
import Image from "next/image"; // Import Image component

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  // Redirect if user is not logged in after auth state is initialized
  useEffect(() => {
    console.log(
      "ChangePasswordPage useEffect running. isInitialized:",
      isInitialized,
      "User:",
      user
    );
    if (isInitialized && !user) {
      console.log(
        "ChangePasswordPage: Auth state initialized. No user session found, redirecting to login..."
      );
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // While auth state is loading or user is not logged in, render a loading state
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      console.error("Error changing password:", updateError);
      setError("Failed to change password: " + updateError.message);
    } else {
      setSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      // Optionally redirect after a delay or show success message
      // setTimeout(() => router.push('/settings'), 2000);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-8 text-white">
      {/* Background Image */}
      <Image
        src="/images/home-bg.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="-z-10"
      />

      {/* Top Bar - Contains Logo - Static, no animation */}
      <div className="w-full flex justify-start items-center">
        {/* Logo */}
        <div className="text-2xl font-medium text-white tracking-tight font-pacifico">
          melonvocab
        </div>
      </div>

      {/* Main Content Area - Left Right Layout */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:justify-between w-full max-w-6xl px-4 md:px-0 py-10 md:py-0 animate-fade-in">
        {/* Left Side - Title and Back Button */}
        <div className="mb-10 md:mb-0 md:mr-10 flex-1">
          {/* Back Button - Placed above the title */}
          <div className="mb-6">
            <Button variant="back" onClick={() => router.back()} />
          </div>
          <div className="text-left text-white">
            <h1 className="text-6xl font-light leading-tight mb-4">
              Change
              <br />
              Password
            </h1>
            <p className="text-xl text-white/70">
              Update your password for your account.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
                disabled={loading}
                placeholder="输入新密码"
              />
            </div>

            <div>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
                disabled={loading}
                placeholder="再次输入新密码"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-400 text-center">{success}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-full transition-colors"
            >
              {loading ? "修改中..." : "确认修改"}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
