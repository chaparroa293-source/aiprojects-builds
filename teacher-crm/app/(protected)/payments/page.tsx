import Link from "next/link";
import { filterAndSortPayments, getPayments } from "@/lib/payments";
import { paymentListStateFromSearchParams, paymentListStateQuery } from "@/lib/payment-shared";
import { PaymentHistory } from "@/components/payment-history";
import { PaymentListControls } from "@/components/payment-list-controls";

export default async function PaymentsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const state = paymentListStateFromSearchParams(await (searchParams ?? Promise.resolve({})));
  const allPayments = await getPayments();
  const payments = filterAndSortPayments(allPayments, state);
  const clients = [...new Map(allPayments.map((payment) => [payment.client_id, { id: payment.client_id, student_name: payment.client.student_name }])).values()].sort((a, b) => a.student_name.localeCompare(b.student_name));
  const query = paymentListStateQuery(state);
  const returnTo = `/payments${query ? `?${query}` : ""}`;
  return <section className="clients-page ledger-page"><div className="page-heading clients-heading"><div><p className="workspace-kicker">A record of what comes in</p><h1 className="editorial-title">Payments<span className="title-period">.</span></h1><p>Money received, organized by payment date.</p></div><Link className="button button-primary" href={`/payments/new?returnTo=${encodeURIComponent(returnTo)}`}>+ Record Payment</Link></div><PaymentListControls state={state} clients={clients} /><div className="directory-label"><span>Payment ledger</span><span>Paraguayan guaraní · ₲</span></div><PaymentHistory payments={payments} returnTo={returnTo} showClient state={state} emptyMessage={allPayments.length ? "No payments match these filters." : undefined} /><p className="result-count">Showing {payments.length}{payments.length < allPayments.length ? ` of ${allPayments.length}` : ""} payments</p></section>;
}
