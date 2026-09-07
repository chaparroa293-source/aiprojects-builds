import { notFound } from "next/navigation";

import { RegularScheduleForm } from "@/components/regular-schedule-form";
import { getClient } from "@/lib/clients";
import { getRegularScheduleSlot } from "@/lib/schedule";
import ClientsPage from "@/app/(protected)/clients/page";
import { FormPanel } from "@/components/form-panel";

export default async function EditRegularTimePage({ params, searchParams }: { params: Promise<{ id: string; slotId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id, slotId } = await params;
  const query = await searchParams;
  const [client, slot] = await Promise.all([getClient(id), getRegularScheduleSlot(slotId)]);
  if (!client || !slot || slot.client_id !== id) notFound();
  const returnTo = typeof query.returnTo === "string" && query.returnTo.startsWith(`/clients/${id}`) ? query.returnTo : `/clients/${id}`;
  const listParams = Object.fromEntries(new URL(returnTo, "http://local").searchParams);
  return <><ClientsPage searchParams={Promise.resolve(listParams)} /><FormPanel returnTo={returnTo} label="Edit regular time"><RegularScheduleForm clientId={id} slot={slot} returnTo={returnTo} /></FormPanel></>;
}
