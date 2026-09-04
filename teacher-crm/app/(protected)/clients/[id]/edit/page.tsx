import { notFound } from "next/navigation";

import { ClientForm } from "@/components/client-form";
import { getClient } from "@/lib/clients";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const client = await getClient(id);
  if (!client) notFound();

  const safeReturnTo = returnTo?.startsWith("/clients") ? returnTo : `/clients/${id}`;
  return <ClientForm client={client} returnTo={safeReturnTo} />;
}
