import { notFound } from "next/navigation";
import { PaymentForm } from "@/components/payment-form";
import { getPayment, getPaymentFormOptions } from "@/lib/payments";
import { paymentReturnPath } from "@/lib/payment-shared";
import PaymentsPage from "@/app/(protected)/payments/page";
import { FormPanel } from "@/components/form-panel";
import HomePage from "@/app/(protected)/home/page";

export default async function EditPaymentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const [payment, options, query] = await Promise.all([getPayment(id), getPaymentFormOptions(), searchParams]);
  if (!payment) notFound();
  const returnTo = paymentReturnPath(query.returnTo);
  return <>{returnTo === "/home" ? <HomePage /> : <PaymentsPage searchParams={Promise.resolve(Object.fromEntries(new URL(returnTo, "http://local").searchParams))} />}<FormPanel returnTo={returnTo} label="Edit payment"><PaymentForm {...options} payment={payment} returnTo={returnTo} /></FormPanel></>;
}
