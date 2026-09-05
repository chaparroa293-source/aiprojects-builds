import { notFound } from "next/navigation";

import { RegularScheduleForm } from "@/components/regular-schedule-form";
import { getClient } from "@/lib/clients";
import { getRegularScheduleSlot } from "@/lib/schedule";

export default async function EditRegularTimePage({ params, searchParams }: { params: Promise<{ id: string; slotId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id, slotId } = await params;
  const query = await searchParams;
  const [client, slot] = await Promise.all([getClient(id), getRegularScheduleSlot(slotId)]);
  if (!client || !slot || slot.client_id !== id) notFound();
  const returnTo = typeof query.returnTo === "string" && query.returnTo.startsWith(`/clients/${id}`) ? query.returnTo : `/clients/${id}`;
  return <RegularScheduleForm clientId={id} slot={slot} returnTo={returnTo} />;
}
