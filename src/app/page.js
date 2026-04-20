import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-extrabold text-sm">F</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight dark:text-white">FitCoach</span>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full blur-3xl opacity-60" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Used by coaches in 3 countries
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05]">
            Deliver workouts.
            <br />
            <span className="text-gray-300 dark:text-gray-600">Track progress.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The simplest platform for fitness coaches. Create programs, assign
            them to clients, and watch their progress — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 text-base font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-black/10 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
            >
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-400 dark:text-gray-500">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">500+</span>
              <span className="font-medium">Workouts logged</span>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">50+</span>
              <span className="font-medium">Active coaches</span>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">4.9/5</span>
              <span className="font-medium">Coach rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
              Simple by design
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium">
              No bloat. No learning curve. Just the tools you need to coach
              effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-5">
                <span className="text-white dark:text-black text-lg font-extrabold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Create a program</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Build workout programs with days, exercises, sets, and reps.
                Reuse them across clients.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-5">
                <span className="text-white dark:text-black text-lg font-extrabold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Assign to clients</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Invite clients and assign programs instantly. They see their
                workouts on any device.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-5">
                <span className="text-white dark:text-black text-lg font-extrabold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Track everything</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Clients log sets and weights. You see progress in real time — no
                more chasing messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
              Stop using spreadsheets
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              Your clients deserve better. So do you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Before */}
            <div className="rounded-2xl p-8 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
              <h3 className="font-bold text-red-900 dark:text-red-300 mb-4">
                Without FitCoach
              </h3>
              <ul className="space-y-3 text-sm text-red-800 dark:text-red-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2717;</span>
                  <span>Programs lost in WhatsApp chats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2717;</span>
                  <span>No idea if clients actually trained</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2717;</span>
                  <span>Manually tracking everything in sheets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2717;</span>
                  <span>Looks unprofessional to clients</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl p-8 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-4">
                With FitCoach
              </h3>
              <ul className="space-y-3 text-sm text-green-800 dark:text-green-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2713;</span>
                  <span>Programs delivered instantly to clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2713;</span>
                  <span>See every workout logged in real time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2713;</span>
                  <span>Everything organized in one dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">&#x2713;</span>
                  <span>Clients love the clean, simple experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Ready to level up your coaching?
          </h2>
          <p className="text-gray-400 dark:text-gray-600 text-lg mb-8 max-w-xl mx-auto font-medium">
            Join coaches who&apos;ve already simplified their workflow. Free to
            start, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3.5 text-base font-bold bg-white dark:bg-black text-black dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all shadow-lg"
          >
            Start free today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black font-extrabold text-xs">F</span>
            </div>
            <span className="text-sm font-bold dark:text-white">FitCoach</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} FitCoach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
