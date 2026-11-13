
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type UserProfile = {
  full_name: string | null;
  fitness_goal: string | null;
  experience_level: string | null;
  workout_days: number | null;
  available_equipment: string[] | null;
};

type WorkoutDay = {
  day: string;
  title: string;
  category: string;
  duration: string;
  exercises: string[];
  recovery: boolean;
  description: string;
};

type ExerciseCompletion = {
  session_date: string;
  exercise_index: number;
  exercise_name: string;
};

type DailyProgress = {
  session_date: string;
  session_title: string;
  total_exercises: number;
  completed_exercises: number;
  completion_percentage: number;
  status:
    | "in_progress"
    | "completed"
    | "partially_completed"
    | "uncompleted";
  finalized_at: string | null;
};

// Get the Monday of the current week.
function getMonday(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return monday;
}

// Format dates using the user's local calendar date.
function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Convert a weekday into its actual date this week.
function getSessionDate(day: string, monday: Date) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const index = days.indexOf(day);

  if (index === -1) return "";

  const date = new Date(monday);
  date.setDate(monday.getDate() + index);

  return formatLocalDate(date);
}

function calculateCompletionPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;

  return Math.round((completed / total) * 100);
}

function getDailyStatus(
  completed: number,
  total: number
): DailyProgress["status"] {
  if (total === 0 || completed === 0) {
    return "uncompleted";
  }

  if (completed === total) {
    return "completed";
  }

  return "partially_completed";
}

