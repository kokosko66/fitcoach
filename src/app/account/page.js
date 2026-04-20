import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import AccountForm from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
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

  return (
    <DashboardShell user={user} profile={profile}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold dark:text-white">Account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
          Manage your profile and account settings
        </p>
      </div>

      <AccountForm user={user} profile={profile} />
    </DashboardShell>
  );
}
