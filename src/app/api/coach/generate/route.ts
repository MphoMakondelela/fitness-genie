
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type OllamaGenerateResponse = {
  response?: string;
};

export async function POST(request: Request) {
  try {
    const provider = process.env.AI_PROVIDER || "gemini";

    if (provider !== "gemini" && provider !== "ollama") {
      return NextResponse.json(
        { error: "AI_PROVIDER must be set to 'gemini' or 'ollama'." },
        { status: 503 }
      );
    }

    if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "The AI service is not configured." },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      workoutDuration,
      trainingPreference,
      trainingConsistency,
      limitations,
    } = body;

    if (
      typeof workoutDuration !== "string" ||
      typeof trainingPreference !== "string" ||
      typeof trainingConsistency !== "string" ||
      typeof limitations !== "string" ||
      workoutDuration.length > 50 ||
      trainingPreference.length > 50 ||
      trainingConsistency.length > 50 ||
      limitations.length > 500
    ) {
      return NextResponse.json(
        { error: "Please check your coaching answers." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "age, height_cm, weight_kg, fitness_goal, experience_level, workout_days, available_equipment"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Your fitness profile could not be loaded." },
        { status: 400 }
      );
    }

    const prompt = `
You are Fitness Genie, a safe, encouraging fitness coach.

Create a personalized weekly workout plan using the information below.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

COACHING ANSWERS:
${JSON.stringify(
  {
    workoutDuration,
    trainingPreference,
    trainingConsistency,
    limitations,
  },
  null,
  2
)}

Include:

1. A short welcome and the main goal of the plan.
2. A weekly schedule matching the user's available workout days.
3. Exercises, sets, reps, and rest periods for each session.
4. A brief warm-up and cool-down.
5. Simple recovery, hydration, and sleep advice.
6. Safe, gradual progression guidance.
Keep the plan concise, practical, and easy to follow.
Respect the user's experience, equipment, time limit, goals, and limitations.
Avoid extreme exercise, restrictive diets, unnecessary supplements, diagnoses, and guaranteed results.
If the user reports pain, injury, or a medical limitation, avoid potentially aggravating exercises and recommend appropriate professional guidance.

Return plain text with clear headings and bullet points.
      `;

    let program: string | undefined;

    if (provider === "ollama") {
      const ollamaBaseUrl = (
        process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"
      ).replace(/\/+$/, "");

      let ollamaResponse: Response;

      try {
        ollamaResponse = await fetch(`${ollamaBaseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || "mistral:latest",
            prompt,
            stream: false,
          }),
          signal: AbortSignal.timeout(240_000),
          cache: "no-store",
        });
      } catch (error) {
        console.error("Ollama request failed:", error);

        const timedOut =
          error instanceof Error && error.name === "TimeoutError";

        return NextResponse.json(
          {
            error: timedOut
              ? "Ollama took too long to respond. Please try again."
              : "Could not connect to Ollama. Make sure it is running and OLLAMA_BASE_URL is correct.",
          },
          { status: timedOut ? 504 : 503 }
        );
      }

      if (!ollamaResponse.ok) {
        console.error("Ollama returned an error:", ollamaResponse.status);

        return NextResponse.json(
          {
            error:
              ollamaResponse.status === 404
                ? "The configured Ollama model was not found. Check OLLAMA_MODEL."
                : "Ollama could not generate a plan. Please try again.",
          },
          { status: 502 }
        );
      }

      const data = (await ollamaResponse.json()) as OllamaGenerateResponse;
      program = data.response?.trim();
    } else {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          timeout: 240_000,
        },
      });

      const response = await ai.interactions.create({
        model: "gemini-3.8-flash",
        generation_config: {
          thinking_level: "low",
        },
        input: prompt,
      });

      program = response.output_text?.trim();
    }

    if (!program) {
      console.error(`${provider} returned an empty response.`);

      return NextResponse.json(
        { error: "The AI coach could not generate a plan. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Fitness Genie generation error:", error);

    const err = error as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const errorMessage = err.message || "";

    const rateLimited =
      err.status === 429 ||
      err.statusCode === 429 ||
      errorMessage.includes("Rate limit exceeded");

    if (rateLimited) {
      // Gemini often returns something like:
      // "Please retry in 19h7m26s"
      const retryMatch = errorMessage.match(
        /retry in (?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/i
      );

      let retryAfterSeconds = 0;

      if (retryMatch) {
        const hours = Number(retryMatch[1] || 0);
        const minutes = Number(retryMatch[2] || 0);
        const seconds = Number(retryMatch[3] || 0);

        retryAfterSeconds =
          hours * 60 * 60 +
          minutes * 60 +
          Math.ceil(seconds);
      }

      return NextResponse.json(
        {
          error:
            "Coach Genie has reached its current usage limit. Please try again after your quota resets.",
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          "The workout plan could not be generated. Please try again.",
      },
      { status: 500 }
    );
  }
}
