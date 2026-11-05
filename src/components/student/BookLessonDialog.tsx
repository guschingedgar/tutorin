"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type SelectedSubject = string;

export type TimeSlot = {
  id: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  campus?: "Cergy" | "La Défense" | "Online";
  subjectId: string;
};

export type ClassEvent = {
  id: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  title: string;
};

export type BookingState = {
  subjectId: string | null;
  slotId: string | null;
  isSubmitting: boolean;
};

export type BookedLesson = {
  id: string;
  subjectId: string;
  subjectName: string;
  slot: TimeSlot;
};

type Subject = {
  id: string;
  name: string;
};

type BookLessonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: (booking: BookedLesson) => void;
};

// TODO: Replace with real API calls:
// - fetchSubjects()
// - fetchClassSchedule()
// - fetchAvailableSlots(subjectId)
// - createBooking(payload)

const subjects: Subject[] = [
  { id: "finance", name: "Corporate Finance" },
  { id: "statistics", name: "Statistics" },
  { id: "strategy", name: "Strategy" },
  { id: "coding", name: "Coding" },
  { id: "other", name: "Other" },
];

function createIso(startOffsetDays: number, startHour: number, endHour: number) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + startOffsetDays);
  const start = new Date(base);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(base);
  end.setHours(endHour, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

// Mock class timetable for the student
export const classSchedule: ClassEvent[] = [
  {
    id: "class-1",
    ...createIso(0, 14, 16),
    title: "Corporate Finance lecture",
  },
  {
    id: "class-2",
    ...createIso(1, 10, 12),
    title: "Statistics tutorial",
  },
  {
    id: "class-3",
    ...createIso(3, 18, 20),
    title: "Group project meeting",
  },
];

// Mock available slots for the next 2 weeks
export const timeSlots: TimeSlot[] = [
  {
    id: "slot-1",
    subjectId: "finance",
    campus: "Cergy",
    ...createIso(0, 18, 20),
  },
  {
    id: "slot-2",
    subjectId: "finance",
    campus: "Online",
    ...createIso(1, 14, 16),
  },
  {
    id: "slot-3",
    subjectId: "statistics",
    campus: "La Défense",
    ...createIso(2, 10, 12),
  },
  {
    id: "slot-4",
    subjectId: "strategy",
    campus: "Online",
    ...createIso(4, 18, 20),
  },
  {
    id: "slot-5",
    subjectId: "coding",
    campus: "Cergy",
    ...createIso(6, 9, 11),
  },
  {
    id: "slot-6",
    subjectId: "coding",
    campus: "Online",
    ...createIso(9, 17, 19),
  },
];

function getConflictForSlot(slot: TimeSlot, schedule: ClassEvent[]): ClassEvent | null {
  const slotStart = new Date(slot.start).getTime();
  const slotEnd = new Date(slot.end).getTime();
  for (const event of schedule) {
    const classStart = new Date(event.start).getTime();
    const classEnd = new Date(event.end).getTime();
    const overlaps = slotStart < classEnd && slotEnd > classStart;
    if (overlaps) {
      return event;
    }
  }
  return null;
}

async function fakeBookLesson(params: { subjectId: string; slotId: string }) {
  // Simulate latency; replace with real API later
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    ...params,
    id: `${params.subjectId}-${params.slotId}-${Date.now()}`,
  };
}

function formatDateLabel(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 6) return "This week";
  if (diffDays <= 13) return "Next week";
  return date.toLocaleDateString();
}

function formatTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${start.toLocaleTimeString([], opts)}–${end.toLocaleTimeString(
    [],
    opts,
  )}`;
}

type GroupedSlots = {
  label: string;
  items: TimeSlot[];
};

function groupSlots(slots: TimeSlot[]): GroupedSlots[] {
  const groups = new Map<string, TimeSlot[]>();
  for (const slot of slots) {
    const start = new Date(slot.start);
    const label = formatDateLabel(start);
    const existing = groups.get(label) ?? [];
    existing.push(slot);
    groups.set(label, existing);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items: items.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    ),
  }));
}

export function BookLessonDialog({
  open,
  onOpenChange,
  onBookingCreated,
}: BookLessonDialogProps) {
  const [state, setState] = useState<BookingState>({
    subjectId: subjects[0]?.id ?? null,
    slotId: null,
    isSubmitting: false,
  });

  const visibleSlots = useMemo(() => {
    if (!state.subjectId) return [];
    return timeSlots.filter((slot) => slot.subjectId === state.subjectId);
  }, [state.subjectId]);

  const groupedSlots = useMemo(
    () => groupSlots(visibleSlots),
    [visibleSlots],
  );

  const handleClose = () => {
    if (state.isSubmitting) return;
    onOpenChange(false);
    setState((prev) => ({ ...prev, slotId: null }));
  };

  const handleConfirm = async () => {
    if (!state.subjectId || !state.slotId) return;
    const slot = timeSlots.find((s) => s.id === state.slotId);
    if (!slot) return;

    const conflict = getConflictForSlot(slot, classSchedule);
    if (conflict) return;

    try {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      const result = await fakeBookLesson({
        subjectId: state.subjectId,
        slotId: state.slotId,
      });
      const subject = subjects.find((s) => s.id === state.subjectId)!;
      onBookingCreated({
        id: result.id,
        subjectId: subject.id,
        subjectName: subject.name,
        slot,
      });
      handleClose();
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false, slotId: null }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-slate-900/40 px-4 py-8">
      <div className="absolute inset-0" onClick={handleClose} />
      <Card className="relative z-10 h-full w-full max-w-md overflow-hidden border-slate-200 bg-white/95 shadow-2xl">
        <CardHeader className="border-b bg-slate-50/70">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Book a lesson
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            Pick a subject and a time slot that doesn&apos;t overlap with your
            classes.
          </p>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4 pt-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">Subject</p>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={state.subjectId ?? ""}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  subjectId: e.target.value,
                  slotId: null,
                }))
              }
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Available time slots (next 2 weeks)
            </p>
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {groupedSlots.length === 0 && (
                <p className="text-xs text-slate-500">
                  No slots available for this subject yet.
                </p>
              )}
              {groupedSlots.map((group) => (
                <div key={group.label} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((slot) => {
                      const conflict = getConflictForSlot(slot, classSchedule);
                      const isSelected = state.slotId === slot.id;
                      const isDisabled = Boolean(conflict);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() =>
                            setState((prev) => ({ ...prev, slotId: slot.id }))
                          }
                          className={`flex w-full flex-col items-start rounded-xl border px-3 py-2 text-left text-xs transition ${
                            isDisabled
                              ? "cursor-not-allowed border-rose-100 bg-rose-50/60 text-slate-400"
                              : isSelected
                                ? "border-indigo-500 bg-indigo-50 text-slate-900"
                                : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50"
                          }`}
                        >
                          <span className="text-[11px] font-medium text-slate-700">
                            {formatTimeRange(slot.start, slot.end)} •{" "}
                            {slot.campus ?? "Online"}
                          </span>
                          <span className="mt-0.5 text-[11px] text-slate-500">
                            {new Date(slot.start).toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {conflict && (
                            <span className="mt-1 text-[10px] font-medium text-rose-600">
                              Conflicts with: {conflict.title}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleClose}
              disabled={state.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              onClick={handleConfirm}
              disabled={!state.slotId || state.isSubmitting}
            >
              {state.isSubmitting ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


