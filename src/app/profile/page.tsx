
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-400";

const equipmentOptions = [
  "Full gym",
  "Dumbbells",
  "Resistance bands",
  "Barbell",
  "Bodyweight only",
];

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("Build strength");
  const [experience, setExperience] = useState("Beginner");
  const [days, setDays] = useState("3");
  const [equipment, setEquipment] = useState<string[]>([
    "Bodyweight only",
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setName(user.user_metadata?.full_name ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setName(profile.full_name ?? user.user_metadata?.full_name ?? "");
        setAge(String(profile.age ?? ""));
        setHeight(String(profile.height_cm ?? ""));
        setWeight(String(profile.weight_kg ?? ""));
        setGoal(profile.fitness_goal ?? "Build strength");
        setExperience(profile.experience_level ?? "Beginner");
        setDays(String(profile.workout_days ?? 3));
        setEquipment(profile.available_equipment ?? []);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function toggleEquipment(item: string) {
    setEquipment((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: name.trim(),
          age: Number(age),
          height_cm: Number(height),
          weight_kg: Number(weight),
          fitness_goal: goal,
          experience_level: experience,
          workout_days: Number(days),
          available_equipment: equipment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      router.replace("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090b0a] px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-bold text-lime-400">FITNESS GENIE</p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#121512] p-6 sm:p-10">
          <p className="text-sm font-semibold text-lime-400">
            STEP 1 · YOUR FITNESS JOURNEY
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Let&apos;s personalise your plan.
          </h1>

          <p className="mt-3 leading-6 text-gray-400">
            Tell us a little about yourself so we can tailor your fitness
            experience to your goals and preferences.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm">
                Full name
              </label>
              <input
                id="name"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="age" className="mb-2 block text-sm">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="13"
                  max="100"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 24"
                />
              </div>

              <div>
                <label htmlFor="days" className="mb-2 block text-sm">
                  Workout days per week
                </label>
                <select
                  id="days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className={inputClass}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="height" className="mb-2 block text-sm">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  min="1"
                  max="300"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 175"
                />
              </div>

              <div>
                <label htmlFor="weight" className="mb-2 block text-sm">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 75"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="mb-2 block text-sm">
                Main fitness goal
              </label>
              <select
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={inputClass}
              >
                <option>Build strength</option>
                <option>Improve endurance</option>
                <option>Improve general fitness</option>
                <option>Build muscle</option>
                <option>Improve mobility and flexibility</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience" className="mb-2 block text-sm">
                Fitness experience
              </label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={inputClass}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm">
                What equipment can you use?
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {equipmentOptions.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={equipment.includes(item)}
                      onChange={() => toggleEquipment(item)}
                      className="accent-lime-400"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {message && (
              <p
                role="alert"
                className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-lime-400 py-4 font-bold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? "Saving your profile..." : "Save profile & continue →"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Your goals. Your pace. Your journey.
          </p>
        </div>
      </div>
    </main>
  );
}
