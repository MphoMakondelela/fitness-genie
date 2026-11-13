
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type UserProfile = {
  full_name: string | null;
  fitness_goal: string | null;
  experience_level: string | null;
  workout_days: number | string | null;
  available_equipment: string[] | null;
};

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not set yet";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardPage() {
  const [name, setName] = useState("there");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          full_name,
          fitness_goal,
          experience_level,
          workout_days,
          available_equipment
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setLoadError("Unable to load your profile. Please refresh the page.");
        setLoading(false);
        return;
      }

      if (!profileData) {
        window.location.replace("/profile");
        return;
      }

      const userProfile = profileData as UserProfile;

      setProfile(userProfile);

      const fullName = userProfile.full_name;

      if (fullName?.trim()) {
        setName(fullName.trim().split(/\s+/)[0]);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Unable to log out. Please try again.");
      return;
    }

    window.location.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />
          <p className="mt-4 text-sm text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] px-5 text-white">
        <div className="text-center">
          <p className="text-red-300">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090b0a] text-white">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#090b0a]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-black tracking-tight text-black">
              FG
            </span>
            <span className="text-lg font-bold tracking-tight">
              Fitness <span className="text-lime-400">Genie</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-gray-500">Your fitness space</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-400/20 bg-lime-400/10 font-bold text-lime-300">
              {name.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-400/40 hover:text-red-300 sm:px-4"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-10 lg:py-12">
        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#111411] p-7 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-400/[0.08] blur-[90px]" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-3 py-2 text-xs font-semibold tracking-wider text-lime-300">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              YOUR PERSONAL FITNESS SPACE
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Welcome back,
              <span className="block text-lime-400">{name}.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
              Every journey starts somewhere. Build your routine, stay
              consistent and make progress at your own pace.
            </p>

           
          </div>
        </section>

        {/* Overview */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-lime-400">
                YOUR OVERVIEW
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Your fitness at a glance
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              Your personal fitness information.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Fitness Goal */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Fitness goal</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ◎
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {formatLabel(profile?.fitness_goal)}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your current fitness objective.
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Edit goal →
              </Link>
            </article>

            {/* Experience Level */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Experience level</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ✳
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {formatLabel(profile?.experience_level)}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your selected training experience.
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Update level →
              </Link>
            </article>

            {/* Training Schedule */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Training schedule</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ◷
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {profile?.workout_days
                  ? `${profile.workout_days} days`
                  : "Not set yet"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your planned training days per week.
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Edit schedule →
              </Link>
            </article>

            {/* Available Equipment */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Available equipment</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ◈
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {profile?.available_equipment?.length
                  ? `${profile.available_equipment.length} selected`
                  : "Not set yet"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {profile?.available_equipment?.length
                  ? profile.available_equipment.join(", ")
                  : "Your available training equipment."}
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Edit equipment →
              </Link>
            </article>
          </div>
        </section>

        {/* Main feature cards */}
        <section className="mt-12">
          <p className="text-xs font-bold tracking-[0.2em] text-lime-400">
            YOUR FITNESS TOOLS
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Everything starts with a plan.
          </h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Link
              href="/coach"
              className="group block rounded-3xl border border-lime-400/20 bg-[#111411] p-7 transition hover:border-lime-400/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400 sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ✳
              </div>
              <h3 className="mt-5 text-2xl font-bold">Your AI fitness coach</h3>
              <p className="mt-3 max-w-lg leading-7 text-gray-400">
                Chat with your AI fitness coach for personalized guidance
                on training, healthy habits, recovery and nutrition.
              </p>
              <span className="mt-6 inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-400 transition group-hover:border-lime-400/30 group-hover:text-lime-300">
                Open your coach →
              </span>
            </Link>

            <Link
              href="/profile"
              className="group block rounded-3xl border border-white/[0.08] bg-[#111411] p-7 transition hover:border-lime-400/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400 sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◈
              </div>
              <h3 className="mt-5 text-xl font-bold">
                Personal fitness profile
              </h3>
              <p className="mt-3 max-w-lg leading-7 text-gray-400">
                Set your goals, experience level, available equipment and
                preferences so we can shape Fitness Genie around you.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-lime-400">
                Edit profile →
              </span>
            </Link>

            <Link
              href="/workout-planner"
              className="group block rounded-3xl border border-white/[0.08] bg-[#111411] p-7 transition hover:border-lime-400/30 sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◉
              </div>
              <h3 className="mt-5 text-xl font-bold">Workout planning</h3>
              <p className="mt-3 leading-7 text-gray-400">
                Build a routine that reflects your fitness level, schedule and
                available equipment.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-lime-400">
                Open workout planner →
              </span>
            </Link>

            <Link
              href="/nutrition"
              className="group block rounded-3xl border border-white/[0.08] bg-[#111411] p-7 transition hover:border-lime-400/30 sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◌
              </div>
              <h3 className="mt-5 text-xl font-bold">
                Nutrition planning
              </h3>
              <p className="mt-3 leading-7 text-gray-400">
                Explore meal ideas that work with your food preferences and
                everyday routine.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-lime-400">
                Explore nutrition planning →
              </span>
            </Link>
          </div>
        </section>

        {/* Closing banner */}
        

        <footer className="mt-12 border-t border-white/[0.08] py-6 text-sm text-gray-500 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fitness Genie</p>
          <p className="mt-2 sm:mt-0">Your goals. Your pace.</p>
        </footer>
      </div>
    </main>
  );
}
