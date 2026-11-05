"use server";

// Backend auth has been removed; these helpers are kept only to avoid import errors.
// All real auth now happens client-side via localStorage in the landing signup flow.

export type SessionUser = null;

export async function getCurrentUser(): Promise<SessionUser> {
  return null;
}

export async function requireUser() {
  throw new Error("UNAUTHENTICATED");
}

export async function setUserSession(_userId: string) {
  return;
}

export async function clearSession() {
  return;
}

