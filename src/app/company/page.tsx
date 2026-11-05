"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  summary,
  weeklyVolume,
  subjectGradePoints,
  gradeBands,
  levelEngagement,
  retentionPoints,
  tutorPerformance,
  type SubjectGradePoint,
} from "./companyDashboardMock";
import { useAuth } from "@/lib/useAuth";
import { canAccessAdminDashboard } from "@/types/user";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// TODO: Replace constants with values from backend aggregates:
// - fetchProgramSummary({ window: "30d" })
// - fetchWeeklySessions({ window: "30d" })
// - compute fillRate, cancellationRate, onlineVsCampus from real data filtered by campus/date

const FILL_RATE = 0.82;
const CANCELLATION_RATE = 0.075;
const ONLINE_HOURS_SHARE = 0.56;

function buildGradeProgressionData(points: SubjectGradePoint[]) {
  const byMonth = new Map<string, Record<string, number>>();
  for (const point of points) {
    const existing = byMonth.get(point.month) ?? {};
    existing[point.subject] = point.averageGrade;
    byMonth.set(point.month, existing);
  }
  return Array.from(byMonth.entries()).map(([month, subjects]) => ({
    month,
    ...subjects,
  }));
}

const gradeProgressionData = buildGradeProgressionData(subjectGradePoints);

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    } else if (user && profile) {
      // Check if user has admin role
      const hasAdminRole = profile.roles?.includes("ADMIN");
      if (!hasAdminRole) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-fuchsia-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
        <header className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Program impact overview
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              High-level view of ESSEC TutorHub activity and cost structure
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="rounded-full bg-fuchsia-50 px-3 py-1 text-fuchsia-700 font-medium">
              Snapshot: last 30 days
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 font-medium">
              All campuses
            </div>
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
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-25 to-white p-4 border border-emerald-100">
            <p className="text-xs uppercase tracking-wide text-emerald-700">
              Completed sessions
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">128</p>
            <p className="mt-1 text-xs text-emerald-700">
              72 Cergy • 34 La Défense • 22 online only
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-sky-700">
              Total student hours
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">3,840 h</p>
            <p className="mt-1 text-xs text-slate-500">
              Avg. group size 7.2 • 535 unique students
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-amber-700">
              Tutor payouts
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              12,600 €
            </p>
            <p className="mt-1 text-xs text-slate-500">
              10 €/hour • 1,260 validated tutor hours
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-slate-100">
            <p className="text-xs uppercase tracking-wide text-fuchsia-700">
              Cost per student hour
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {/* tutorPayouts / totalStudentHours = 12600 / 3840 ≈ 3.3 */}
              3.3 € / h
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tutor payouts divided by total student hours
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr]">
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-900">
                  Sessions & volume by week
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Rolling 8-week trend • all subjects
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 h-40 rounded-2xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar
                      dataKey="sessions"
                      radius={[8, 8, 0, 0]}
                      fill="url(#companySessions)"
                    />
                    <defs>
                      <linearGradient id="companySessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-3 text-[11px] md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-600">Fill rate</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-600">
                    {(FILL_RATE * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-slate-500">
                    Avg. occupancy vs min 5 students threshold.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-600">Cancellation rate</p>
                  <p className="mt-1 text-lg font-semibold text-amber-600">
                    {(CANCELLATION_RATE * 100).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-slate-500">
                    Mostly auto-cancelled for not reaching 5 students.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-600">Online vs campus</p>
                  <p className="mt-1 text-lg font-semibold text-sky-600">
                    {(ONLINE_HOURS_SHARE * 100).toFixed(0)}% /{" "}
                    {((1 - ONLINE_HOURS_SHARE) * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-slate-500">
                    Online sessions slightly more popular for M1/M2.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Student grade progression
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Average grades by subject over the academic year
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis domain={[60, 90]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Finance"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Statistics"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Strategy"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Marketing"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Grade distribution
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Number of students in each grade band
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeBands}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar
                      dataKey="studentCount"
                      radius={[8, 8, 0, 0]}
                      fill="url(#gradeDistributionGradient)"
                    />
                    <defs>
                      <linearGradient
                        id="gradeDistributionGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Engagement by program level
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Sessions and unique students per level
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelEngagement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="level" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="sessions"
                      name="Sessions"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Retention rate
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Percentage of students returning month over month
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis domain={[70, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="retentionRate"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-1">
          <Card className="bg-white border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">
                Top performing tutors
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Sessions conducted and average rating (top 5)
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tutorPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis
                      dataKey="tutorName"
                      type="category"
                      stroke="#6b7280"
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="sessions"
                      name="Sessions"
                      fill="#3b82f6"
                      radius={[0, 8, 8, 0]}
                    />
                    <Bar
                      dataKey="averageRating"
                      name="Avg rating"
                      fill="#f59e0b"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


