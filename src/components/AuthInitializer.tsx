"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

export default function AuthInitializer() {
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsInitialized = useAuthStore((state) => state.setIsInitialized);

  useEffect(() => {
    // Initial check and setup listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      console.log(
        "AuthInitializer: Auth state changed. Event:",
        _event,
        "Session:",
        session
      );
      setSession(session);
      setUser(session?.user || null);
    });

    // Fetch initial session on mount
    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      } else {
        console.log("Initial session:", session);
        setSession(session);
        setUser(session?.user || null);
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setIsInitialized]); // Dependencies ensure effect runs if state setters change

  // This component doesn't render anything, it's just for side effects
  return null;
}
