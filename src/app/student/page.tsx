"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookLessonDialog, BookedLesson } from "@/components/student/BookLessonDialog";
import { CancelSessionDialog } from "@/components/student/CancelSessionDialog";
import { SessionRatingControls } from "@/components/student/SessionRatingControls";
import {
  StudentSession,
  SessionStatus,
  SessionRatingValue,
} from "@/components/student/types";
import { useAuth } from "@/lib/useAuth";
import { canAccessStudentDashboard } from "@/types/user";
import { useRouter } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";

// ----------------------------
// Types & helpers
// ----------------------------

function createIsoRelative(startOffsetDays: number, startHour: number, endHour: number) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + startOffsetDays);
  const start = new Date(base);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(base);
  end.setHours(endHour, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

const initialSessions: StudentSession[] = [
  {
    id: "session-1",
    subject: "Corporate Finance – Group Q&A",
    tutorName: "Marie L.",
    campus: "Cergy – room E204",
    language: "FR",
    level: "L3",
    status: "upcoming",
    ...createIsoRelative(1, 18, 20),
  },
  {
    id: "session-2",
    subject: "Statistics – exam prep workshop",
    tutorName: "Yann P.",
    campus: "Online (Zoom)",
    language: "EN",
    level: "M1",
    status: "upcoming",
    ...createIsoRelative(2, 14, 16),
  },
  {
    id: "session-3",
    subject: "Strategy – case interview prep",
    tutorName: "Alex G.",
    campus: "Cergy – room B105",
    language: "EN",
    level: "M1",
    status: "completed",
    ...createIsoRelative(-1, 17, 19),
    rating: {
      value: 5,
      createdAt: new Date().toISOString(),
      comment: "Super helpful explanation before the exam.",
    },
  },
  {
    id: "session-4",
    subject: "Corporate Finance – recap",
    tutorName: "Marie L.",
    campus: "Online",
    language: "FR",
    level: "L3",
    status: "completed",
    ...createIsoRelative(-3, 18, 20),
  },
  {
    id: "session-5",
    subject: "Coding basics – Python for finance",
    tutorName: "Thomas P.",
    campus: "Online",
    language: "EN",
    level: "L3",
    status: "completed",
    ...createIsoRelative(-7, 10, 12),
  },
];

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

// TODO: Wire these to real student sessions API:
// - fetchStudentSessions()
// - cancelStudentSession(id, reason)
// - rateStudentSession(id, value, comment)

async function fakeApiCancelSession(id: string, reason?: string) {
  console.info("Cancelling session (fake API)", { id, reason });
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { id, success: true };
}

async function fakeApiRateSession(
  id: string,
  value: SessionRatingValue,
  comment?: string,
) {
  console.info("Rating session (fake API)", { id, value, comment });
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, success: true };
}

function useStudentSessions() {
  const [sessions, setSessions] = useState<StudentSession[]>(initialSessions);

  const now = new Date();

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter(
          (s) => s.status === "upcoming" && new Date(s.start).getTime() >= now.getTime(),
        )
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        ),
    [sessions, now],
  );

  const recentCompletedSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "completed")
        .sort(
          (a, b) => new Date(b.end).getTime() - new Date(a.end).getTime(),
        )
        .slice(0, 4),
    [sessions],
  );

  const cancelSession = async (session: StudentSession, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id ? { ...s, status: "cancelled" as SessionStatus } : s,
      ),
    );

    try {
      await fakeApiCancelSession(session.id, reason);
    } catch (error) {
      console.error("Failed to cancel session (fake API)", error);
      // In a real implementation, we would revert state from a backup snapshot.
    }
  };

  const rateSession = async (
    sessionId: string,
    value: SessionRatingValue,
    comment?: string,
  ) => {
    const createdAt = new Date().toISOString();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              rating: { value, comment, createdAt },
            }
          : s,
      ),
    );

    try {
      await fakeApiRateSession(sessionId, value, comment);
    } catch (error) {
      console.error("Failed to rate session (fake API)", error);
      // TODO: revert rating and surface error to user via toast or inline message.
    }
  };

  return {
    sessions,
    setSessions,
    upcomingSessions,
    recentCompletedSessions,
    cancelSession,
    rateSession,
  };
}

