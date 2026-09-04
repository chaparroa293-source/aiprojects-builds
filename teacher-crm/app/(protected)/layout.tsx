import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="app-shell">
      <AppSidebar email={user?.email} />
      <main className="app-main">{children}</main>
    </div>
  );
}
