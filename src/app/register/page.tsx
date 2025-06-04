"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";

// Initialize Supabase client (ensure this is done safely for client-side)
// You might want to abstract this into a helper utility
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") || "";
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  const handleRegisterSubmit = async () => {
    if (!username.trim() || !password.trim() || !firstName.trim()) {
      // Handle empty username, password, or first name
      console.error("Username, password, and first name cannot be empty.");
      alert("Please fill in username, password, and first name.");
      return;
    }

    try {
      // 1. Sign up using Supabase Auth with a derived email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username}@yourdomain.com`, // Use a derived email
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // Replace with your actual callback URL if needed
          data: {
            username: username,
            first_name: firstName,
            last_name: lastName,
          }, // Pass additional profile data
        },
      });

      if (authError) {
        console.error("Error signing up:", authError);
        alert(`Registration failed: ${authError.message}`);
        return;
      }

      const user = authData?.user;

      if (user) {
        // 2. Insert profile data into the profiles table
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            username: username,
            first_name: firstName, // Insert first name
            last_name: lastName, // Insert last name
            // created_at will be set by default
          },
        ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          alert(`Profile creation failed: ${profileError.message}`);
          router.push("/login");
          return;
        }

        console.log("User registered and profile created successfully!");
        alert("Registration successful! Please log in.");
        router.push("/login");
      } else {
        console.log(
          "Registration successful, but user data not immediately available. Email confirmation might be pending."
        );
        alert(
          "Registration successful! Please check your email for confirmation (if enabled) or try logging in."
        );
        router.push("/login");
      }
    } catch (error) {
      console.error("An unexpected error occurred during registration:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegisterSubmit();
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
              Create Your
              <br />
              Account
            </h1>
            <p className="text-xl text-white/70">
              Enter your details to complete registration.
            </p>
          </div>
        </div>

        {/* Right Side - Input */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          {/* Removed label for username */}
          {/* <label htmlFor="username" className="sr-only">Username</label> */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
            disabled // Username comes from login page, make it non-editable
          />
          {/* Removed label for password */}
          {/* <label htmlFor="password" className="sr-only">Password</label> */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Password"
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
            autoFocus
          />

          {/* First Name and Last Name in a row */}
          <div className="flex gap-4">
            {/* Removed label for first name */}
            {/* <label htmlFor="first-name" className="sr-only">First Name</label> */}
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name (Required)"
              className="w-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
            />
            {/* Removed label for last name */}
            {/* <label htmlFor="last-name" className="sr-only">Last Name</label> */}
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name (Optional)"
              className="w-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition-all"
            />
          </div>

          <button
            onClick={handleRegisterSubmit}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 rounded-full transition-colors"
          >
            Register
          </button>
        </div>
      </div>

      {/* Footer area */}
      <div className="w-full h-16"></div>
    </main>
  );
}
