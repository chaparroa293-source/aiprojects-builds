import { ClassForm } from "@/components/class-form";
import { getClassFormOptions } from "@/lib/schedule";
import { classReturnPath, todayInProductTimezone, validDate } from "@/lib/schedule-shared";
import SchedulePage from "@/app/(protected)/schedule/page";
import HomePage from "@/app/(protected)/home/page";
import { FormPanel } from "@/components/form-panel";

export const dynamic = "force-dynamic";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { clients, slots } = await getClassFormOptions();
  const returnTo = classReturnPath(params.returnTo);
  const initialDate = typeof params.date === "string" && validDate(params.date) ? params.date : todayInProductTimezone();
  const initialClientId = typeof params.client === "string" && clients.some((client) => client.id === params.client) ? params.client : undefined;
  const week = returnTo.startsWith("/schedule") ? new URL(returnTo, "http://local").searchParams.get("week") : undefined;
  return <>{returnTo === "/home" ? <HomePage /> : <SchedulePage searchParams={Promise.resolve(week ? { week } : {})} />}<FormPanel returnTo={returnTo} label="Add class"><ClassForm clients={clients} slots={slots} initialClientId={initialClientId} initialDate={initialDate} returnTo={returnTo} /></FormPanel></>;
}
