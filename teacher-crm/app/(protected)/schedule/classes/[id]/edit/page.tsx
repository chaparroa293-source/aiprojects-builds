import { notFound } from "next/navigation";

import { ClassForm } from "@/components/class-form";
import { getClassFormOptions, getTutoringClass } from "@/lib/schedule";
import SchedulePage from "@/app/(protected)/schedule/page";
import { FormPanel } from "@/components/form-panel";
import HomePage from "@/app/(protected)/home/page";
import { classReturnPath } from "@/lib/schedule-shared";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  const [tutoringClass, options] = await Promise.all([getTutoringClass(id), getClassFormOptions()]);
  if (!tutoringClass) notFound();
  const returnTo = classReturnPath(query.returnTo);
  const week = returnTo.startsWith("/schedule") ? new URL(returnTo, "http://local").searchParams.get("week") : undefined;
  return <>{returnTo === "/home" ? <HomePage /> : <SchedulePage searchParams={Promise.resolve(week ? { week } : {})} />}<FormPanel returnTo={returnTo} label="Edit class"><ClassForm clients={options.clients} slots={options.slots} tutoringClass={tutoringClass} returnTo={returnTo} /></FormPanel></>;
}
