export function HowItWorksSection() {
  const steps = [
    {
      title: "Sign up with your ESSEC email",
      description: "Use your @essec.edu email address to create a secure account.",
    },
    {
      title: "Choose your role",
      description:
        "Join as a student, tutor, or both. Admins get a dedicated program view.",
    },
    {
      title: "Start booking or teaching",
      description:
        "Students book sessions, tutors create slots, and admins track the impact.",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          How TutorIN works
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          A simple 3-step flow to get help or start tutoring.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col gap-2 rounded-2xl bg-slate-50/80 p-4 text-xs"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
              {index + 1}
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
            <p className="text-xs text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


