export type SessionStatus = "upcoming" | "completed" | "cancelled";

export type SessionRatingValue = 1 | 2 | 3 | 4 | 5;

export type SessionRating = {
  value: SessionRatingValue;
  comment?: string;
  createdAt: string; // ISO datetime
  studentName?: string; // Optional: who rated (useful for tutor view)
};

export type StudentSession = {
  id: string;
  subject: string;
  tutorName: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  campus?: string;
  language?: string;
  level?: string; // L3, M1, etc.
  status: SessionStatus;
  rating?: SessionRating;
};

// TODO: Replace mock sessions with data fetched from backend:
// - fetchStudentSessions(studentId)
// - updateSessionStatus(sessionId, status)
// - rateSession(sessionId, value, comment)


