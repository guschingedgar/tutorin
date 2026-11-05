# TutorIN

A peer-tutoring platform for ESSEC students: students book sessions with top-performing classmates, tutors manage their requests and earnings, and the school tracks the programme's impact.

https://github.com/user-attachments/assets/25d0703a-7325-4bd4-85ce-20d58869913a

<p align="center"><sub>4-minute demo: sign-up, student dashboard and booking, tutor control centre, programme impact dashboard</sub></p>

## Why I built it

This came out of a 3-day innovation challenge at ESSEC: design a service for ESSEC students and pitch it. Many students struggle in quantitative courses, while others who excel in them would happily earn money by teaching. TutorIN connects the two inside the school, with ESSEC email sign-up and school oversight.

Group project with Adem Ben Njima and Victor Henz, who built the app. **I led the business side: the problem and solution, the hypotheses we tested with students, the economics, and the pitch.**

## What it does

- **Students:** sign up with an ESSEC email, choose their subjects, book a session with a tutor, cancel it, and rate it afterwards.
- **Tutors:** accept or reject requests, see upcoming sessions, hours taught, earnings and average rating.
- **School admin:** a programme dashboard with sessions per week, grade progression, retention, top tutors and cost per student hour.
- **Role switching:** one account can be both a student and a tutor.

## How it works

A Next.js app with Supabase for authentication and data. Sign-up is restricted to `@essec.edu` addresses, and each role (student, tutor, admin) gets its own workspace.

Three decisions shaped the project:
- **Keep it inside the school.** ESSEC-only sign-up builds trust between students and lets the school see the impact on grades.
- **Students teach students.** Tutors are classmates who did well in the course, which keeps sessions affordable and relevant to the exact syllabus.
- **Show the school the impact.** The admin dashboard turns sessions and grades into the numbers a school needs to fund the programme.

**Stack:** Next.js, React, TypeScript, Supabase, Tailwind CSS, shadcn/ui, Recharts.

## Run it

```bash
npm install
cp .env.example .env.local   # Supabase URL and anon key
npm run dev
```

## Limitations

- **Status: demo prototype** built in 3 days. The dashboards use mock data, and booking flows are simulated.
- The admin whitelist is hard-coded and should move to the backend.
