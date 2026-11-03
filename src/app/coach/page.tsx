"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Profile = {
  full_name: string;
  fitness_goal: string;
  experience_level: string;
  workout_days: number;
  available_equipment: string[];
};

export default function CoachPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [workoutDuration, setWorkoutDuration] = useState("");
  const [trainingPreference, setTrainingPreference] = useState("");
  const [trainingConsistency, setTrainingConsistency] = useState("");
  const [limitations, setLimitations] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, fitness_goal, experience_level, workout_days, available_equipment"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        router.push("/profile");
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const coachAnswers = {
      workoutDuration,
      trainingPreference,
      trainingConsistency,
      limitations,
    };

    sessionStorage.setItem(
      "fitness-genie-coach-answers",
      JSON.stringify(coachAnswers)
    );

    router.push("/coach/program");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        <p className="text-gray-400">Preparing your AI coach...</p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#090b0a] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-lime-400">
            FITNESS GENIE COACH
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Let&apos;s build your program.
          </h1>

          <p className="mt-3 leading-7 text-gray-400">
            I already know a little about you. I just need a few more answers
            before I create your personalized fitness program.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#121512] p-6">
          <p className="text-sm font-semibold text-gray-400">
            YOUR PROFILE
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Goal</p>
              <p className="mt-1 text-sm font-semibold">
                {profile.fitness_goal}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="mt-1 text-sm font-semibold">
                {profile.experience_level}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Days</p>
              <p className="mt-1 text-sm font-semibold">
                {profile.workout_days} days
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Equipment</p>
              <p className="mt-1 text-sm font-semibold">
                {profile.available_equipment.length > 0
                  ? `${profile.available_equipment.length} selected`
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#121512] p-6">
            <label className="text-lg font-bold">
              How long can you usually spend on each workout?
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Under 30 minutes",
                "30–45 minutes",
                "45–60 minutes",
                "60+ minutes",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWorkoutDuration(option)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    workoutDuration === option
                      ? "border-lime-400 bg-lime-400/10 text-lime-300"
                      : "border-white/10 bg-black/20 text-gray-300 hover:border-white/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121512] p-6">
            <label className="text-lg font-bold">
              What type of training do you prefer?
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Full body",
                "Upper / Lower",
                "Push / Pull / Legs",
                "Choose for me",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTrainingPreference(option)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    trainingPreference === option
                      ? "border-lime-400 bg-lime-400/10 text-lime-300"
                      : "border-white/10 bg-black/20 text-gray-300 hover:border-white/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121512] p-6">
            <label className="text-lg font-bold">
              How consistent are you with training?
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Just starting",
                "Occasionally",
                "Consistent",
                "Very consistent",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTrainingConsistency(option)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    trainingConsistency === option
                      ? "border-lime-400 bg-lime-400/10 text-lime-300"
                      : "border-white/10 bg-black/20 text-gray-300 hover:border-white/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#121512] p-6">
            <label
              htmlFor="limitations"
              className="text-lg font-bold"
            >
              Are there any exercises or movements you cannot or do not want
              to perform?
            </label>

            <textarea
              id="limitations"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="For example: I don't like running..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </div>

          <button
            type="submit"
            disabled={
              !workoutDuration ||
              !trainingPreference ||
              !trainingConsistency
            }
            className="w-full rounded-xl bg-lime-400 py-4 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create My Program →
          </button>
        </form>
      </div>
    </main>
  );
}