import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import OnboardingWizard from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
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

  if (profile?.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingWizard user={user} profile={profile} />;
}
