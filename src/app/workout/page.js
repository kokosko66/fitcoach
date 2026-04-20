import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import WorkoutLogger from "./workout-logger";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
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

  const { data: assignment } = await supabase
    .from("program_assignments")
    .select(
      `
      *,
      programs(
        id, title,
        program_days(
          id, day_number, name,
          exercises(id, name, sets, reps, rest_seconds, order_index)
        )
      )
    `
    )
    .eq("client_id", user.id)
    .eq("active", true)
    .limit(1)
    .single();

  if (!assignment) {
    return (
      <DashboardShell user={user} profile={profile}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-extrabold dark:text-white mb-2">No active program</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Your coach hasn&apos;t assigned you a program yet. Check back soon!
          </p>
        </div>
      </DashboardShell>
    );
  }

  const program = assignment.programs;
  const sortedDays = (program.program_days || []).sort(
    (a, b) => a.day_number - b.day_number
  );

  const { data: completedLogs } = await supabase
    .from("workout_logs")
    .select("program_day_id, completed_at")
    .eq("client_id", user.id)
    .order("completed_at", { ascending: false });

  const completedDayIds = (completedLogs || []).map((l) => l.program_day_id);

  return (
    <DashboardShell user={user} profile={profile}>
      <h1 className="text-2xl font-extrabold dark:text-white mb-1">{program.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">
        Select a day to start your workout
      </p>

      <div className="grid gap-3">
        {sortedDays.map((day) => {
          const timesCompleted = completedDayIds.filter(
            (id) => id === day.id
          ).length;

          return (
            <WorkoutLogger
              key={day.id}
              day={day}
              clientId={user.id}
              timesCompleted={timesCompleted}
            />
          );
        })}
      </div>
    </DashboardShell>
  );
}
