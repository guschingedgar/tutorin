"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TutorSession } from "@/app/tutor/page";

type RejectSessionDialogProps = {
  open: boolean;
  session: TutorSession | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sessionId: string, reason?: string) => Promise<void> | void;
};

function formatDateTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const datePart = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timePart = `${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}–${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return { datePart, timePart };
}

export function RejectSessionDialog({
  open,
  session,
  onOpenChange,
  onConfirm,
}: RejectSessionDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    setReason("");
  };

  const handleConfirmClick = async () => {
    if (!session) return;
    try {
      setIsSubmitting(true);
      await onConfirm(session.id, reason || undefined);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !session) return null;

  const { datePart, timePart } = formatDateTimeRange(session.start, session.end);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8">
      <div className="absolute inset-0" onClick={handleClose} />
      <Card className="relative z-10 w-full max-w-sm border-slate-200 bg-white/95 shadow-2xl">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Reject this request?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-medium text-slate-900">{session.subject}</span>
            </p>
            <p>
              Student:{" "}
              <span className="font-medium text-slate-900">
                {session.studentName}
              </span>
            </p>
            <p>
              {datePart} • {timePart}
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="reject-reason"
              className="text-xs font-medium text-slate-700"
            >
              Optional reason
            </label>
            <select
              id="reject-reason"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason (optional)</option>
              <option value="Time conflict">Time conflict</option>
              <option value="Not my subject">Not my subject</option>
              <option value="Too many sessions">Too many sessions</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Keep request
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-3 text-xs font-semibold"
              onClick={handleConfirmClick}
              disabled={isSubmitting}
              aria-label="Confirm session rejection"
            >
              {isSubmitting ? "Rejecting..." : "Confirm rejection"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


