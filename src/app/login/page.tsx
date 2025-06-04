"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"username" | "password">("username");
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleUsernameSubmit = async () => {
    if (!username.trim()) return; // Prevent empty username submission

    // Check if username exists in Supabase
    const { data, error } = await supabase
      .from("profiles") // Assuming a 'profiles' table with a 'username' column
      .select("id, first_name, last_name") // Select first and last names as well
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means 'No rows found'
      console.error("Error checking username:", error);
      // Handle other potential errors, e.g., show an error message
      alert(`Error checking username: ${error.message}`); // Added alert for better user feedback
      return;
    }

    if (data) {
      // Username exists, proceed to password step
      setFirstName(data.first_name);
      setLastName(data.last_name || ""); // Store names, default last name to empty string if null
      setStep("password");
    } else {
      // Username does not exist, redirect to registration page
      router.push(`/register?username=${encodeURIComponent(username)}`);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      // Handle empty password
      console.error("Password cannot be empty.");
      return;
    }

    try {
      // Use derived email for login
      const derivedEmail = `${username}@yourdomain.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email: derivedEmail,
        password: password,
      });

      if (error) {
        console.error("Error logging in:", error);
        // Handle login errors (e.g., invalid credentials)
        alert(`Login failed: ${error.message}`);
        return;
      }

      // Login successful, redirect to home page
      console.log("User logged in successfully!");
      window.location.href = "/home"; // Or use router.push('/home') if preferred
    } catch (error) {
      console.error("An unexpected error occurred during login:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "username") {
        handleUsernameSubmit();
      } else {
        handlePasswordSubmit();
      }
    }
  };

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
          <div className="text-left text-white">
            {step === "username" ? (
              <>
                <h1 className="text-6xl font-light leading-tight mb-4">
                  Hello
                </h1>
                <p className="text-xl text-white/70">
                  Type your username to sign up or log in.
                </p>
              </>
            ) : (
              <>
                {/* Back Button for Password Step */}
                <div className="mb-6">
                  <Button variant="back" onClick={() => setStep("username")} />
                </div>
                <h1 className="text-6xl font-light leading-tight mb-4">
                  Welcome home,
                  <br />
                  {`${firstName} ${lastName}`.trim()}
                </h1>
                <p className="text-xl text-white/70">
                  Help us make sure it&apos;s you.{" "}
                  <button
                    className="underline hover:text-white transition-colors"
                    onClick={() => setStep("username")}
                  >
                    Lost your password?
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Input */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          {step === "username" ? (
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Username"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
                autoFocus
              />
              <button
                onClick={handleUsernameSubmit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                title="下一步"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Password"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
                autoFocus
              />
              <button
                onClick={handlePasswordSubmit}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                title="下一步"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
