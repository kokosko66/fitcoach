import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import Link from "next/link";
import InviteClient from "./invite-client";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
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

  const { data: clients } = await supabase
    .from("coach_clients")
    .select("*, profiles!coach_clients_client_id_fkey(id, full_name)")
    .eq("coach_id", user.id);

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold dark:text-white">Clients</h1>
      </div>

      <InviteClient coachId={user.id} />

      {clients && clients.length > 0 ? (
        <div className="grid gap-3 mt-6">
          {clients.map((rel) => (
            <Link
              key={rel.id}
              href={`/clients/${rel.profiles.id}`}
              className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-black dark:hover:border-gray-500 transition-colors"
            >
              <span className="font-bold dark:text-white">{rel.profiles.full_name}</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">&rarr;</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-6 font-medium">
          No clients yet. Invite one using their email above.
        </p>
      )}
    </DashboardShell>
  );
}
