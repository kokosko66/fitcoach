import { createServerSupabase } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
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

  const { data: relationship } = await supabase
    .from("coach_clients")
    .select("*")
    .eq("coach_id", user.id)
    .eq("client_id", id)
    .single();

  if (!relationship) notFound();

  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("*, programs(id, title)")
    .eq("client_id", id)
    .eq("active", true);

  const { data: recentLogs } = await supabase
    .from("workout_logs")
    .select(`id, completed_at, program_days(name, day_number)`)
    .eq("client_id", id)
    .order("completed_at", { ascending: false })
    .limit(10);

  return (
    <DashboardShell user={user} profile={profile}>
      <Link
        href="/clients"
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1 block font-medium"
      >
        &larr; Back to clients
      </Link>
      <h1 className="text-2xl font-extrabold dark:text-white mb-6">
        {clientProfile?.full_name || "Client"}
      </h1>

      <div className="mb-8">
        <h2 className="text-lg font-bold dark:text-white mb-3">Active programs</h2>
        {assignments && assignments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignments.map((a) => (
              <Link
                key={a.id}
                href={`/programs/${a.programs.id}`}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:border-black dark:hover:border-gray-500 dark:text-white"
              >
                {a.programs.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No programs assigned.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold dark:text-white mb-3">Recent workouts</h2>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 flex justify-between items-center">
                <span className="text-sm font-bold dark:text-white">
                  {log.program_days?.name || "Workout"}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  {new Date(log.completed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No workouts logged yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
