import { notFound } from "next/navigation";

import { RegularScheduleForm } from "@/components/regular-schedule-form";
import { getClient } from "@/lib/clients";

export default async function NewRegularTimePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  if (!(await getClient(id))) notFound();
  const returnTo = typeof query.returnTo === "string" && query.returnTo.startsWith(`/clients/${id}`) ? query.returnTo : `/clients/${id}`;
  return <RegularScheduleForm clientId={id} returnTo={returnTo} />;
}
