import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
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

  const { data: programs } = await supabase
    .from("programs")
    .select("*, program_days(id)")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold dark:text-white">Programs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
            Create and manage workout programs for your clients
          </p>
        </div>
        <Link
          href="/programs/new"
          className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          + New program
        </Link>
      </div>

      {programs && programs.length > 0 ? (
        <div className="grid gap-3">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold dark:text-white group-hover:text-black dark:group-hover:text-white">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {program.program_days?.length || 0} days
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Created {new Date(program.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          </div>
          <h3 className="font-bold dark:text-white mb-1">No programs yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-medium">
            Create your first workout program to get started
          </p>
          <Link
            href="/programs/new"
            className="inline-flex px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            Create your first program
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