function generateWeeklyPlan(profile: UserProfile): WorkoutDay[] {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const goal = (profile.fitness_goal || "").toLowerCase();
  const experience = (profile.experience_level || "").toLowerCase();
  const equipment = profile.available_equipment || [];

  const requestedDays = Number(profile.workout_days) || 3;
  const trainingDays = Math.max(1, Math.min(7, requestedDays));

  const duration =
    experience.includes("beginner")
      ? "15–20 minutes"
      : experience.includes("advanced")
        ? "25–35 minutes"
        : "20–30 minutes";

  const hasGym = equipment.includes("Full gym");
  const hasDumbbells = equipment.includes("Dumbbells");
  const hasBands = equipment.includes("Resistance bands");
  const bodyweightOnly =
    equipment.includes("Bodyweight only") ||
    equipment.length === 0;

  const strengthExercises = bodyweightOnly && !hasGym && !hasDumbbells && !hasBands
    ? [
        "Chair squats",
        "Wall or incline push-ups",
        "Glute bridges",
        "Bird dogs",
      ]
    : hasBands
      ? [
          "Band squats",
          "Resistance band rows",
          "Wall or incline push-ups",
          "Glute bridges",
        ]
      : hasDumbbells
        ? [
            "Bodyweight squats",
            "Dumbbell rows",
            "Wall or incline push-ups",
            "Glute bridges",
          ]
        : [
            "Controlled squats",
            "Machine or bodyweight rows",
            "Chest press or incline push-ups",
            "Glute bridges",
          ];

  const goalSessions: Record<string, WorkoutDay[]> = {
    endurance: [
      {
        day: "",
        title: "Cardio endurance",
        category: "Cardio",
        duration,
        exercises: [
          "Comfortable-paced walking or cycling",
          "Steady aerobic activity",
          "Gentle cooldown",
        ],
        recovery: false,
        description: "Build aerobic fitness at a comfortable pace.",
      },
      {
        day: "",
        title: "Supporting strength",
        category: "Strength",
        duration,
        exercises: strengthExercises,
        recovery: false,
        description: "Support overall strength and movement.",
      },
      {
        day: "",
        title: "Easy cardio",
        category: "Cardio",
        duration,
        exercises: [
          "Easy cycling or walking",
          "Comfortable-paced movement",
          "Gentle stretching",
        ],
        recovery: false,
        description: "Practise steady movement without pushing too hard.",
      },
      {
        day: "",
        title: "Active recovery",
        category: "Recovery",
        duration: "10–20 minutes",
        exercises: [
          "Relaxed walking",
          "Gentle mobility",
          "Easy stretching",
        ],
        recovery: true,
        description: "Allow your body to recover.",
      },
    ],

    strength: [
      {
        day: "",
        title: "Full-body strength",
        category: "Strength",
        duration,
        exercises: strengthExercises,
        recovery: false,
        description: "Practise controlled foundational movements.",
      },
      {
        day: "",
        title: "Upper-body movement",
        category: "Strength",
        duration,
        exercises: [
          "Wall or incline push-ups",
          "Resistance band or dumbbell rows",
          "Arm circles",
          "Gentle shoulder mobility",
        ],
        recovery: false,
        description: "Develop balanced upper-body movement.",
      },
      {
        day: "",
        title: "Lower-body movement",
        category: "Strength",
        duration,
        exercises: [
          "Chair squats",
          "Glute bridges",
          "Supported reverse lunges",
          "Calf raises",
        ],
        recovery: false,
        description: "Practise lower-body control and coordination.",
      },
      {
        day: "",
        title: "Movement recovery",
        category: "Recovery",
        duration: "10–20 minutes",
        exercises: [
          "Easy walking",
          "Gentle stretching",
          "Relaxed mobility",
        ],
        recovery: true,
        description: "Give your muscles time to recover.",
      },
    ],

    muscle: [
      {
        day: "",
        title: "Full-body movement",
        category: "Strength",
        duration,
        exercises: strengthExercises,
        recovery: false,
        description: "Practise foundational strength movements.",
      },
      {
        day: "",
        title: "Upper-body movement",
        category: "Strength",
        duration,
        exercises: [
          "Incline push-ups",
          "Resistance band rows",
          "Arm circles",
          "Shoulder mobility",
        ],
        recovery: false,
        description: "Develop coordination and balanced movement.",
      },
      {
        day: "",
        title: "Lower-body movement",
        category: "Strength",
        duration,
        exercises: [
          "Chair squats",
          "Glute bridges",
          "Calf raises",
          "Supported lunges",
        ],
        recovery: false,
        description: "Practise comfortable lower-body movements.",
      },
      {
        day: "",
        title: "Active recovery",
        category: "Recovery",
        duration: "10–20 minutes",
        exercises: [
          "Comfortable walking",
          "Gentle stretching",
          "Mobility exercises",
        ],
        recovery: true,
        description: "Prioritise recovery between sessions.",
      },
    ],

    mobility: [
      {
        day: "",
        title: "Full-body mobility",
        category: "Mobility",
        duration,
        exercises: [
          "Gentle hip mobility",
          "Shoulder circles",
          "Cat-cow movement",
          "Comfortable stretching",
        ],
        recovery: false,
        description: "Explore comfortable ranges of movement.",
      },
      {
        day: "",
        title: "Balance and coordination",
        category: "Mobility",
        duration,
        exercises: [
          "Supported single-leg balance",
          "Heel-to-toe walking",
          "Bird dogs",
          "Gentle stretching",
        ],
        recovery: false,
        description: "Practise balance and body coordination.",
      },
      {
        day: "",
        title: "Light activity",
        category: "Recovery",
        duration: "10–20 minutes",
        exercises: [
          "Relaxed walking",
          "Gentle stretching",
          "Easy mobility",
        ],
        recovery: true,
        description: "Keep movement comfortable and relaxed.",
      },
    ],

    general: [
      {
        day: "",
        title: "Balanced full-body movement",
        category: "Strength",
        duration,
        exercises: strengthExercises,
        recovery: false,
        description: "Combine foundational strength and coordination.",
      },
      {
        day: "",
        title: "Cardio and endurance",
        category: "Cardio",
        duration,
        exercises: [
          "Comfortable-paced walking",
          "Easy cycling",
          "Gentle cooldown",
        ],
        recovery: false,
        description: "Support general cardiovascular fitness.",
      },
      {
        day: "",
        title: "Mobility and balance",
        category: "Mobility",
        duration,
        exercises: [
          "Gentle hip mobility",
          "Shoulder mobility",
          "Supported balance",
          "Comfortable stretching",
        ],
        recovery: false,
        description: "Improve movement and coordination.",
      },
      {
        day: "",
        title: "Active recovery",
        category: "Recovery",
        duration: "10–20 minutes",
        exercises: [
          "Easy walking",
          "Relaxed stretching",
          "Gentle mobility",
        ],
        recovery: true,
        description: "Allow your body to recover.",
      },
    ],
  };

  const selectedGoal = goal.includes("endurance")
    ? "endurance"
    : goal.includes("strength")
      ? "strength"
      : goal.includes("muscle")
        ? "muscle"
        : goal.includes("mobility") || goal.includes("flexibility")
          ? "mobility"
          : "general";

  const templates = goalSessions[selectedGoal];
  const demandingSessions = trainingDays >= 6 ? 4 : trainingDays;
  const recoverySessions = trainingDays - demandingSessions;

  const recoveryTemplate: WorkoutDay = {
    day: "",
    title: "Active recovery",
    category: "Recovery",
    duration: "10–20 minutes",
    exercises: [
      "Relaxed walking",
      "Gentle stretching",
      "Comfortable mobility",
    ],
    recovery: true,
    description: "A lighter day to support recovery.",
  };

  const selectedSessions: WorkoutDay[] = [];

  for (let i = 0; i < demandingSessions; i++) {
    const template = templates[i % templates.length];
    selectedSessions.push({
      ...template,
      exercises: [...template.exercises],
    });
  }

  for (let i = 0; i < recoverySessions; i++) {
    selectedSessions.push({ ...recoveryTemplate });
  }

  const dayPatterns: Record<number, number[]> = {
    1: [2],
    2: [0, 4],
    3: [0, 2, 5],
    4: [0, 2, 4, 6],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };

  const selectedDays = dayPatterns[trainingDays];

  const weeklyPlan: WorkoutDay[] = selectedDays.map((dayIndex, index) => ({
    ...selectedSessions[index],
    day: days[dayIndex],
  }));

  return weeklyPlan;
}

