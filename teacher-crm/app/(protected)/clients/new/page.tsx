import { ClientForm } from "@/components/client-form";
import ClientsPage from "@/app/(protected)/clients/page";
import { FormPanel } from "@/components/form-panel";

export const dynamic = "force-dynamic";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const safeReturnTo = returnTo?.startsWith("/clients") ? returnTo : "/clients";
  const listParams = Object.fromEntries(new URL(safeReturnTo, "http://local").searchParams);
  return <><ClientsPage searchParams={Promise.resolve(listParams)} /><FormPanel returnTo={safeReturnTo} label="Add client"><ClientForm returnTo={safeReturnTo} /></FormPanel></>;
}
