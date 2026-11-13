"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snack";
type DietaryPreference = "Vegetarian" | "Vegan" | "Dairy-free";
type FilterCategory = "All meals" | MealCategory;
type FilterPreference = "Any preference" | DietaryPreference;

type MealIdea = {
  name: string;
  category: MealCategory;
  description: string;
  ingredients: string[];
  preferences: DietaryPreference[];
  time: string;
};

const meals: MealIdea[] = [
  {
    name: "Berry overnight oats",
    category: "Breakfast",
    description:
      "A make-ahead bowl with oats, berries, and seeds for an easy start.",
    ingredients: ["Rolled oats", "Berries", "Chia seeds", "Milk of choice"],
    preferences: ["Vegetarian", "Vegan", "Dairy-free"],
    time: "5 min prep",
  },
  {
    name: "Egg and avocado toast",
    category: "Breakfast",
    description:
      "Whole-grain toast topped with avocado, egg, and a squeeze of lemon.",
    ingredients: ["Whole-grain bread", "Egg", "Avocado", "Lemon"],
    preferences: ["Vegetarian", "Dairy-free"],
    time: "10 min",
  },
  {
    name: "Chickpea grain bowl",
    category: "Lunch",
    description:
      "A flexible bowl of chickpeas, grains, and crisp vegetables with lemon dressing.",
    ingredients: ["Chickpeas", "Brown rice", "Cucumber", "Lemon"],
    preferences: ["Vegetarian", "Vegan", "Dairy-free"],
    time: "20 min",
  },
  {
    name: "Chicken and roasted vegetables",
    category: "Lunch",
    description:
      "Roasted chicken served with seasonal vegetables and a side of grains.",
    ingredients: ["Chicken", "Seasonal vegetables", "Quinoa", "Herbs"],
    preferences: ["Dairy-free"],
    time: "30 min",
  },
  {
    name: "Lentil tomato stew",
    category: "Dinner",
    description:
      "A warming lentil and tomato stew served with greens or crusty bread.",
    ingredients: ["Lentils", "Tomatoes", "Spinach", "Onion"],
    preferences: ["Vegetarian", "Vegan", "Dairy-free"],
    time: "35 min",
  },
  {
    name: "Salmon with sweet potato",
    category: "Dinner",
    description:
      "Oven-baked salmon with sweet potato and a simple green salad.",
    ingredients: ["Salmon", "Sweet potato", "Leafy greens", "Olive oil"],
    preferences: ["Dairy-free"],
    time: "30 min",
  },
  {
    name: "Apple and nut butter",
    category: "Snack",
    description:
      "Apple slices with nut butter for a quick, satisfying snack.",
    ingredients: ["Apple", "Nut butter"],
    preferences: ["Vegetarian", "Vegan", "Dairy-free"],
    time: "5 min",
  },
  {
    name: "Yogurt with fruit and seeds",
    category: "Snack",
    description:
      "A simple mix of yogurt, seasonal fruit, and crunchy seeds.",
    ingredients: ["Plain yogurt", "Seasonal fruit", "Pumpkin seeds"],
    preferences: ["Vegetarian"],
    time: "5 min",
  },
];

const categories: FilterCategory[] = [
  "All meals",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

const preferences: FilterPreference[] = [
  "Any preference",
  "Vegetarian",
  "Vegan",
  "Dairy-free",
];

export default function NutritionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState<FilterCategory>("All meals");
  const [preference, setPreference] =
    useState<FilterPreference>("Any preference");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, fitness_goal")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setLoadError("Unable to load your profile. Please try again.");
        setLoading(false);
        return;
      }

      if (!data) {
        router.replace("/profile");
        return;
      }

      setName(data.full_name?.trim().split(/\s+/)[0] || "");
      setGoal(data.fitness_goal || "");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const visibleMeals = useMemo(
    () =>
      meals.filter(
        (meal) =>
          (category === "All meals" || meal.category === category) &&
          (preference === "Any preference" ||
            meal.preferences.includes(preference))
      ),
    [category, preference]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />
          <p className="mt-4 text-sm text-gray-400">
            Loading your nutrition ideas...
          </p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] px-5 text-white">
        <div className="text-center">
          <p role="alert" className="text-red-300">{loadError}</p>
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
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#090b0a]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-black text-black">
              FG
            </span>
            <span className="text-lg font-bold tracking-tight">
              Fitness <span className="text-lime-400">Genie</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {name && (
              <span className="hidden text-sm text-gray-400 sm:inline">
                Hi, {name}
              </span>
            )}
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-lime-400/30 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-10">
        <section className="rounded-3xl border border-white/[0.08] bg-[#111411] p-6 sm:p-10">
          <p className="text-sm font-bold tracking-[0.16em] text-lime-400">
            EVERYDAY NUTRITION
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-3xl font-black sm:text-5xl">
                Meal ideas for real life.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-gray-400">
                Find practical ideas for your day, then filter by meal and
                dietary preference. Keep it flexible and choose what works for
                you.
              </p>
            </div>
            {goal && (
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-5 py-4 md:min-w-52">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Your fitness goal
                </p>
                <p className="mt-2 font-semibold text-lime-300">{goal}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="meal-ideas-heading">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="meal-ideas-heading" className="text-2xl font-bold">
                Explore meal ideas
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Simple inspiration you can adapt to your tastes and routine.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="text-sm text-gray-400">
                <span className="mb-2 block">Meal</span>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as FilterCategory)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111411] px-4 py-3 text-white outline-none focus:border-lime-400 sm:min-w-44"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-400">
                <span className="mb-2 block">Dietary preference</span>
                <select
                  value={preference}
                  onChange={(event) =>
                    setPreference(event.target.value as FilterPreference)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111411] px-4 py-3 text-white outline-none focus:border-lime-400 sm:min-w-48"
                >
                  {preferences.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {visibleMeals.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleMeals.map((meal) => (
                <article
                  key={meal.name}
                  className="rounded-3xl border border-white/[0.08] bg-[#111411] p-6 transition hover:border-lime-400/25"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                      {meal.category}
                    </span>
                    <span className="text-xs text-gray-500">{meal.time}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{meal.name}</h3>
                  <p className="mt-3 min-h-14 leading-6 text-gray-400">
                    {meal.description}
                  </p>
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      A few ingredients
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient) => (
                        <li
                          key={ingredient}
                          className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-gray-300"
                        >
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-white/[0.08] bg-[#111411] p-6 text-gray-400">
              No ideas match those filters yet. Try another meal or preference.
            </p>
          )}
        </section>

        <aside className="mt-10 rounded-2xl border border-lime-400/15 bg-lime-400/[0.04] p-5 sm:p-6">
          <h2 className="font-bold text-lime-200">A flexible approach</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-400">
            These are general meal ideas, not a medical or individualized
            nutrition plan. Adjust ingredients and portions to your needs. For
            allergies, medical conditions, or specialized nutrition advice,
            consult a qualified health professional.
          </p>
        </aside>
      </div>
    </main>
  );
}