export default function WorkoutPlannerPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [weekOffset, setWeekOffset] = useState(0);

  const [userId, setUserId] = useState("");

  const [exerciseCompletions, setExerciseCompletions] =
    useState<ExerciseCompletion[]>([]);

  const [dailyProgress, setDailyProgress] =
    useState<DailyProgress[]>([]);

  const [savingExercises, setSavingExercises] =
    useState<string[]>([]);

  const weeklyPlan = profile
    ? generateWeeklyPlan(profile)
    : [];

  const monday = getMonday(new Date());

  monday.setDate(monday.getDate() + weekOffset * 7);

  const weekStart = formatLocalDate(monday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekEnd = formatLocalDate(sunday);

  const today = formatLocalDate(new Date());

  // Count sessions with at least one completed exercise.
  const completedCount = weeklyPlan.filter((day) => {
    const sessionDate = getSessionDate(day.day, monday);

    if (!sessionDate || sessionDate > today) return false;

    const progress = dailyProgress.find(
      (item) => item.session_date === sessionDate
    );

    return (progress?.completed_exercises ?? 0) > 0;
  }).length;

  const progressPercentage =
    weeklyPlan.length > 0
      ? Math.round((completedCount / weeklyPlan.length) * 100)
      : 0;

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, fitness_goal, experience_level, workout_days, available_equipment"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Unable to load your fitness profile.");
        setLoading(false);
        return;
      }

      if (!data) {
        router.replace("/profile");
        return;
      }

      setProfile(data as UserProfile);

      // Load individual exercise completions for this week.
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("workout_exercise_completions")
        .select("session_date, exercise_index, exercise_name")
        .eq("user_id", user.id)
        .gte("session_date", weekStart)
        .lte("session_date", weekEnd);

      if (exerciseError) {
        console.error("Exercise progress loading error:", exerciseError);

        setError(
          `Unable to load exercise progress: ${exerciseError.message}`
        );

        setLoading(false);
        return;
      }

      setExerciseCompletions(
        (exerciseData || []) as ExerciseCompletion[]
      );

      // Load daily progress summaries for this week.
      const { data: progressData, error: progressError } = await supabase
        .from("workout_daily_progress")
        .select(
          "session_date, session_title, total_exercises, completed_exercises, completion_percentage, status, finalized_at"
        )
        .eq("user_id", user.id)
        .gte("session_date", weekStart)
        .lte("session_date", weekEnd);

      if (progressError) {
        setError("Unable to load your daily workout progress.");
        setLoading(false);
        return;
      }

      const loadedExerciseData =
        (exerciseData || []) as ExerciseCompletion[];

      const loadedPlan = generateWeeklyPlan(data as UserProfile);
      const finalizedProgress = new Map(
        ((progressData || []) as DailyProgress[]).map((item) => [
          item.session_date,
          item,
        ])
      );
      const today = formatLocalDate(new Date());
      const weekMonday = new Date(`${weekStart}T00:00:00`);

      // Finalize scheduled workouts whose dates have passed.
      for (const day of loadedPlan) {
        const sessionDate = getSessionDate(day.day, weekMonday);

        if (!sessionDate || sessionDate >= today) {
          continue;
        }

        const completed = loadedExerciseData.filter(
          (item) => item.session_date === sessionDate
        ).length;

        const total = day.exercises.length;
        const percentage = calculateCompletionPercentage(completed, total);
        const status = getDailyStatus(completed, total);
        const finalizedAt = new Date().toISOString();

        const { error: finalizationError } = await supabase
          .from("workout_daily_progress")
          .upsert(
            {
              user_id: user.id,
              session_date: sessionDate,
              session_title: day.title,
              total_exercises: total,
              completed_exercises: completed,
              completion_percentage: percentage,
              status,
              finalized_at: finalizedAt,
              updated_at: finalizedAt,
            },
            {
              onConflict: "user_id,session_date",
            }
          );

        if (finalizationError) {
          console.error("Daily finalization error:", finalizationError);
          continue;
        }

        finalizedProgress.set(sessionDate, {
          session_date: sessionDate,
          session_title: day.title,
          total_exercises: total,
          completed_exercises: completed,
          completion_percentage: percentage,
          status,
          finalized_at: finalizedAt,
        });

        const completionQuery = status === "completed"
          ? await supabase
              .from("workout_completions")
              .upsert(
                {
                  user_id: user.id,
                  session_date: sessionDate,
                  session_title: day.title,
                },
                { onConflict: "user_id,session_date" }
              )
          : await supabase
              .from("workout_completions")
              .delete()
              .eq("user_id", user.id)
              .eq("session_date", sessionDate);

        if (completionQuery.error) {
          console.error(
            "Workout completion finalization error:",
            completionQuery.error
          );
          continue;
        }

      }

      setDailyProgress(Array.from(finalizedProgress.values()));
      setLoading(false);
    }

    loadProfile();
  }, [router, weekStart, weekEnd]);

  async function toggleExercise(
    day: WorkoutDay,
    exerciseIndex: number
  ) {
    const supabase = createClient();
    const sessionDate = getSessionDate(day.day, monday);
    const exercise = day.exercises[exerciseIndex];
    const exerciseKey = `${sessionDate}-${exerciseIndex}`;

    const today = formatLocalDate(new Date());

    // Only allow exercise tracking on the current day.
    if (
      !userId ||
      !sessionDate ||
      sessionDate !== today ||
      !exercise ||
      savingExercises.includes(exerciseKey)
    ) {
      return;
    }

    const alreadyCompleted = exerciseCompletions.some(
      (item) =>
        item.session_date === sessionDate &&
        item.exercise_index === exerciseIndex
    );

    setSavingExercises((previous) => [...previous, exerciseKey]);

    try {
      if (alreadyCompleted) {
        const { error } = await supabase
          .from("workout_exercise_completions")
          .delete()
          .eq("user_id", userId)
          .eq("session_date", sessionDate)
          .eq("exercise_index", exerciseIndex);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workout_exercise_completions")
          .insert({
            user_id: userId,
            session_date: sessionDate,
            exercise_index: exerciseIndex,
            exercise_name: exercise,
          });

        if (error) throw error;
      }

      // Build the updated exercise completion list.
      const updatedCompletions = alreadyCompleted
        ? exerciseCompletions.filter(
            (item) =>
              !(
                item.session_date === sessionDate &&
                item.exercise_index === exerciseIndex
              )
          )
        : [
            ...exerciseCompletions,
            {
              session_date: sessionDate,
              exercise_index: exerciseIndex,
              exercise_name: exercise,
            },
          ];

      const completedCount = updatedCompletions.filter(
        (item) => item.session_date === sessionDate
      ).length;

      const totalExercises = day.exercises.length;

      const percentage = calculateCompletionPercentage(
        completedCount,
        totalExercises
      );

      const status: DailyProgress["status"] =
        completedCount === totalExercises
          ? "completed"
          : "in_progress";

      // Save the updated daily progress.
      const { error: progressError } = await supabase
        .from("workout_daily_progress")
        .upsert(
          {
            user_id: userId,
            session_date: sessionDate,
            session_title: day.title,
            total_exercises: totalExercises,
            completed_exercises: completedCount,
            completion_percentage: percentage,
            status,
            finalized_at: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,session_date",
          }
        );

      if (progressError) throw progressError;

      setExerciseCompletions(updatedCompletions);

      const updatedProgress: DailyProgress = {
        session_date: sessionDate,
        session_title: day.title,
        total_exercises: totalExercises,
        completed_exercises: completedCount,
        completion_percentage: percentage,
        status,
        finalized_at: null,
      };

      setDailyProgress((previous) => [
        ...previous.filter(
          (item) => item.session_date !== sessionDate
        ),
        updatedProgress,
      ]);

      // Keep the existing weekly progress feature working.
      if (completedCount === totalExercises) {
        const { error: completionError } = await supabase
          .from("workout_completions")
          .upsert(
            {
              user_id: userId,
              session_date: sessionDate,
              session_title: day.title,
            },
            {
              onConflict: "user_id,session_date",
            }
          );

        if (completionError) throw completionError;

      } else {
        const { error: completionError } = await supabase
          .from("workout_completions")
          .delete()
          .eq("user_id", userId)
          .eq("session_date", sessionDate);

        if (completionError) throw completionError;

      }
    } catch (err) {
      console.error("Exercise tracking error:", err);
      alert("Unable to save your exercise progress. Please try again.");
    } finally {
      setSavingExercises((previous) =>
        previous.filter((item) => item !== exerciseKey)
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        Loading your workout planner...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] p-5 text-white">
        <div className="text-center">
          <p className="text-red-300">
            {error || "Your profile could not be loaded."}
          </p>
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
    <main className="min-h-screen bg-[#090b0a] px-5 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/dashboard"
          className="text-sm font-semibold text-lime-400 hover:text-lime-300"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-8">
          <p className="text-xs font-bold tracking-[0.2em] text-lime-400">
            FITNESS GENIE
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Weekly Workout Planner
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-400">
            Organise your training week around your fitness preferences,
            experience and available equipment.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#121512] p-6 sm:p-8">
          <h2 className="text-xl font-bold">
            Your training profile
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            This information will be used to organise your weekly schedule.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-sm text-gray-400">Fitness goal</p>
              <h3 className="mt-2 font-bold text-lime-400">
                {profile.fitness_goal || "Not set"}
              </h3>
            </div>

            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-sm text-gray-400">Experience</p>
              <h3 className="mt-2 font-bold text-lime-400">
                {profile.experience_level || "Not set"}
              </h3>
            </div>

            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-sm text-gray-400">Training days</p>
              <h3 className="mt-2 font-bold text-lime-400">
                {profile.workout_days ?? "Not set"}
                {profile.workout_days ? " days/week" : ""}
              </h3>
            </div>

            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-sm text-gray-400">Equipment</p>
              <h3 className="mt-2 font-bold text-lime-400">
                {profile.available_equipment?.length
                  ? `${profile.available_equipment.length} selected`
                  : "Not set"}
              </h3>
            </div>

          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-300">
              Available equipment
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.available_equipment?.length ? (
                profile.available_equipment.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-sm text-lime-300"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  No equipment selected.
                </span>
              )}
            </div>
          </div>

          <Link
            href="/profile"
            className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:border-lime-400/40 hover:text-lime-300"
          >
            Edit fitness profile →
          </Link>
        </section>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-lime-400">
                YOUR TRAINING ROUTINE
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your weekly schedule
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                A balanced schedule based on your fitness profile.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {weeklyPlan.length} scheduled days
            </span>
          </div>

          {/* WEEK NAVIGATION */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-[#121512] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Weekly workout calendar
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {monday.toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" – "}
                  {sunday.toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset((previous) => previous - 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                  className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  This week
                </button>

                <button
                  type="button"
                  onClick={() => setWeekOffset((previous) => previous + 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* SEVEN-DAY CALENDAR */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
           {[
             "Monday",
             "Tuesday",
             "Wednesday",
             "Thursday",
             "Friday",
             "Saturday",
             "Sunday",
           ].map((dayName) => {
             const workout = weeklyPlan.find(
               (day) => day.day === dayName
             );

             const sessionDate = getSessionDate(dayName, monday);
             const completedExercises = exerciseCompletions.filter(
               (item) => item.session_date === sessionDate
             ).length;

             const isCompleted =
               !!workout &&
               sessionDate <= today &&
               completedExercises === workout.exercises.length &&
               workout.exercises.length > 0;

             return (
               <div
                 key={dayName}
                 className={`rounded-xl border p-4 ${
                   isCompleted
                     ? "border-lime-400/40 bg-lime-400/10"
                     : "border-white/10 bg-[#121512]"
                 }`}
               >
                 <p className="text-xs font-semibold text-gray-400">
                   {dayName}
                 </p>

                 <p className="mt-2 text-2xl font-black text-white">
                   {new Date(`${sessionDate}T00:00:00`).getDate()}
                 </p>

                 {workout ? (
                   <>
                     <p className="mt-2 text-sm font-semibold text-white">
                       {workout.title}
                     </p>

                     <p className="mt-2 text-xs text-gray-400">
                       {workout.duration}
                     </p>

                     <p className={`mt-3 text-xs font-bold ${
                       isCompleted ? "text-lime-400" : "text-gray-400"
                     }`}>
                       {isCompleted ? "✓ Completed" : "○ Scheduled"}
                     </p>
                   </>
                 ) : (
                   <p className="mt-3 text-sm text-gray-500">
                     Rest day
                   </p>
                 )}
               </div>
             );
           })}
          </div>

          {/* Weekly progress tracking */}
          <div className="mb-6 rounded-2xl border border-lime-400/20 bg-[#121512] p-6">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <p className="text-sm text-gray-400">
                  Your weekly progress
                </p>

                <h3 className="mt-2 text-3xl font-black text-lime-400">
                  {completedCount}/{weeklyPlan.length}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Workouts completed this week
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black">
                  {progressPercentage}%
                </p>

                <p className="text-xs text-gray-500">
                  Weekly completion
                </p>
              </div>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-lime-400 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />

            </div>

            <p className="mt-3 text-xs text-gray-500">
              {completedCount === weeklyPlan.length
                ? "You've completed all your scheduled sessions this week!"
                : `${weeklyPlan.length - completedCount} sessions remaining this week.`}
            </p>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {weeklyPlan.map((day) => (
              <article
                key={day.day}
                className="rounded-2xl border border-white/10 bg-[#121512] p-6 transition hover:border-lime-400/30"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold">{day.day}</p>

                  <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                    {day.category}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {day.title}
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  {day.duration}
                </p>

                <div className="mt-5">
                  <p className="mb-3 text-xs font-bold tracking-wider text-gray-500">
                    ACTIVITIES
                  </p>

                  <ul className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => {
                      const sessionDate = getSessionDate(day.day, monday);
                      const exerciseKey = `${sessionDate}-${exerciseIndex}`;
                      const isCompleted = exerciseCompletions.some(
                        (item) =>
                          item.session_date === sessionDate &&
                          item.exercise_index === exerciseIndex
                      );
                      const isSaving = savingExercises.includes(exerciseKey);
                      const isToday =
                        sessionDate === formatLocalDate(new Date());

                      return (
                      <li
                        key={`${exerciseIndex}-${exercise}`}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          disabled={!isToday || isSaving}
                          onChange={() => toggleExercise(day, exerciseIndex)}
                          aria-label={`Mark ${exercise} as ${
                            isCompleted ? "incomplete" : "complete"
                          }`}
                          className="h-4 w-4 accent-lime-400 disabled:cursor-not-allowed"
                        />
                        <span className={isCompleted ? "text-lime-300" : ""}>
                          {exercise}
                        </span>
                      </li>
                      );
                    })}
                  </ul>
                </div>

                {(() => {
                  const sessionDate = getSessionDate(day.day, monday);
                  const today = formatLocalDate(new Date());

                  const completed = exerciseCompletions.filter(
                    (item) => item.session_date === sessionDate
                  ).length;

                  const total = day.exercises.length;

                  const percentage = calculateCompletionPercentage(
                    completed,
                    total
                  );

                  const savedProgress = dailyProgress.find(
                    (item) => item.session_date === sessionDate
                  );

                  const isPast = sessionDate < today;
                  const isFuture = sessionDate > today;

                  const displayedPercentage =
                    isPast && savedProgress
                      ? savedProgress.completion_percentage
                      : percentage;

                  const displayedStatus =
                    completed === total && total > 0
                      ? "Completed"
                      : isPast
                        ? savedProgress?.status === "partially_completed"
                          ? "Partially completed"
                          : "Uncompleted"
                        : isFuture
                          ? "Scheduled"
                          : completed > 0
                            ? "In progress"
                            : "Not started";

                  return (
                    <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Daily progress
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {completed}/{total} exercises completed
                          </p>
                        </div>

                        <span className="text-xl font-black text-lime-400">
                          {displayedPercentage}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-lime-400 transition-all duration-300"
                          style={{ width: `${displayedPercentage}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs font-semibold text-gray-400">
                        Status: {displayedStatus}
                      </p>
                    </div>
                  );
                })()}

                {day.recovery && (
                  <p className="mt-5 rounded-xl bg-white/[0.04] p-3 text-xs text-gray-400">
                    Recovery is part of a balanced training routine.
                  </p>
                )}

              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#121512] p-6">
            <h2 className="text-xl font-bold text-white">
              Workout completion history
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Your completed workouts this week.
            </p>

            {weeklyPlan.filter(
              (day) => getSessionDate(day.day, monday) <= today
            ).length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                No workout activity to display yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {weeklyPlan
                  .filter(
                    (day) => getSessionDate(day.day, monday) <= today
                  )
                  .map((day) => {
                    const sessionDate = getSessionDate(day.day, monday);

                    const progress = dailyProgress.find(
                      (item) => item.session_date === sessionDate
                    );

                    const completed = progress?.completed_exercises ?? 0;
                    const total =
                      progress?.total_exercises ?? day.exercises.length;

                    const percentage =
                      progress?.completion_percentage ??
                      calculateCompletionPercentage(completed, total);

                    const status =
                      progress?.status === "completed"
                        ? "Completed"
                        : progress?.status === "partially_completed"
                          ? "Partially completed"
                          : progress?.status === "in_progress"
                            ? "In progress"
                            : sessionDate === today
                              ? "Not started"
                              : "Uncompleted";

                    return (
                      <div
                        key={day.day}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {day.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            {day.day} · {sessionDate}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {completed}/{total} exercises
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-lime-400">
                            {percentage}% Completed
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
