"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  roles: string[];
  student_subjects: string[] | null;
  tutor_subjects: string[] | null;
  transcript_url: string | null;
  created_at: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      // First try to find by user_id
      let { data, error } = await supabase
        .from("signups")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Fallback: try by email if user_id doesn't exist (for old records)
      if (error || !data) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) {
          const { data: emailData, error: emailError } = await supabase
            .from("signups")
            .select("*")
            .eq("email", userData.user.email)
            .single();
          if (!emailError && emailData) {
            data = emailData;
            error = null;
          }
        }
      }

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signOut };
}


