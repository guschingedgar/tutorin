export type ProgramSummary = {
  completedSessions: number;
  totalStudentHours: number;
  tutorPayouts: number;
};

export type WeeklySessionsPoint = {
  week: string;
  sessions: number;
};

export type SubjectGradePoint = {
  month: string;
  subject: string;
  averageGrade: number;
};

export type GradeBand = {
  range: string;
  studentCount: number;
};

export type LevelEngagement = {
  level: string;
  sessions: number;
  students: number;
};

export type RetentionPoint = {
  month: string;
  retentionRate: number;
};

export type TutorPerformance = {
  tutorName: string;
  sessions: number;
  averageRating: number;
};

// Mock 30-day aggregate snapshot
export const summary: ProgramSummary = {
  completedSessions: 128,
  totalStudentHours: 3840,
  tutorPayouts: 12600,
};

// Realistic weekly volume data for last 8 weeks
export const weeklyVolume: WeeklySessionsPoint[] = [
  { week: "W1", sessions: 16 },
  { week: "W2", sessions: 19 },
  { week: "W3", sessions: 18 },
  { week: "W4", sessions: 23 },
  { week: "W5", sessions: 21 },
  { week: "W6", sessions: 25 },
  { week: "W7", sessions: 20 },
  { week: "W8", sessions: 22 },
];

// Student grade progression by subject over months
export const subjectGradePoints: SubjectGradePoint[] = [
  { month: "Sep", subject: "Finance", averageGrade: 68 },
  { month: "Oct", subject: "Finance", averageGrade: 71 },
  { month: "Nov", subject: "Finance", averageGrade: 74 },
  { month: "Dec", subject: "Finance", averageGrade: 76 },
  { month: "Jan", subject: "Finance", averageGrade: 79 },
  { month: "Feb", subject: "Finance", averageGrade: 81 },
  { month: "Mar", subject: "Finance", averageGrade: 83 },
  { month: "Sep", subject: "Statistics", averageGrade: 65 },
  { month: "Oct", subject: "Statistics", averageGrade: 68 },
  { month: "Nov", subject: "Statistics", averageGrade: 71 },
  { month: "Dec", subject: "Statistics", averageGrade: 73 },
  { month: "Jan", subject: "Statistics", averageGrade: 76 },
  { month: "Feb", subject: "Statistics", averageGrade: 78 },
  { month: "Mar", subject: "Statistics", averageGrade: 80 },
  { month: "Sep", subject: "Strategy", averageGrade: 72 },
  { month: "Oct", subject: "Strategy", averageGrade: 74 },
  { month: "Nov", subject: "Strategy", averageGrade: 76 },
  { month: "Dec", subject: "Strategy", averageGrade: 78 },
  { month: "Jan", subject: "Strategy", averageGrade: 80 },
  { month: "Feb", subject: "Strategy", averageGrade: 82 },
  { month: "Mar", subject: "Strategy", averageGrade: 84 },
  { month: "Sep", subject: "Marketing", averageGrade: 70 },
  { month: "Oct", subject: "Marketing", averageGrade: 72 },
  { month: "Nov", subject: "Marketing", averageGrade: 74 },
  { month: "Dec", subject: "Marketing", averageGrade: 75 },
  { month: "Jan", subject: "Marketing", averageGrade: 77 },
  { month: "Feb", subject: "Marketing", averageGrade: 79 },
  { month: "Mar", subject: "Marketing", averageGrade: 81 },
];

// Grade distribution snapshot
export const gradeBands: GradeBand[] = [
  { range: "90-100", studentCount: 45 },
  { range: "80-89", studentCount: 128 },
  { range: "70-79", studentCount: 195 },
  { range: "60-69", studentCount: 142 },
  { range: "0-59", studentCount: 60 },
];

// Engagement by program level
export const levelEngagement: LevelEngagement[] = [
  { level: "L3", sessions: 145, students: 89 },
  { level: "M1", sessions: 198, students: 156 },
  { level: "M2", sessions: 167, students: 134 },
  { level: "GE", sessions: 124, students: 98 },
];

// Monthly retention rate
export const retentionPoints: RetentionPoint[] = [
  { month: "Sep", retentionRate: 78 },
  { month: "Oct", retentionRate: 82 },
  { month: "Nov", retentionRate: 85 },
  { month: "Dec", retentionRate: 83 },
  { month: "Jan", retentionRate: 87 },
  { month: "Feb", retentionRate: 89 },
  { month: "Mar", retentionRate: 91 },
];

// Top tutors by sessions and rating
export const tutorPerformance: TutorPerformance[] = [
  { tutorName: "Marie L.", sessions: 42, averageRating: 4.9 },
  { tutorName: "Yann P.", sessions: 38, averageRating: 4.8 },
  { tutorName: "Sophie M.", sessions: 35, averageRating: 4.7 },
  { tutorName: "Thomas D.", sessions: 33, averageRating: 4.8 },
  { tutorName: "Emma R.", sessions: 31, averageRating: 4.6 },
];

// TODO: Back these mocks with real aggregates from the backend and
//       apply the same campus/date-range filters as the rest of the app.


