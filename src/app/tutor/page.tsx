"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RejectSessionDialog } from "@/components/tutor/RejectSessionDialog";
import type { SessionRating, SessionRatingValue } from "@/components/student/types";
import { useAuth } from "@/lib/useAuth";
import { canAccessTutorDashboard } from "@/types/user";
import { useRouter } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export type TutorSessionStatus = "confirmed" | "pending" | "rejected" | "completed";

export type TutorSession = {
  id: string;
  subject: string;
  studentName: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  campus?: "Cergy" | "La Défense" | "Online";
  level?: string;
  language?: string;
  status: TutorSessionStatus;
  payoutAmount: number; // €
  rating?: SessionRating; // present if at least one student rating exists
};

// ----------------------------
// Helpers & mock data
// ----------------------------

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

// TODO: Replace with real API:
// - fetchTutorSessions(tutorId)
// - acceptTutorSession(id)
// - rejectTutorSession(id, reason)
// - notifyStudentAboutDecision(...)

const initialSessions: TutorSession[] = [
  {
    id: "tutor-session-1",
    subject: "Corporate Finance – case study clinic",
    studentName: "Group session (8 students)",
    campus: "Cergy",
    level: "L3",
    language: "FR",
    status: "confirmed",
    payoutAmount: 40,
    ...createIso(0, 18, 20),
  },
  {
    id: "tutor-session-2",
    subject: "Advanced Statistics – exam rehearsal",
    studentName: "Paul D.",
    campus: "Online",
    level: "M1",
    language: "EN",
    status: "pending",
    payoutAmount: 25,
    ...createIso(1, 14, 16),
  },
  {
    id: "tutor-session-3",
    subject: "Strategy – case interview prep",
    studentName: "Louise M.",
    campus: "La Défense",
    level: "M1",
    language: "EN",
    status: "confirmed",
    payoutAmount: 30,
    ...createIso(3, 9, 11),
  },
  {
    id: "tutor-session-4",
    subject: "Corporate Finance – recap",
    studentName: "Group session (6 students)",
    campus: "Cergy",
    level: "L3",
    language: "FR",
    status: "completed",
    payoutAmount: 35,
    ...createIso(-2, 18, 20),
    rating: {
      value: 5,
      studentName: "Group session (6 students)",
      comment: "Great recap before the midterm, very clear examples.",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "tutor-session-5",
    subject: "Coding basics – Python for finance",
    studentName: "Sarah K.",
    campus: "Online",
    level: "L3",
    language: "EN",
    status: "completed",
    payoutAmount: 25,
    ...createIso(-5, 17, 19),
    rating: {
      value: 4,
      studentName: "Sarah K.",
      comment: "Would love a slower pace on the coding parts, but super useful.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

function getSessionDurationHours(session: TutorSession) {
  const start = new Date(session.start).getTime();
  const end = new Date(session.end).getTime();
  return (end - start) / (1000 * 60 * 60);
}

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

function getTotalEarnings(sessions: TutorSession[]): number {
  // Counts confirmed + completed sessions for now.
  return sessions
    .filter((s) => s.status === "confirmed" || s.status === "completed")
    .reduce((sum, s) => sum + s.payoutAmount, 0);
}

function getAverageRating(sessions: TutorSession[]): number {
  const rated = sessions.filter((s) => s.rating);
  if (!rated.length) return 0;
  const sum = rated.reduce(
    (acc, s) => acc + (s.rating ? s.rating.value : 0),
    0,
  );
  return sum / rated.length;
}

async function fakeApiAcceptSession(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { id, success: true };
}

async function fakeApiRejectSession(id: string, reason?: string) {
  console.info("Rejecting session (fake API)", { id, reason });
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id, success: true };
}

// ----------------------------
// Hook for tutor sessions
// ----------------------------

function useTutorSessions() {
  const [sessions, setSessions] = useState<TutorSession[]>(initialSessions);

  const now = new Date();

  const pendingSessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.status === "pending" && new Date(s.start).getTime() >= now.getTime(),
      ),
    [sessions, now],
  );

  const upcomingConfirmedSessions = useMemo(
    () =>
      sessions
        .filter(
          (s) =>
            s.status === "confirmed" && new Date(s.start).getTime() >= now.getTime(),
        )
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        ),
    [sessions, now],
  );

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions],
  );

  const ratedCompletedSessions = useMemo(
    () => completedSessions.filter((s) => s.rating),
    [completedSessions],
  );

  const recentRatedSessions = useMemo(
    () =>
      ratedCompletedSessions
        .slice()
        .sort((a, b) => {
          const aTime = a.rating?.createdAt
            ? new Date(a.rating.createdAt).getTime()
            : new Date(a.end).getTime();
          const bTime = b.rating?.createdAt
            ? new Date(b.rating.createdAt).getTime()
            : new Date(b.end).getTime();
          return bTime - aTime;
        })
        .slice(0, 4),
    [ratedCompletedSessions],
  );

  const totalEarnings = useMemo(() => getTotalEarnings(sessions), [sessions]);

  const averageRating = useMemo(
    () => getAverageRating(ratedCompletedSessions),
    [ratedCompletedSessions],
  );

  const activeSessionsCount = upcomingConfirmedSessions.length;

  const studentsThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const names = new Set<string>();
    sessions.forEach((s) => {
      const d = new Date(s.start);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        names.add(s.studentName);
      }
    });
    return names.size;
  }, [sessions]);

  const hoursTaught = useMemo(
    () =>
      completedSessions.reduce(
        (sum, s) => sum + getSessionDurationHours(s),
        0,
      ),
    [completedSessions],
  );

  const acceptSession = async (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "confirmed" } : s)),
    );

    try {
      await fakeApiAcceptSession(id);
    } catch (error) {
      console.error("Failed to accept session (fake API)", error);
      // In real app, revert state from backup and show toast.
    }
  };

  const rejectSession = async (id: string, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)),
    );

    try {
      await fakeApiRejectSession(id, reason);
    } catch (error) {
      console.error("Failed to reject session (fake API)", error);
      // In real app, revert state from backup and show toast.
    }
  };

  return {
    sessions,
    pendingSessions,
    upcomingConfirmedSessions,
    completedSessions,
    ratedCompletedSessions,
    recentRatedSessions,
    totalEarnings,
    averageRating,
    activeSessionsCount,
    studentsThisMonth,
    hoursTaught,
    acceptSession,
    rejectSession,
  };
}

