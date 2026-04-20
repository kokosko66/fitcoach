import { createServerSupabase } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import Link from "next/link";
import AssignClient from "./assign-client";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({ params }) {
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

  const { data: program } = await supabase
    .from("programs")
    .select(
      `
      *,
      program_days(
        id, day_number, name,
        exercises(id, name, sets, reps, rest_seconds, order_index)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!program) notFound();

  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("*, profiles!program_assignments_client_id_fkey(full_name)")
    .eq("program_id", id)
    .eq("active", true);

  const { data: allClients } = await supabase
    .from("coach_clients")
    .select("client_id, profiles!coach_clients_client_id_fkey(id, full_name)")
    .eq("coach_id", user.id);

  const assignedIds = (assignments || []).map((a) => a.client_id);
  const availableClients = (allClients || [])
    .map((c) => c.profiles)
    .filter((c) => !assignedIds.includes(c.id));

  const sortedDays = (program.program_days || []).sort(
    (a, b) => a.day_number - b.day_number
  );

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/programs"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1 block font-medium"
          >
            &larr; Back to programs
          </Link>
          <h1 className="text-2xl font-extrabold dark:text-white">{program.title}</h1>
          {program.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{program.description}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold dark:text-white mb-3">Assigned clients</h2>
        {assignments && assignments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignments.map((a) => (
              <span
                key={a.id}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium dark:text-white"
              >
                {a.profiles?.full_name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No clients assigned yet.</p>
        )}

        {availableClients.length > 0 && (
          <AssignClient programId={id} availableClients={availableClients} />
        )}
      </div>

      <div className="space-y-4">
        {sortedDays.map((day) => (
          <div key={day.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
            <h3 className="font-bold dark:text-white mb-3">
              Day {day.day_number}: {day.name}
            </h3>
            <div className="space-y-2">
              {(day.exercises || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded"
                  >
                    <span className="font-semibold text-sm dark:text-white">{exercise.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {exercise.sets} x {exercise.reps}
                      {exercise.rest_seconds && ` | ${exercise.rest_seconds}s rest`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
