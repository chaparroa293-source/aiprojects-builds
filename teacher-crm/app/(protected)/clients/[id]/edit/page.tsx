import { notFound } from "next/navigation";

import { ClientForm } from "@/components/client-form";
import { getClient } from "@/lib/clients";
import ClientsPage from "@/app/(protected)/clients/page";
import { FormPanel } from "@/components/form-panel";

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
  const listParams = Object.fromEntries(new URL(safeReturnTo, "http://local").searchParams);
  return <><ClientsPage searchParams={Promise.resolve(listParams)} /><FormPanel returnTo={safeReturnTo} label="Edit client"><ClientForm client={client} returnTo={safeReturnTo} /></FormPanel></>;
}
