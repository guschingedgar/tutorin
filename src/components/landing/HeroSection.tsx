"use client";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  const handleClick = () => {
    const el = document.getElementById("signup");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-violet-100 to-fuchsia-100 px-6 py-12 shadow-xl">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-white/60 px-3 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
          For ESSEC students and tutors
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          TutorIN – Peer tutoring for ESSEC students
        </h1>
        <p className="max-w-2xl text-balance text-sm text-slate-700 md:text-base">
          Book sessions with top-performing students, get help in the subjects you need,
          and track your progress — all in one place.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            className="h-11 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            onClick={handleClick}
          >
            Get started
          </Button>
          <span className="text-[11px] text-slate-500">
            ESSEC email required • 2 minutes to sign up
          </span>
        </div>
      </div>
    </section>
  );
}


