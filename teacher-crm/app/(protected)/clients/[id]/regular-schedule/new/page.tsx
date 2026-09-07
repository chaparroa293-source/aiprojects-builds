import { notFound } from "next/navigation";

import { RegularScheduleForm } from "@/components/regular-schedule-form";
import { getClient } from "@/lib/clients";
import ClientsPage from "@/app/(protected)/clients/page";
import { FormPanel } from "@/components/form-panel";

export default async function NewRegularTimePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  if (!(await getClient(id))) notFound();
  const returnTo = typeof query.returnTo === "string" && query.returnTo.startsWith(`/clients/${id}`) ? query.returnTo : `/clients/${id}`;
  const listParams = Object.fromEntries(new URL(returnTo, "http://local").searchParams);
  return <><ClientsPage searchParams={Promise.resolve(listParams)} /><FormPanel returnTo={returnTo} label="Add regular time"><RegularScheduleForm clientId={id} returnTo={returnTo} /></FormPanel></>;
}
