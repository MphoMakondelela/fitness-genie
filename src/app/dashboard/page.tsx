
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function DashboardPage() {
  const [name, setName] = useState("there");
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setLoadError("Unable to load your profile. Please refresh the page.");
        setLoading(false);
        return;
      }

      if (!profile) {
        window.location.replace("/profile");
        return;
      }

      const fullName = profile.full_name;

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

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-xl bg-lime-400 px-6 py-3.5 font-bold text-black transition hover:-translate-y-0.5 hover:bg-lime-300"
              >
                Set up your profile →
              </Link>

            </div>
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
              Your personal statistics will appear here.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Fitness goal</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ◎
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold">Not set yet</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Choose what you want to work towards.
              </p>
              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Choose a goal →
              </Link>
            </article>

            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Workout plan</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ↗
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold">Ready when you are</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your training plan can be created around your schedule.
              </p>
              <Link
                href="/profile"
                className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Get started →
              </Link>
            </article>

            <article className="rounded-2xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25 sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Progress tracking</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-xl">
                  ↗
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold">Your story starts here</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your completed workouts and progress will be shown here once
                tracking is implemented.
              </p>
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
            <article className="group rounded-3xl border border-lime-400/20 bg-[#111411] p-7 transition hover:border-lime-400/40 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ✳
              </div>
              <h3 className="mt-5 text-2xl font-bold">Your AI fitness coach</h3>
              <p className="mt-3 max-w-lg leading-7 text-gray-400">
                Get guidance on training, healthy habits, recovery and
                nutrition. Your personalized AI chat experience is a feature
                we&apos;ll build next.
              </p>
              <span className="mt-6 inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-400">
                Coming soon
              </span>
            </article>

            <article className="group rounded-3xl border border-white/[0.08] bg-[#111411] p-7 transition hover:border-lime-400/30 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◈
              </div>
              <h3 className="mt-5 text-2xl font-bold">Personal fitness profile</h3>
              <p className="mt-3 max-w-lg leading-7 text-gray-400">
                Set your goals, experience level, available equipment and
                preferences so we can shape Fitness Genie around you.
              </p>
              <Link
                href="/profile"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-3 font-semibold transition group-hover:bg-lime-400 group-hover:text-black"
              >
                Set up your profile <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article className="rounded-3xl border border-white/[0.08] bg-[#111411] p-7 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◉
              </div>
              <h3 className="mt-5 text-xl font-bold">Workout planning</h3>
              <p className="mt-3 leading-7 text-gray-400">
                Build a routine that reflects your fitness level, schedule and
                available equipment.
              </p>
            </article>

            <article className="rounded-3xl border border-white/[0.08] bg-[#111411] p-7 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl">
                ◌
              </div>
              <h3 className="mt-5 text-xl font-bold">Nutrition planning</h3>
              <p className="mt-3 leading-7 text-gray-400">
                Explore meal ideas that work with your food preferences and
                everyday routine.
              </p>
            </article>
          </div>
        </section>

        {/* Closing banner */}
        <section className="mt-10 rounded-3xl border border-lime-400/15 bg-lime-400/[0.04] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-lime-400">
              MAKE IT PERSONAL
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Start with your fitness goals.
            </h2>
            <p className="mt-2 max-w-xl leading-7 text-gray-400">
              A little information will help us build an experience around
              your needs.
            </p>
          </div>
          <Link
            href="/profile"
            className="mt-6 inline-flex shrink-0 rounded-xl bg-lime-400 px-6 py-3.5 font-bold text-black transition hover:bg-lime-300 sm:mt-0"
          >
            Get started →
          </Link>
        </section>

        <footer className="mt-12 border-t border-white/[0.08] py-6 text-sm text-gray-500 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fitness Genie</p>
          <p className="mt-2 sm:mt-0">Your goals. Your pace.</p>
        </footer>
      </div>
    </main>
  );
}
