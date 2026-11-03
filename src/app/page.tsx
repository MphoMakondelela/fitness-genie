
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Personalised training",
    description:
      "Training built around your goals, experience, schedule and available equipment.",
  },
  {
    number: "02",
    title: "Smarter nutrition",
    description:
      "Explore practical meal ideas that suit your preferences and daily routine.",
  },
  {
    number: "03",
    title: "Progress that matters",
    description:
      "Keep track of your activity and see how your consistency develops over time.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090b0a] text-white">
      {/* Navigation */}
      <header className="border-b border-white/[0.08]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-black text-black">
              FG
            </span>
            <span className="text-lg font-bold tracking-tight">
              Fitness <span className="text-lime-400">Genie</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-300"
            >
              Get started <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-lime-400/[0.07] blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-2 lg:px-10 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-lime-300">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              YOUR GOALS. YOUR PACE.
            </div>

            <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Build a stronger
              <span className="mt-2 block text-lime-400">
                version of you.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
              A more personal approach to fitness. Plan your training,
              discover better meal ideas and build habits that fit your life.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-lime-400 px-7 py-4 font-bold text-black transition hover:-translate-y-0.5 hover:bg-lime-300"
              >
                Start your journey <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-white/40"
              >
                I have an account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span>✓ Built around your goals</span>
              <span>✓ Your own pace</span>
            </div>
          </div>

          {/* Premium visual panel */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-lime-400/[0.06] blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#111411] p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-500">
                    THE FITNESS MINDSET
                  </p>
                  <h2 className="mt-3 text-2xl font-bold">
                    Progress, not perfection.
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10 text-2xl text-lime-400">
                  ✳
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                <p className="text-sm text-gray-400">Your journey starts with</p>
                <p className="mt-2 text-xl font-bold">One decision.</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 rounded-full bg-lime-400" />
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Set your goal</span>
                  <span>Take the first step</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <span className="text-2xl">◈</span>
                  <p className="mt-4 font-semibold">Train with purpose</p>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Make your time count.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <span className="text-2xl">✳</span>
                  <p className="mt-4 font-semibold">Build your habits</p>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Small steps add up.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-center text-xs tracking-wide text-gray-600">
                YOUR FITNESS JOURNEY, REIMAGINED
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="border-t border-white/[0.08] bg-[#0c0f0c]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.22em] text-lime-400">
              A BETTER APPROACH
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Fitness that fits your life.
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              Your routine should work for you. Fitness Genie brings the
              essentials together so you can focus on making progress.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-white/[0.08] bg-[#111411] p-7 transition duration-300 hover:-translate-y-1 hover:border-lime-400/30"
              >
                <p className="text-sm font-bold text-lime-400">
                  {feature.number}
                </p>
                <h3 className="mt-7 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-lime-400/15 bg-lime-400/[0.04] p-7 sm:flex-row sm:items-center sm:p-9">
            <div>
              <h3 className="text-2xl font-bold">
                Your next chapter starts here.
              </h3>
              <p className="mt-2 text-gray-400">
                Start building a routine that works for you.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-lime-400 px-6 py-3.5 font-bold text-black transition hover:bg-lime-300"
            >
              Create your account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} Fitness Genie
          </p>
          <p>Built for your goals. Designed for your journey.</p>
        </div>
      </footer>
    </main>
  );
}
