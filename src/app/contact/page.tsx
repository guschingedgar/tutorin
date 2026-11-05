export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Contact us</h1>
      <p className="text-sm text-slate-600">
        For questions about ESSEC TutorHub, please contact the tutoring
        coordination team.
      </p>
      <p className="text-sm text-slate-700">
        Email:{" "}
        <a
          href="mailto:tutorhub@essec.edu"
          className="text-indigo-600 hover:underline"
        >
          tutorhub@essec.edu
        </a>
      </p>
    </main>
  );
}