// ----------------------------
// Presentational components
// ----------------------------

type SessionCardProps = {
  session: TutorSession;
  mode: "upcoming" | "pending";
  onAccept?: (id: string) => void;
  onReject?: (session: TutorSession) => void;
};

function TutorSessionCard({ session, mode, onAccept, onReject }: SessionCardProps) {
  const { datePart, timePart } = formatDateTimeRange(session.start, session.end);

  const statusLabel =
    session.status === "confirmed"
      ? "Confirmed"
      : session.status === "pending"
        ? "Pending"
        : session.status === "completed"
          ? "Completed"
          : "Rejected";

  const statusClasses =
    session.status === "confirmed"
      ? "bg-emerald-50 text-emerald-700"
      : session.status === "pending"
        ? "bg-amber-50 text-amber-700"
        : session.status === "completed"
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-500";

  const campusLabel =
    session.campus === "Online"
      ? "Online"
      : session.campus
        ? `On campus ${session.campus}`
        : "Format to be confirmed";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">{session.subject}</p>
        <p className="mt-1 text-[11px] text-slate-500">
          {datePart} • {timePart}
          {" • "}
          {campusLabel}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Student: <span className="font-medium">{session.studentName}</span>
          {session.level ? ` • ${session.level}` : ""}{" "}
          {session.language ? `• ${session.language}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] ${statusClasses}`}>
          {statusLabel}
        </span>
        {mode === "pending" && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 px-3 text-[11px]"
              onClick={() => onAccept?.(session.id)}
            >
              Accept
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => onReject?.(session)}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------
// Page component
// ----------------------------

export default function TutorDashboard() {
  // Always call hooks in a fixed order - ALL hooks must be at the top, before any conditional returns.
  const {
    pendingSessions,
    upcomingConfirmedSessions,
    ratedCompletedSessions,
    recentRatedSessions,
    totalEarnings,
    averageRating,
    activeSessionsCount,
    studentsThisMonth,
    hoursTaught,
    acceptSession,
    rejectSession,
  } = useTutorSessions();
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [sessionToReject, setSessionToReject] = useState<TutorSession | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    } else if (user && profile) {
      // Check if user has tutor role
      const hasTutorRole = profile.roles?.includes("TUTOR");
      if (!hasTutorRole) {
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

  if (!user || !profile) {
    return null;
  }

  const handleOpenReject = (session: TutorSession) => {
    setSessionToReject(session);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (sessionId: string, reason?: string) => {
    await rejectSession(sessionId, reason);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-fuchsia-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
        <header className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tutor control center</h1>
            <p className="mt-1 text-xs text-slate-400">
              Review your upcoming sessions, accept new requests, and track your earnings.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              {upcomingConfirmedSessions.length > 0
                ? `Next session: ${
                    formatDateTimeRange(
                      upcomingConfirmedSessions[0].start,
                      upcomingConfirmedSessions[0].end,
                    ).datePart
                  }`
                : "No upcoming sessions"}
            </div>
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

        <section className="grid gap-4 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-sky-50 via-sky-25 to-white border-sky-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-sky-600">
                Active upcoming sessions
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {activeSessionsCount}
              </p>
              <p className="mt-1 text-xs text-sky-700">
                {pendingSessions.length} pending requests waiting for your answer
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-emerald-600">
                Students this month
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {studentsThisMonth}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Unique students with at least one session
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-fuchsia-600">
                Hours taught (completed)
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {hoursTaught.toFixed(1)} h
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Based on sessions marked as completed
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-amber-600">
                Total earnings
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {totalEarnings.toFixed(0)} €
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Confirmed + completed sessions • subject to admin validation
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="pt-0">
              <p className="text-xs uppercase tracking-wide text-indigo-600">
                Average rating
              </p>
              {ratedCompletedSessions.length === 0 ? (
                <>
                  <p className="mt-3 text-3xl font-semibold text-slate-400">—</p>
                  <p className="mt-1 text-xs text-slate-500">
                    No ratings yet from your students
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {averageRating.toFixed(1)}{" "}
                    <span className="text-base font-normal text-slate-500">/ 5</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Based on {ratedCompletedSessions.length} rated session
                    {ratedCompletedSessions.length > 1 ? "s" : ""}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Pending requests from students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  You currently have no pending requests. New student requests will appear
                  here for you to accept or reject.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {pendingSessions.map((session) => (
                    <TutorSessionCard
                      key={session.id}
                      session={session}
                      mode="pending"
                      onAccept={acceptSession}
                      onReject={handleOpenReject}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Upcoming confirmed sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingConfirmedSessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No confirmed upcoming sessions yet. When you accept a request, it will
                  appear here.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {upcomingConfirmedSessions.map((session) => (
                    <TutorSessionCard
                      key={session.id}
                      session={session}
                      mode="upcoming"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Recent feedback from students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentRatedSessions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  You&apos;ll see student feedback here once your completed sessions
                  receive ratings.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {recentRatedSessions.map((session) => {
                    const { datePart, timePart } = formatDateTimeRange(
                      session.start,
                      session.end,
                    );
                    const ratingValue: SessionRatingValue =
                      session.rating!.value; // Non-null: recentRatedSessions only contains sessions with ratings
                    const ratedOn = session.rating?.createdAt
                      ? new Date(session.rating.createdAt).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )
                      : null;

                    return (
                      <div
                        key={session.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {session.subject}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Student:{" "}
                            <span className="font-medium">
                              {session.rating?.studentName ?? session.studentName}
                            </span>{" "}
                            · {datePart} • {timePart}
                            {session.campus ? ` · ${session.campus}` : ""}
                          </p>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                              {ratingValue.toFixed(1)} / 5
                            </span>
                            {ratedOn && (
                              <span className="text-slate-500">
                                Rated on {ratedOn}
                              </span>
                            )}
                          </div>
                          {session.rating?.comment && (
                            <p className="max-w-xs truncate text-[11px] text-slate-600">
                              “{session.rating.comment}”
                            </p>
                          )}
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

      <RejectSessionDialog
        open={rejectDialogOpen}
        session={sessionToReject}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}

