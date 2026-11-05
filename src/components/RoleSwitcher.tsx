"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";

export function RoleSwitcher() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Only show if user has both roles
  if (loading) return null;
  
  if (!profile?.roles) return null;
  
  const hasStudent = profile.roles.includes("STUDENT");
  const hasTutor = profile.roles.includes("TUTOR");
  
  if (!hasStudent || !hasTutor) {
    return null;
  }

  const isStudentView = pathname.startsWith("/student");
  const isTutorView = pathname.startsWith("/tutor");

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
      <span className="hidden sm:inline text-slate-500">Switch role:</span>
      <Button
        type="button"
        variant={isStudentView ? "default" : "outline"}
        size="sm"
        className="h-7 px-3 text-[11px]"
        onClick={() => router.push("/student")}
      >
        Student dashboard
      </Button>
      <Button
        type="button"
        variant={isTutorView ? "default" : "outline"}
        size="sm"
        className="h-7 px-3 text-[11px]"
        onClick={() => router.push("/tutor")}
      >
        Tutor control center
      </Button>
    </div>
  );
}


