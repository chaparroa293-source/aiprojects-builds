import { ClientForm } from "@/components/client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const safeReturnTo = returnTo?.startsWith("/clients") ? returnTo : "/clients";
  return <ClientForm returnTo={safeReturnTo} />;
}
