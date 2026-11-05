"use client";

import { useId, useState } from "react";
import { DemoDisclaimerModal } from "@/components/DemoDisclaimerModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ADMIN_WHITELIST,
  buildUserFromSignup,
  type SignUpFormData,
  type SignUpRoleChoice,
} from "@/types/user";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@essec\.edu$/;
const ADMIN_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(admin\.)?essec\.edu$/; // Allow both @essec.edu and @admin.essec.edu

const SUBJECT_OPTIONS = [
  "Corporate Finance",
  "Statistics",
  "Marketing Analytics",
  "Strategy",
  "Coding",
  "Supply Chain",
  "Econometrics",
  "Cost Accounting",
  "Other",
];

async function validateTranscript(file: File, subjects: string[]): Promise<boolean> {
  // TODO: Backend will parse PDF and check that each selected subject has grade >= 16/20.
  // For now we always return true to allow signup.
  console.info("Validating transcript (mock)", { fileName: file.name, subjects });
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
}

function validateEmail(email: string, roleChoice: SignUpRoleChoice): string | null {
  if (!email) return "Please enter your email address.";

  // Normalize email to lowercase for comparison
  const normalizedEmail = email.toLowerCase().trim();

  if (roleChoice === "admin") {
    // For admin, use whitelist approach (simpler and works with Supabase Auth)
    // Admins can use regular @essec.edu emails, controlled by whitelist
    const inWhitelist = ADMIN_WHITELIST.some(
      (whitelisted) => whitelisted.toLowerCase() === normalizedEmail
    );

    if (!inWhitelist) {
      return `This email is not authorized for admin access. Please use a whitelisted admin email or contact support.`;
    }
    
    // Also validate it's a valid ESSEC email format
    if (!STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
      return "Please use a valid ESSEC email address (@essec.edu).";
    }
    
    console.log("✅ Admin email validated (whitelist):", {
      email: normalizedEmail,
      inWhitelist: true,
    });
    
    return null;
  }

  // For student/tutor roles, require @essec.edu
  if (!STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
    return "Please use your ESSEC email address (@essec.edu).";
  }
  return null;
}

