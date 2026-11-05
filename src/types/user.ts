export type UserRole = "student" | "tutor" | "admin";

export type User = {
  id: string;
  email: string;
  roles: UserRole[]; // e.g. ["student", "tutor"] or ["admin"]
  studentSubjects?: string[];
  tutorSubjects?: string[];
};

export type SignUpRoleChoice = "student" | "tutor" | "both" | "admin";

export type SignUpFormData = {
  email: string;
  roleChoice: SignUpRoleChoice;
  studentSubjects: string[];
  tutorSubjects: string[];
};

export const ADMIN_WHITELIST: string[] = [
  "admin@essec.edu",
  "director@essec.edu",
  "admin.demo@essec.edu", // Use regular @essec.edu (Supabase Auth doesn't accept @admin.essec.edu)
  "admin.test@essec.edu", // Add test admin email
  // TODO: manage admin whitelist on backend instead of hard-coding.
];

export function canAccessStudentDashboard(user: User): boolean {
  return user.roles.includes("student") && !user.roles.includes("admin");
}

export function canAccessTutorDashboard(user: User): boolean {
  return user.roles.includes("tutor") && !user.roles.includes("admin");
}

export function canAccessAdminDashboard(user: User): boolean {
  return user.roles.includes("admin");
}

export function canSwitchRoles(user: User): boolean {
  return user.roles.includes("student") && user.roles.includes("tutor");
}

export function buildUserFromSignup(data: SignUpFormData): User {
  let roles: UserRole[] = [];
  if (data.roleChoice === "admin") {
    roles = ["admin"];
  } else if (data.roleChoice === "student") {
    roles = ["student"];
  } else if (data.roleChoice === "tutor") {
    roles = ["tutor"];
  } else if (data.roleChoice === "both") {
    roles = ["student", "tutor"];
  }

  return {
    id: `mock-${Date.now()}`,
    email: data.email,
    roles,
    studentSubjects: data.studentSubjects.length ? data.studentSubjects : undefined,
    tutorSubjects: data.tutorSubjects.length ? data.tutorSubjects : undefined,
  };
}


