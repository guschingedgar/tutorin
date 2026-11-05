"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SessionRating, SessionRatingValue } from "@/components/student/types";

interface SessionRatingControlsProps {
  sessionId: string;
  rating?: SessionRating;
  onRate: (value: SessionRatingValue) => Promise<void> | void;
}

const STAR_VALUES: SessionRatingValue[] = [1, 2, 3, 4, 5];

export function SessionRatingControls({
  sessionId,
  rating,
  onRate,
}: SessionRatingControlsProps) {
  const [hoverValue, setHoverValue] = useState<SessionRatingValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (rating) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-amber-600">
        <div className="flex items-center gap-0.5">
          {STAR_VALUES.map((value) => (
            <span
              key={value}
              aria-hidden="true"
              className={value <= rating.value ? "text-amber-400" : "text-slate-300"}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-slate-500">
          Rated <span className="font-medium">{rating.value}/5</span>
        </span>
      </div>
    );
  }

  const currentValue = hoverValue;

  const handleRate = async (value: SessionRatingValue) => {
    try {
      setIsSubmitting(true);
      await onRate(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 text-[11px]">
      <div className="flex items-center gap-0.5">
        {STAR_VALUES.map((value) => {
          const filled = currentValue ? value <= currentValue : false;
          return (
            <button
              key={value}
              type="button"
              className={`h-5 w-5 rounded-full text-xs leading-none ${
                filled ? "text-amber-400" : "text-slate-300"
              } hover:text-amber-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400`}
              onMouseEnter={() => setHoverValue(value)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => handleRate(value)}
              aria-label={`Rate session ${value} out of 5`}
              disabled={isSubmitting}
            >
              ★
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 px-2 text-[10px] text-slate-600 hover:bg-slate-100"
        onClick={() => handleRate(5)}
        disabled={isSubmitting}
        aria-label={`Mark this session as enjoyed, 5 out of 5`}
      >
        {isSubmitting ? "Saving..." : "Enjoyed this session"}
      </Button>
    </div>
  );
}


