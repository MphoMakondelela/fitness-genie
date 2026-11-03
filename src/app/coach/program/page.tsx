
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CoachAnswers = {
  workoutDuration: string;
  trainingPreference: string;
  trainingConsistency: string;
  limitations: string;
};

const REQUEST_TIMEOUT_MS = 250_000; // 4 minutes 10 seconds

const progressMessages = [
  "Reviewing your fitness profile...",
  "Planning your weekly workouts...",
  "Matching exercises to your equipment...",
  "Putting the finishing touches on your plan...",
];

export default function CoachProgramPage() {
  const router = useRouter();
  const requestId = useRef(0);

  const [answers, setAnswers] = useState<CoachAnswers | null>(null);
  const [program, setProgram] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const generateProgram = useCallback(async (savedAnswers: CoachAnswers) => {
    const currentRequest = ++requestId.current;
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setProgram("");
    setProgressIndex(0);

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/coach/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savedAnswers),
        signal: controller.signal,
      });

      const data = await response.json();

      if (currentRequest !== requestId.current) return;

      if (!response.ok) {
        if (response.status === 429) {
          setRetryAfterSeconds(data.retryAfterSeconds || 0);
        }

        throw new Error(
          data.error || "Unable to generate your workout program."
        );
      }

      if (typeof data.program !== "string" || !data.program.trim()) {
        throw new Error("The AI coach returned an empty workout plan.");
      }

      setProgram(data.program);
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      if (controller.signal.aborted) {
        setError(
          "Generating your workout is taking longer than expected. Please try again."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);

      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const savedAnswers = sessionStorage.getItem(
      "fitness-genie-coach-answers"
    );

    if (!savedAnswers) {
      router.replace("/coach");
      return;
    }

    try {
      const parsedAnswers = JSON.parse(savedAnswers) as CoachAnswers;

      if (
        typeof parsedAnswers.workoutDuration !== "string" ||
        typeof parsedAnswers.trainingPreference !== "string" ||
        typeof parsedAnswers.trainingConsistency !== "string" ||
        typeof parsedAnswers.limitations !== "string"
      ) {
        throw new Error("Invalid coaching answers");
      }

      setAnswers(parsedAnswers);
      void generateProgram(parsedAnswers);
    } catch {
      sessionStorage.removeItem("fitness-genie-coach-answers");
      router.replace("/coach");
    }

    return () => {
      requestId.current++;
    };
  }, [router, generateProgram]);

  useEffect(() => {
    if (!loading) return;

    const intervalId = window.setInterval(() => {
      setProgressIndex((current) =>
        Math.min(current + 1, progressMessages.length - 1)
      );
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;

    const intervalId = window.setInterval(() => {
      setRetryAfterSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [retryAfterSeconds]);

  return (
    <main className="min-h-screen bg-[#090b0a] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-lime-400">
          Fitness Genie AI Coach
        </p>

        <h1 className="mb-6 text-3xl font-bold">
          Your Personal Workout Program
        </h1>

        {answers && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-3 text-lg font-semibold">Your preferences</h2>
            <p>Workout duration: {answers.workoutDuration}</p>
            <p>Training preference: {answers.trainingPreference}</p>
            <p>Experience: {answers.trainingConsistency}</p>
            <p>Limitations: {answers.limitations || "None specified"}</p>
          </div>
        )}

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-lime-400/20 bg-white/5 p-8 text-center"
          >
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-lime-400" />

            <h2 className="text-xl font-semibold">
              Building your workout plan
            </h2>

            <p className="mt-3 text-lime-400">
              {progressMessages[progressIndex]}
            </p>

            <div className="mx-auto mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-lime-400" />
            </div>

            <p className="mt-4 text-sm text-gray-400">
              This usually takes a short while. Please keep this page open.
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6"
          >
            <h2 className="text-lg font-semibold text-red-400">
              We couldn't generate your plan
            </h2>

            <p className="mt-2 leading-6 text-gray-300">
              {error}
            </p>

            {retryAfterSeconds > 0 && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5 text-center">
                <p className="text-sm text-gray-400">
                  Coach Genie should be available again in
                </p>

                <p className="mt-2 text-3xl font-bold text-lime-400">
                  {formatCountdown(retryAfterSeconds)}
                </p>

                
              </div>
            )}

            <button
              type="button"
              disabled={retryAfterSeconds > 0}
              onClick={() => {
                if (answers && retryAfterSeconds <= 0) {
                  void generateProgram(answers);
                }
              }}
              className={`mt-5 rounded-lg px-5 py-3 font-semibold transition ${
                retryAfterSeconds > 0
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "bg-lime-400 text-black hover:bg-lime-300"
              }`}
            >
              {retryAfterSeconds > 0 ? "Waiting for quota..." : "Try again"}
            </button>
          </div>
        )}

        {program && !loading && !error && (
          <div className="rounded-2xl border border-lime-400/20 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-lime-400">
              Your workout plan
            </h2>

            <div className="whitespace-pre-wrap leading-7 text-gray-200">
              {program}
            </div>

            <button
              type="button"
              onClick={() => {
                if (answers) void generateProgram(answers);
              }}
              className="mt-6 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Generate a new plan
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
