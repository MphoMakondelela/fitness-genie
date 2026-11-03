
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.push("/profile");
        return;
      }

      setSuccess(true);
      setMessage(
        "Account created! Please check your email and confirm your address. You'll then continue to your fitness profile."
      );
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
            START YOUR JOURNEY
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Create your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Meet your personal AI fitness coach.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm">
                Full name
              </label>
              <input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>

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
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>

            {message && (
              <p
                role="status"
                className={`rounded-xl p-3 text-sm ${
                  success
                    ? "bg-lime-400/10 text-lime-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-lime-400 py-3.5 font-bold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-lime-400 hover:underline"
            >
              Log in
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
