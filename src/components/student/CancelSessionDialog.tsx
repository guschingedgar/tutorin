"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StudentSession } from "@/components/student/types";

type CancelSessionDialogProps = {
  open: boolean;
  session: StudentSession | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (session: StudentSession, reason?: string) => Promise<void> | void;
};

function formatDateTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const datePart = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const timePart = `${start.toLocaleTimeString([], opts)}–${end.toLocaleTimeString(
    [],
    opts,
  )}`;
  return { datePart, timePart };
}

export function CancelSessionDialog({
  open,
  session,
  onOpenChange,
  onConfirm,
}: CancelSessionDialogProps) {
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
      await onConfirm(session, reason || undefined);
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
            Cancel this session?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-medium text-slate-900">{session.subject}</span> with{" "}
              <span className="font-medium text-slate-900">{session.tutorName}</span>
            </p>
            <p>
              {datePart} • {timePart}
            </p>
            {session.campus && (
              <p className="text-slate-500">
                Location: <span className="font-medium">{session.campus}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="cancel-reason"
              className="text-xs font-medium text-slate-700"
            >
              Optional reason
            </label>
            <select
              id="cancel-reason"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason (optional)</option>
              <option value="Schedule conflict">Schedule conflict</option>
              <option value="Feeling sick">Feeling sick</option>
              <option value="Exam preparation change">Exam preparation change</option>
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
              Keep session
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-3 text-xs font-semibold"
              onClick={handleConfirmClick}
              disabled={isSubmitting}
              aria-label="Confirm session cancellation"
            >
              {isSubmitting ? "Cancelling..." : "Confirm cancellation"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


