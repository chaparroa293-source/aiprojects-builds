import { ClassForm } from "@/components/class-form";
import { getClassFormOptions } from "@/lib/schedule";
import { todayInProductTimezone, validDate } from "@/lib/schedule-shared";

export const dynamic = "force-dynamic";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { clients, slots } = await getClassFormOptions();
  const returnTo = typeof params.returnTo === "string" && (params.returnTo.startsWith("/schedule") || params.returnTo.startsWith("/clients")) ? params.returnTo : "/schedule";
  const initialDate = typeof params.date === "string" && validDate(params.date) ? params.date : todayInProductTimezone();
  const initialClientId = typeof params.client === "string" && clients.some((client) => client.id === params.client) ? params.client : undefined;
  return <ClassForm clients={clients} slots={slots} initialClientId={initialClientId} initialDate={initialDate} returnTo={returnTo} />;
}
