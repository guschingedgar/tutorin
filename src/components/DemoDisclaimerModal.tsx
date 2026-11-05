"use client";

import { useEffect, useState } from "react";

interface DemoDisclaimerModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export function DemoDisclaimerModal({ isOpen, onContinue }: DemoDisclaimerModalProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown whenever the modal opens
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
            <span className="text-3xl">🎯</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">
          Welcome to TutorIN Demo
        </h2>

        {/* Message */}
        <div className="mb-6 space-y-3 text-gray-700">
          <p>
            <strong>This is a demonstration prototype</strong> built to showcase the
            concept and user experience of a peer-to-peer tutoring platform for ESSEC
            students.
          </p>
          <p>
            The platform features mock data and non-functional booking flows. All
            interactions are simulated for demonstration purposes only.
          </p>
          <p className="text-sm text-gray-600">
            Interested in learning more about this project or discussing potential
            implementations? I&apos;d love to hear from you!
          </p>
        </div>

        {/* Single button with countdown */}
        <button
          onClick={onContinue}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 px-6 font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
        >
          {countdown > 0 ? `Continue to Demo (${countdown}s)` : "Continue to Demo →"}
        </button>

        {/* Skip link */}
        <button
          onClick={onContinue}
          className="mt-4 w-full text-center text-xs text-gray-400 underline hover:text-gray-600"
        >
          Skip and continue immediately
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Built by Victor Henz - ESSEC/CentraleSupélec
        </p>
      </div>
    </div>
  );
}