export function SignUpForm() {
  const formId = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleChoice, setRoleChoice] = useState<SignUpRoleChoice | null>(null);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const wantsStudentFields = roleChoice === "student" || roleChoice === "both";
  const wantsTutorFields = roleChoice === "tutor" || roleChoice === "both";
  const isAdminChoice = roleChoice === "admin";

  const toggleSubject = (
    list: string[],
    setter: (next: string[]) => void,
    subject: string,
  ) => {
    if (list.includes(subject)) {
      setter(list.filter((s) => s !== subject));
    } else {
      setter([...list, subject]);
    }
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setTranscriptFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setErrors("Transcript must be a PDF file.");
      setTranscriptFile(null);
      return;
    }
    setErrors(null);
    setTranscriptFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    if (!roleChoice) {
      setErrors("Please select a role to continue.");
      return;
    }

    // Normalize email before validation and use consistently throughout
    const normalizedEmail = email.toLowerCase().trim();
    
    // Update email state with normalized version for consistency
    if (email !== normalizedEmail) {
      setEmail(normalizedEmail);
    }
    
    const emailError = validateEmail(normalizedEmail, roleChoice);
    if (emailError) {
      setErrors(emailError);
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setErrors("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrors("Passwords do not match.");
      return;
    }

    if (wantsTutorFields && !transcriptFile) {
      setErrors("Please upload your transcript (PDF) to teach as a tutor.");
      return;
    }

    if (wantsTutorFields && transcriptFile) {
      const ok = await validateTranscript(transcriptFile, tutorSubjects);
      if (!ok) {
        setErrors(
          "We couldn't verify your grades for the subjects you selected. Please contact support.",
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Build roles array - ensure it's always populated
      const selectedRoles: ("STUDENT" | "TUTOR" | "ADMIN")[] = [];
      if (roleChoice === "admin") {
        selectedRoles.push("ADMIN");
      } else {
        if (roleChoice === "student" || roleChoice === "both") {
          selectedRoles.push("STUDENT");
        }
        if (roleChoice === "tutor" || roleChoice === "both") {
          selectedRoles.push("TUTOR");
        }
      }
      
      // Validate roles array is not empty
      if (selectedRoles.length === 0) {
        console.error("❌ No roles selected! roleChoice:", roleChoice);
        throw new Error("Please select a role to continue.");
      }
      
      console.log("🔍 Role choice:", roleChoice);
      console.log("🔍 Selected roles array:", selectedRoles);
      console.log("🔍 Normalized email:", normalizedEmail);

      // Step 1: Create auth user with Supabase Auth
      console.log("🔐 Creating auth user...", { email: normalizedEmail });
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (authError) {
        console.error("❌ Auth error:", authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        console.error("❌ No user returned from signUp");
        throw new Error("User creation failed - no user returned");
      }

      console.log("✅ Auth user created:", authData.user.id);
      console.log("🔍 Auth data:", { user: authData.user, session: authData.session });

      // Step 2: Upload transcript if tutor
      let transcriptUrl: string | null = null;
      if (wantsTutorFields && transcriptFile) {
        const fileName = `${Date.now()}-${transcriptFile.name}`;
        console.log("📤 Uploading transcript to Supabase Storage...", fileName);
        const { error: uploadError } = await supabase.storage
          .from("transcripts")
          .upload(fileName, transcriptFile);
        if (uploadError) {
          console.error("❌ Transcript upload error:", uploadError);
          throw new Error(`Failed to upload transcript: ${uploadError.message}`);
        }
        const { data: publicUrlData } = supabase.storage
          .from("transcripts")
          .getPublicUrl(fileName);
        transcriptUrl = publicUrlData.publicUrl;
        console.log("✅ Transcript uploaded:", transcriptUrl);
      }

      // Step 3: Create profile in signups table
      const studentSubjectsArray =
        wantsStudentFields && studentSubjects.length > 0
          ? studentSubjects
          : null;

      const tutorSubjectsArray =
        wantsTutorFields && tutorSubjects.length > 0 ? tutorSubjects : null;

      const profileData = {
        user_id: authData.user.id, // Link to auth user - CRITICAL: Must match auth.users.id
        email: normalizedEmail, // Use normalized email
        roles: selectedRoles,
        student_subjects: studentSubjectsArray,
        tutor_subjects: tutorSubjectsArray,
        transcript_url: transcriptUrl,
      };

      console.log("💾 Creating profile in signups table...");
      console.log("🔍 Profile data:", {
        user_id: profileData.user_id,
        email: profileData.email,
        roles: profileData.roles,
        user_id_type: typeof profileData.user_id,
        user_id_length: profileData.user_id?.length,
      });
      
      const { data: insertedProfile, error: profileError } = await supabase
        .from("signups")
        .insert([profileData])
        .select();

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
        console.error("❌ Error details:", {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
        });
        // Note: Cannot delete auth user from client side - would need server-side cleanup
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      if (!insertedProfile || insertedProfile.length === 0) {
        console.error("❌ No profile data returned from insert");
        throw new Error("Profile creation failed - no data returned");
      }

      console.log("✅ Profile created successfully:", insertedProfile);
      console.log("🔍 Created profile user_id:", insertedProfile[0]?.user_id);
      console.log("🔍 Auth user id:", authData.user.id);
      console.log("🔍 IDs match:", insertedProfile[0]?.user_id === authData.user.id);
      
      // Verify the user_id was stored correctly
      if (insertedProfile[0]?.user_id !== authData.user.id) {
        console.error("⚠️ WARNING: user_id mismatch!");
        console.error("  Expected:", authData.user.id);
        console.error("  Got:", insertedProfile[0]?.user_id);
      }
      // Step 4: User is automatically logged in after signUp
      // Wait a moment for session to be established, then redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Determine redirect target with comprehensive debug logging
      console.log("=== REDIRECT DEBUG ===");
      console.log("🔍 Roles array:", selectedRoles);
      console.log("🔍 Roles type:", typeof selectedRoles);
      console.log("🔍 Is array?", Array.isArray(selectedRoles));
      console.log("🔍 Includes TUTOR?", selectedRoles.includes("TUTOR"));
      console.log("🔍 Includes STUDENT?", selectedRoles.includes("STUDENT"));
      console.log("🔍 Includes ADMIN?", selectedRoles.includes("ADMIN"));
      console.log("🔍 Role choice:", roleChoice);

      let redirectPath = "/";
      
      // Check in priority order: ADMIN > STUDENT-only > TUTOR-only > Both > Default
      if (selectedRoles.includes("ADMIN")) {
        redirectPath = "/company";
        console.log("✅ Redirect decision: ADMIN → /company");
      } else if (selectedRoles.includes("STUDENT") && !selectedRoles.includes("TUTOR")) {
        redirectPath = "/student";
        console.log("✅ Redirect decision: STUDENT only → /student");
      } else if (selectedRoles.includes("TUTOR") && !selectedRoles.includes("STUDENT")) {
        redirectPath = "/tutor";
        console.log("✅ Redirect decision: TUTOR only → /tutor");
      } else if (selectedRoles.includes("STUDENT") && selectedRoles.includes("TUTOR")) {
        redirectPath = "/student"; // Default to student dashboard when both roles
        console.log("✅ Redirect decision: Both STUDENT + TUTOR → /student (default)");
      } else if (selectedRoles.includes("TUTOR")) {
        // Fallback: if TUTOR is present (even with other roles), try tutor dashboard
        redirectPath = "/tutor";
        console.log("✅ Redirect decision: TUTOR present (fallback) → /tutor");
      } else {
        console.warn("⚠️ No matching role found, defaulting to /student");
        redirectPath = "/student";
      }

      console.log("🚀 Final redirect path:", redirectPath);
      console.log("=== END REDIRECT DEBUG ===");
      
      // Store redirect path and show demo disclaimer modal instead of immediate redirect
      setPendingRedirect(redirectPath);
      setShowDisclaimer(true);
    } catch (error: any) {
      console.error("❌ Error during signup / Supabase save", error);
      const errorMessage =
        error?.message ||
        error?.error?.message ||
        "Failed to save signup. Please try again.";
      setErrors(errorMessage);
      alert(`Failed to save signup: ${errorMessage}\n\nCheck the browser console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="signup" className="scroll-mt-24">
      <Card className="mx-auto max-w-xl border-slate-100 bg-white/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-slate-900">
            Create your TutorIN account
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            Use your ESSEC email, choose your role, and we&apos;ll route you to the right
            workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form
            id={formId}
            className="space-y-4 text-xs"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor={`${formId}-email`}
                className="text-[11px] font-medium text-slate-700"
              >
                ESSEC email address
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="firstname.lastname@essec.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-password`}
                  className="text-[11px] font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id={`${formId}-password`}
                  type="password"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-confirmPassword`}
                  className="text-[11px] font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <input
                  id={`${formId}-confirmPassword`}
                  type="password"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-slate-700">Your role</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "student",
                      label: "Student",
                      description: "I want to book tutoring sessions",
                    },
                    {
                      value: "tutor",
                      label: "Tutor",
                      description: "I want to teach and earn",
                    },
                    {
                      value: "both",
                      label: "Student + Tutor",
                      description: "I want to book sessions and also teach",
                    },
                    {
                      value: "admin",
                      label: "Admin",
                      description: "I’m an administrator",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleChoice(option.value)}
                    className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left text-xs transition ${
                      roleChoice === option.value
                        ? "border-indigo-500 bg-indigo-50 text-slate-900"
                        : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"
                    }`}
                    aria-pressed={roleChoice === option.value}
                  >
                    <span className="text-[11px] font-semibold text-slate-900">
                      {option.label}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-600">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {wantsStudentFields && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-slate-700">
                  Which subjects do you need help with?
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUBJECT_OPTIONS.map((subject) => {
                    const checked = studentSubjects.includes(subject);
                    return (
                      <label
                        key={`student-${subject}`}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] ${
                          checked
                            ? "border-indigo-500 bg-indigo-50 text-slate-900"
                            : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={checked}
                          onChange={() =>
                            toggleSubject(studentSubjects, setStudentSubjects, subject)
                          }
                        />
                        <span>{subject}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {wantsTutorFields && (
              <div className="space-y-3 rounded-xl bg-slate-50/70 p-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-700">
                    Which subjects do you want to teach?
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SUBJECT_OPTIONS.map((subject) => {
                      const checked = tutorSubjects.includes(subject);
                      return (
                        <label
                          key={`tutor-${subject}`}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] ${
                            checked
                              ? "border-emerald-500 bg-emerald-50 text-slate-900"
                              : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            checked={checked}
                            onChange={() =>
                              toggleSubject(tutorSubjects, setTutorSubjects, subject)
                            }
                          />
                          <span>{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`${formId}-transcript`}
                    className="text-[11px] font-medium text-slate-700"
                  >
                    Upload your transcript (PDF)
                  </label>
                  <input
                    id={`${formId}-transcript`}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleTranscriptChange}
                    className="block w-full cursor-pointer text-[11px] text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">
                    We&apos;ll verify that you scored 16+ in the subjects you want to
                    teach.
                  </p>
                  {transcriptFile && (
                    <p className="text-[11px] text-slate-500">
                      Selected file:{" "}
                      <span className="font-medium text-slate-700">
                        {transcriptFile.name}
                      </span>{" "}
                      ({Math.round(transcriptFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
            )}

            {errors && (
              <p className="text-[11px] font-medium text-rose-600" role="alert">
                {errors}
              </p>
            )}

            <div className="pt-1">
              <Button
                type="submit"
                size="sm"
                className="h-8 w-full rounded-full bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>

      <DemoDisclaimerModal
      isOpen={showDisclaimer}
      onContinue={() => {
        if (pendingRedirect) {
          window.location.href = pendingRedirect;
        }
      }}
      />
    </>
  );
}


