import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarded) {
    redirect("/onboarding");
  }

  if (profile?.role === "client") {
    redirect("/workout");
  }

  // Coach dashboard: fetch stats
  const { count: clientCount } = await supabase
    .from("coach_clients")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", user.id);

  const { count: programCount } = await supabase
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", user.id);

  const { data: recentLogs } = await supabase
    .from("workout_logs")
    .select(
      `
      id,
      completed_at,
      client_id,
      program_day_id,
      profiles!workout_logs_client_id_fkey(full_name),
      program_days!workout_logs_program_day_id_fkey(name)
    `
    )
    .in(
      "client_id",
      (
        await supabase
          .from("coach_clients")
          .select("client_id")
          .eq("coach_id", user.id)
      ).data?.map((c) => c.client_id) || []
    )
    .order("completed_at", { ascending: false })
    .limit(5);

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold dark:text-white">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Coach"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
          Here&apos;s what&apos;s happening with your clients
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Total clients
            </div>
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold mt-2 dark:text-white">{clientCount || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Programs</div>
            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-extrabold mt-2 dark:text-white">{programCount || 0}</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
            Quick actions
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/programs/new"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs">+</span>
              Create program
            </Link>
            <Link
              href="/clients"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs">+</span>
              Invite client
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold dark:text-white">Recent client activity</h2>
        </div>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold dark:text-white">
                      {log.profiles?.full_name || "Client"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
                      completed {log.program_days?.name || "a workout"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {new Date(log.completed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">No activity yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">
              Create a program and assign it to get started
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
