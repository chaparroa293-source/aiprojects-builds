import { notFound } from "next/navigation";

import { ClassForm } from "@/components/class-form";
import { getClassFormOptions, getTutoringClass } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  const [tutoringClass, options] = await Promise.all([getTutoringClass(id), getClassFormOptions()]);
  if (!tutoringClass) notFound();
  const returnTo = typeof query.returnTo === "string" && (query.returnTo.startsWith("/schedule") || query.returnTo.startsWith("/clients")) ? query.returnTo : "/schedule";
  return <ClassForm clients={options.clients} slots={options.slots} tutoringClass={tutoringClass} returnTo={returnTo} />;
}
