"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("coach");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">F</span>
          </div>
          <span className="text-lg font-bold">FitCoach</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">
            Start coaching smarter today.
          </h2>
          <p className="text-gray-400 text-lg">
            Free to start. No credit card required.
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} FitCoach
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-bold">FitCoach</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Get started in under a minute
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Smith"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("coach")}
                  className={`py-3 px-4 border rounded-lg text-sm font-medium transition-all ${
                    role === "coach"
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-base mb-0.5">Coach</span>
                  <span className={`text-xs ${role === "coach" ? "text-gray-300" : "text-gray-400"}`}>
                    I train clients
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`py-3 px-4 border rounded-lg text-sm font-medium transition-all ${
                    role === "client"
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-base mb-0.5">Client</span>
                  <span className={`text-xs ${role === "client" ? "text-gray-300" : "text-gray-400"}`}>
                    I have a coach
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
