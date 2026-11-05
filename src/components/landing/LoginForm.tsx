"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DemoDisclaimerModal } from "@/components/DemoDisclaimerModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error("Login failed - no user returned");
      }

      console.log("✅ Auth successful:", data.user.id);
      console.log("🔍 User email:", data.user.email);

      // Fetch user profile to determine role
      console.log("🔍 Fetching profile for user_id:", data.user.id);
      let { data: profile, error: profileError } = await supabase
        .from("signups")
        .select("roles, user_id, email")
        .eq("user_id", data.user.id)
        .single();

      console.log("🔍 Profile fetch (by user_id):", { 
        profile, 
        error: profileError,
        user_id_searched: data.user.id 
      });

      // Fallback: try by email if user_id doesn't exist (for old records or broken signups)
      if (profileError || !profile) {
        console.log("⚠️ Profile not found by user_id, trying fallback: fetch by email");
        console.log("⚠️ This might indicate the user_id wasn't stored correctly during signup");
        
        const { data: emailProfile, error: emailError } = await supabase
          .from("signups")
          .select("roles, user_id, email")
          .eq("email", email)
          .single();
          
        console.log("🔍 Profile fetch (by email):", { 
          profile: emailProfile, 
          error: emailError,
          email_searched: email
        });
        
        if (emailProfile) {
          console.log("⚠️ Found profile by email, but user_id might be wrong:");
          console.log("  Profile user_id:", emailProfile.user_id);
          console.log("  Auth user id:", data.user.id);
          console.log("  Match:", emailProfile.user_id === data.user.id);
          profile = emailProfile;
          
          // If user_id doesn't match, warn but continue
          if (emailProfile.user_id && emailProfile.user_id !== data.user.id) {
            console.warn("⚠️ WARNING: Profile user_id doesn't match auth user ID!");
            console.warn("  This profile needs to be fixed in the database.");
          }
        }
      }

      if (!profile) {
        console.error("❌ Profile not found by user_id or email");
        console.error("  Auth user ID:", data.user.id);
        console.error("  Email searched:", email);
        throw new Error(
          "Could not find user profile. " +
          "Please contact support or try signing up again. " +
          "Your account may not have been created correctly."
        );
      }

      console.log("✅ Profile found:", profile);
      console.log("🔍 Roles:", profile.roles);
      console.log("🔍 Roles type:", typeof profile.roles, "IsArray:", Array.isArray(profile.roles));

      // Ensure roles is an array
      const roles = Array.isArray(profile.roles) ? profile.roles : [profile.roles].filter(Boolean);
      console.log("🔍 Processed roles array:", roles);

      // Determine redirect target with comprehensive debug logging
      console.log("=== REDIRECT DEBUG ===");
      console.log("🔍 Roles array:", roles);
      console.log("🔍 Roles type:", typeof roles);
      console.log("🔍 Is array?", Array.isArray(roles));
      console.log("🔍 Includes TUTOR?", roles.includes("TUTOR"));
      console.log("🔍 Includes STUDENT?", roles.includes("STUDENT"));
      console.log("🔍 Includes ADMIN?", roles.includes("ADMIN"));

      let redirectPath = "/";
      
      // Check in priority order: ADMIN > STUDENT-only > TUTOR-only > Both > Default
      if (roles.includes("ADMIN")) {
        redirectPath = "/company";
        console.log("✅ Redirect decision: ADMIN → /company");
      } else if (roles.includes("STUDENT") && !roles.includes("TUTOR")) {
        redirectPath = "/student";
        console.log("✅ Redirect decision: STUDENT only → /student");
      } else if (roles.includes("TUTOR") && !roles.includes("STUDENT")) {
        redirectPath = "/tutor";
        console.log("✅ Redirect decision: TUTOR only → /tutor");
      } else if (roles.includes("STUDENT") && roles.includes("TUTOR")) {
        redirectPath = "/student"; // Default to student dashboard when both roles
        console.log("✅ Redirect decision: Both STUDENT + TUTOR → /student (default)");
      } else if (roles.includes("TUTOR")) {
        // Fallback: if TUTOR is present (even with other roles), try tutor dashboard
        redirectPath = "/tutor";
        console.log("✅ Redirect decision: TUTOR present (fallback) → /tutor");
      } else {
        console.warn("⚠️ No matching role found, defaulting to /student");
        redirectPath = "/student";
      }

      console.log("🚀 Final redirect path:", redirectPath);
      console.log("=== END REDIRECT DEBUG ===");
      
      // Store redirect path and show demo disclaimer modal instead of immediate redirect
      setPendingRedirect(redirectPath);
      setShowDisclaimer(true);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Card className="mx-auto max-w-xl border-slate-100 bg-white/95 shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="text-[11px] font-medium text-slate-700"
            >
              ESSEC email address
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="firstname.lastname@essec.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="text-[11px] font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-[11px] font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              size="sm"
              className="h-8 w-full rounded-full bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Forgot your password?{" "}
            <span className="text-indigo-600 cursor-pointer hover:underline">
              Reset it
            </span>{" "}
            (coming soon)
          </p>
        </form>
      </CardContent>
    </Card>

      <DemoDisclaimerModal
      isOpen={showDisclaimer}
      onContinue={() => {
        if (pendingRedirect) {
          window.location.href = pendingRedirect;
        }
      }}
      />
    </>
  );
}

