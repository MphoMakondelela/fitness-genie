
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Profile = {
  full_name: string;
  fitness_goal: string;
  experience_level: string;
  workout_days: number;
  available_equipment: string[];
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

type OllamaStreamChunk = {
  message?: {
    content?: unknown;
  };
  error?: unknown;
};

export default function CoachPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");

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

      const firstName = data.full_name.split(" ")[0];

      setMessages([
        {
          role: "assistant",
          content: `Hey ${firstName}! 👋 Welcome to Fitness Genie.

I'm your personal AI fitness coach. I can help you with workouts, healthy nutrition, recovery and reaching your fitness goals.

How can I assist you today? Tell me what's on your mind!`,
        },
      ]);

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function sendMessage(retry = false) {
    if (!profile || thinking) return;

    const lastUserIndex = retry
      ? messages.findLastIndex((message) => message.role === "user")
      : -1;
    const text = retry
      ? messages[lastUserIndex]?.content
      : input.trim();

    if (!text) return;

    const conversation = retry
      ? messages.slice(0, lastUserIndex + 1)
      : messages;
    const updatedMessages = retry
      ? conversation
      : [...conversation, { role: "user" as const, content: text }];
    const assistantMessageIndex = updatedMessages.length;

    setMessages(updatedMessages);
    if (!retry) setInput("");
    setThinking(true);
    setError("");

    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Something went wrong.");
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = (await response.json()) as { reply?: unknown };

        if (typeof data.reply !== "string" || !data.reply.trim()) {
          throw new Error("The AI returned an empty response.");
        }

        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.reply },
        ]);
        return;
      }

      if (!response.body) {
        throw new Error("The AI response stream was unavailable.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";

      function appendChunk(line: string) {
        if (!line.trim()) return;

        const chunk = JSON.parse(line) as OllamaStreamChunk;

        if (typeof chunk.error === "string") {
          throw new Error(chunk.error);
        }

        const content = chunk.message?.content;
        if (typeof content !== "string" || !content) return;

        reply += content;
        setMessages((previous) =>
          previous.map((message, index) =>
            index === assistantMessageIndex
              ? { ...message, content: reply }
              : message
          )
        );
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            appendChunk(line);
          }

          if (done) break;
        }

        appendChunk(buffer);
      } finally {
        reader.releaseLock();
      }

      if (!reply.trim()) {
        throw new Error("The AI returned an empty response.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to reach your AI coach.";

      setMessages((previous) =>
        previous.filter(
          (item, index) =>
            index !== assistantMessageIndex || item.content.length > 0
        )
      );
      setError(message);
    } finally {
      setThinking(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090b0a] text-white">
        <p className="text-gray-400">
          Preparing your AI coach...
        </p>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#090b0a] text-white">
      <div className="mx-auto flex h-screen max-w-4xl flex-col">

        {/* HEADER */}
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-xl font-black text-black">
            FG
          </div>

          <div className="flex-1">
            <h1 className="font-bold">
              Fitness Genie
            </h1>
            <p className="text-xs text-lime-400">
              ● Your own AI Coach 
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Exit
          </button>
        </header>

        {/* PROFILE */}
        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
            <span>
              Goal:{" "}
              <strong className="text-white">
                {profile.fitness_goal}
              </strong>
            </span>

            <span>
              Experience:{" "}
              <strong className="text-white">
                {profile.experience_level}
              </strong>
            </span>

            <span>
              Training days:{" "}
              <strong className="text-white">
                {profile.workout_days}
              </strong>
            </span>
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400 font-black text-black">
                  FG
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === "user"
                    ? "rounded-br-sm bg-lime-400 text-black"
                    : "rounded-bl-sm border border-white/10 bg-[#151915] text-gray-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* THINKING */}
          {thinking && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 font-black text-black">
                FG
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#151915] px-5 py-3 text-sm text-gray-400">
                <span className="animate-pulse">
                  Fitness Genie is thinking...
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="ml-12 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}

              <button
                onClick={() => sendMessage(true)}
                className="ml-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-white/10 bg-[#0d100d] p-4">
          <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#151915] p-2 focus-within:border-lime-400">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask your fitness coach anything..."
              rows={1}
              disabled={thinking}
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black transition hover:bg-lime-300 disabled:opacity-30"
              aria-label="Send message"
            >
              <span className="text-xl">↑</span>
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-gray-600">
            Powered by local AI · Fitness Genie
          </p>
        </div>

      </div>
    </main>
  );
}