export default function StudentDashboard() {
  // Always call hooks in the same order on every render.
  const {
    sessions,
    setSessions,
    upcomingSessions,
    recentCompletedSessions,
    cancelSession,
    rateSession,
  } = useStudentSessions();
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  // UI state hooks must be declared before any early return.
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sessionPendingCancel, setSessionPendingCancel] = useState<StudentSession | null>(
    null,
  );

  useEffect(() => {
    console.log("🔍 Student Dashboard Auth State:", { user: !!user, profile: !!profile, authLoading });
    
    if (!authLoading && !user) {
      console.log("❌ No user, redirecting to landing");
      router.replace("/");
    } else if (user && profile) {
      // Check if user has student role
      const hasStudentRole = profile.roles?.includes("STUDENT");
      console.log("🔍 User roles:", profile.roles, "Has student role:", hasStudentRole);
      if (!hasStudentRole) {
        console.log("❌ User doesn't have student role, redirecting");
        router.replace("/");
      }
    }
  }, [user, profile, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  // Allow rendering if user exists, even if profile is still loading
  // This prevents blank page while profile loads
  if (!user) {
    // Still loading or redirecting - show nothing while redirect happens
    return null;
  }

  // TEMPORARY: Show dashboard even if profile hasn't loaded yet
  // This prevents blank page while profile is being fetched
  // The useEffect will handle redirect if user doesn't have student role
  console.log("✅ Rendering student dashboard", { hasUser: !!user, hasProfile: !!profile });

  const handleBookingCreated = (booking: BookedLesson) => {
    const campusLabel =
      booking.slot.campus === "Online" || !booking.slot.campus
        ? "Online session"
        : `On campus ${booking.slot.campus}`;

    const newSession: StudentSession = {
      id: booking.id,
      subject: `${booking.subjectName} – 1:1 tutoring`,
      tutorName: "To be confirmed",
      campus: campusLabel,
      language: "EN",
      level: "L3",
      status: "upcoming",
      start: booking.slot.start,
      end: booking.slot.end,
    };

    setSessions((prev) => [newSession, ...prev]);
  };

  const openCancelDialog = (session: StudentSession) => {
    setSessionPendingCancel(session);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancellation = async (session: StudentSession, reason?: string) => {
    await cancelSession(session, reason);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-violet-100 to-fuchsia-100 px-4 py-8">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-6 rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur">
        <header className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Student overview
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Snapshot of your learning activity on TutorIN
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-600">
                Focus: Corporate Finance
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                March 2025
              </span>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              className="h-11 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              onClick={() => setIsBookingOpen(true)}
              aria-label="Book a tutoring lesson"
            >
              Book a lesson
            </Button>
            <div className="flex items-center gap-2">
              <RoleSwitcher />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={signOut}
                className="h-8 rounded-full border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
              >
                Log out
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-50 via-emerald-25 to-white border-emerald-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-emerald-700">
                Confirmed sessions
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">5</p>
              <p className="mt-1 text-xs text-emerald-700">
                +2 vs last month • 3 finance • 2 statistics
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-sky-700">
                Hours booked
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                12.5 h
              </p>
              <p className="mt-1 text-xs text-slate-500">
                6 h this week • 2 sessions today
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-fuchsia-700">
                Subjects
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">4</p>
              <p className="mt-1 text-xs text-slate-500">
                Finance, Strategy, Stats, Coding
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Attendance
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">92%</p>
              <p className="mt-1 text-xs text-slate-500">
                You&apos;re in the top 15% of active learners
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4">
          <Card className="bg-white border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-slate-900">
                Upcoming sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {upcomingSessions.map((session) => {
                  const { datePart, timePart } = formatDateTimeRange(
                    session.start,
                    session.end,
                  );
                  const isCancelled = session.status === "cancelled";
                  const isFuture = new Date(session.start) > new Date();

                  const statusLabel = isCancelled ? "Cancelled" : "Upcoming";
                  const statusClasses = isCancelled
                    ? "bg-slate-100 text-slate-500"
                    : "bg-emerald-50 text-emerald-700";

                  return (
                    <div
                      key={session.id}
                      className={`rounded-xl border p-4 ${
                        isCancelled
                          ? "border-slate-200 bg-slate-50/70 opacity-70"
                          : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500">
                            {datePart} • {timePart}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {session.subject}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Tutor: {session.tutorName}
                            {session.campus ? ` • ${session.campus}` : null}
                          </p>
                        </div>
                        {isFuture && !isCancelled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => openCancelDialog(session)}
                            aria-label={`Cancel session ${session.subject} on ${datePart} at ${timePart}`}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className={`rounded-full px-2 py-0.5 ${statusClasses}`}>
                          {statusLabel}
                        </span>
                        <span className="text-slate-500">
                          {session.language} • {session.level}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {upcomingSessions.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No upcoming sessions yet. Use &quot;Book a lesson&quot; to schedule
                    your first one.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4">
          <Card className="bg-white border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-slate-900">
                Recent sessions
              </CardTitle>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
              >
                View all history
                {/* TODO: Link to full session history page when available */}
              </button>
            </CardHeader>
            <CardContent>
              {recentCompletedSessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Once you complete tutoring sessions, they&apos;ll appear here so you
                  can quickly rate your tutors.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {recentCompletedSessions.map((session) => {
                    const { datePart, timePart } = formatDateTimeRange(
                      session.start,
                      session.end,
                    );
                    return (
                      <div
                        key={session.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs"
                      >
                        <div>
                          <p className="text-xs text-slate-500">
                            {datePart} • {timePart}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {session.subject}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Tutor: {session.tutorName}
                            {session.campus ? ` • ${session.campus}` : null}
                          </p>
                        </div>
                        <div className="mt-3 flex items-end justify-between text-[11px]">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-white">
                            Completed
                          </span>
                          <SessionRatingControls
                            sessionId={session.id}
                            rating={session.rating}
                            onRate={(value) => rateSession(session.id, value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <BookLessonDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        onBookingCreated={handleBookingCreated}
      />
      <CancelSessionDialog
        open={cancelDialogOpen}
        session={sessionPendingCancel}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  );
}
