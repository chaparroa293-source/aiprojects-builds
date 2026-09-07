import Link from "next/link";
import { PaymentForm } from "@/components/payment-form";
import { getPaymentFormOptions } from "@/lib/payments";
import { paymentReturnPath } from "@/lib/payment-shared";
import PaymentsPage from "@/app/(protected)/payments/page";
import { FormPanel } from "@/components/form-panel";
import HomePage from "@/app/(protected)/home/page";

export default async function NewPaymentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const options = await getPaymentFormOptions();
  if (!options.clients.length) return <section className="empty-state"><h1>No clients yet</h1><p>Add a Client before recording a payment.</p><Link className="button button-primary" href="/clients/new">Add Client</Link></section>;
  const client = typeof params.client === "string" && options.clients.some((item) => item.id === params.client) ? params.client : "";
  const returnTo = paymentReturnPath(params.returnTo);
  return <>{returnTo === "/home" ? <HomePage /> : <PaymentsPage searchParams={Promise.resolve(Object.fromEntries(new URL(returnTo, "http://local").searchParams))} />}<FormPanel returnTo={returnTo} label="Record payment"><PaymentForm {...options} initialClientId={client} returnTo={returnTo} /></FormPanel></>;
}
