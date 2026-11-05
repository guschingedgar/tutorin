export function FeaturesSection() {
  const columns = [
    {
      title: "For students",
      items: [
        "Book sessions with qualified tutors",
        "Choose your subject and time slot",
        "Track your progress and rate your tutors",
      ],
    },
    {
      title: "For tutors",
      items: [
        "Share your expertise and earn",
        "Manage your schedule flexibly",
        "Build your tutoring reputation",
      ],
    },
    {
      title: "For admins",
      items: [
        "Monitor program impact",
        "Track grades, engagement, and retention",
        "Manage tutors and payouts",
      ],
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Who TutorIN is for
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          A single platform for students, peer tutors, and program administrators.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div
            key={col.title}
            className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {col.title}
            </p>
            <ul className="mt-1 space-y-1 text-slate-700">
              {col.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}


