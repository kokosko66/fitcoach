"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ─── Step configs per role ────────────────────────────────────────────────────

const coachSteps = [
  { id: "welcome", title: "Welcome to FitCoach" },
  { id: "profile", title: "Set up your profile" },
  { id: "how-programs", title: "How programs work" },
  { id: "how-clients", title: "Working with clients" },
  { id: "ready", title: "You're all set" },
];

const clientSteps = [
  { id: "welcome", title: "Welcome to FitCoach" },
  { id: "profile", title: "Set up your profile" },
  { id: "how-workouts", title: "How workouts work" },
  { id: "ready", title: "You're all set" },
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function OnboardingWizard({ user, profile }) {
  const isCoach = profile?.role === "coach";
  const steps = isCoach ? coachSteps : clientSteps;

  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLast = currentStep === steps.length - 1;

  function next() {
    if (isLast) return;
    setCurrentStep((s) => s + 1);
  }

  function prev() {
    if (currentStep === 0) return;
    setCurrentStep((s) => s - 1);
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
    }
    setUploading(false);
  }

  async function handleFinish() {
    setFinishing(true);

    // Save profile name if changed
    await supabase
      .from("profiles")
      .update({ full_name: fullName, onboarded: true })
      .eq("id", user.id);

    router.push(isCoach ? "/dashboard" : "/workout");
    router.refresh();
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const inputClasses =
    "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500 transition-all dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

  // ─── Render steps ────────────────────────────────────────────────────────────

  function renderStepContent() {
    // ── Welcome ──
    if (step.id === "welcome") {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white dark:text-black text-3xl font-black">F</span>
          </div>
          <h2 className="text-3xl font-black dark:text-white mb-3">
            Welcome{fullName ? `, ${fullName.split(" ")[0]}` : ""}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-md mx-auto">
            {isCoach
              ? "Let's get you set up so you can start delivering programs to your clients."
              : "Let's get you set up so you can start tracking your workouts."}
          </p>
        </div>
      );
    }

    // ── Profile setup ──
    if (step.id === "profile") {
      return (
        <div>
          <h2 className="text-2xl font-extrabold dark:text-white mb-2">
            Set up your profile
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
            {isCoach
              ? "This is how your clients will see you."
              : "This is how your coach will see you."}
          </p>

          {/* Avatar upload */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-900 dark:bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-black text-xl font-bold">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white disabled:opacity-50"
              >
                {uploading ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                Optional. JPG or PNG, max 2MB.
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              Your name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              className={inputClasses}
            />
          </div>
        </div>
      );
    }

    // ── Coach: how programs work ──
    if (step.id === "how-programs") {
      return (
        <div>
          <h2 className="text-2xl font-extrabold dark:text-white mb-2">
            Creating programs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Programs are the core of FitCoach. Here&apos;s how they work:
          </p>

          <div className="space-y-4">
            <OnboardingCard
              number="1"
              title="Structure your program"
              description="Each program has workout days (e.g. Push, Pull, Legs). Each day has exercises with sets, reps, and rest times."
            />
            <OnboardingCard
              number="2"
              title="Assign to clients"
              description="Once a program is ready, assign it to one or more clients. They'll see it instantly on their device."
            />
            <OnboardingCard
              number="3"
              title="Reuse across clients"
              description="Created a great program? Assign it to multiple clients. Update once, everyone gets the changes."
            />
          </div>
        </div>
      );
    }

    // ── Coach: how clients work ──
    if (step.id === "how-clients") {
      return (
        <div>
          <h2 className="text-2xl font-extrabold dark:text-white mb-2">
            Working with clients
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Everything you need to manage your coaching relationships:
          </p>

          <div className="space-y-4">
            <OnboardingCard
              number="1"
              title="Invite clients"
              description="Have your clients sign up on FitCoach as a 'Client', then connect them to your account from the Clients page."
            />
            <OnboardingCard
              number="2"
              title="Track their progress"
              description="When clients log their workouts, you'll see every set, rep, and weight on your dashboard in real time."
            />
            <OnboardingCard
              number="3"
              title="Stay organized"
              description="View each client's history, active programs, and recent activity from one clean dashboard."
            />
          </div>
        </div>
      );
    }

    // ── Client: how workouts work ──
    if (step.id === "how-workouts") {
      return (
        <div>
          <h2 className="text-2xl font-extrabold dark:text-white mb-2">
            Your workouts
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Here&apos;s how training with FitCoach works:
          </p>

          <div className="space-y-4">
            <OnboardingCard
              number="1"
              title="Your coach assigns a program"
              description="Once your coach creates and assigns a program to you, it shows up automatically on your workout page."
            />
            <OnboardingCard
              number="2"
              title="Open a workout day"
              description="Pick the day you're training. You'll see every exercise with target sets and reps laid out clearly."
            />
            <OnboardingCard
              number="3"
              title="Log your performance"
              description="Enter the reps and weight for each set as you go. Hit 'Finish workout' when you're done — your coach sees it instantly."
            />
          </div>
        </div>
      );
    }

    // ── Ready ──
    if (step.id === "ready") {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-black dark:text-white mb-3">
            You&apos;re all set!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-md mx-auto">
            {isCoach
              ? "Head to your dashboard to create your first program and start coaching."
              : "Head to your workouts to see if your coach has assigned you a program."}
          </p>
        </div>
      );
    }

    return null;
  }

  // ─── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-extrabold text-xs">
                F
              </span>
            </div>
            <span className="text-base font-extrabold tracking-tight dark:text-white">
              FitCoach
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">{renderStepContent()}</div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLast && (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="px-5 py-2.5 text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                {finishing
                  ? "Loading..."
                  : isCoach
                  ? "Go to dashboard"
                  : "Go to my workouts"}
              </button>
            ) : (
              <button
                onClick={next}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable card for feature explanations ──────────────────────────────────

function OnboardingCard({ number, title, description }) {
  return (
    <div className="flex gap-4 items-start bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white dark:text-black text-xs font-extrabold">
          {number}
        </span>
      </div>
      <div>
        <h3 className="font-bold text-sm dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
