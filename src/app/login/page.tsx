"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const user = data.user;

      if (!user) {
        throw new Error("Unable to retrieve your account. Please try again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error(
          "We couldn't check your fitness profile. Please try logging in again."
        );
      }

      window.location.href = profile ? "/dashboard" : "/profile";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b0a] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="text-2xl font-black">
          <span className="text-lime-400">✦</span> Fitness Genie
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#121512] p-8">
          <p className="text-sm font-semibold text-lime-400">
            WELCOME BACK
          </p>

          <h1 className="mt-3 text-3xl font-black">Log in to your account</h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Continue your fitness journey.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>

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
              disabled={loading}
              className="w-full rounded-xl bg-lime-400 py-3.5 font-bold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-lime-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Your journey, your pace.
        </p>
      </div>
    </main>
  );
}
