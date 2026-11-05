"use client";

import { useState } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SignUpForm } from "@/components/landing/SignUpForm";
import { LoginForm } from "@/components/landing/LoginForm";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-fuchsia-100 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        
        {/* Auth Tabs */}
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-4 flex gap-2 rounded-lg bg-white/50 p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold transition ${
                activeTab === "signup"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-semibold transition ${
                activeTab === "login"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Log In
            </button>
          </div>
          
          {activeTab === "signup" ? <SignUpForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
}

