import { WorkspaceMotif } from "@/components/workspace-motif";
import Link from "next/link";
import type { Payment } from "@/lib/payments";
import { paymentListStateQuery, type PaymentListState } from "@/lib/payment-shared";
import { formatGuarani } from "@/lib/payment-shared";
import { formatDate } from "@/lib/schedule-shared";

export function PaymentHistory({ payments, returnTo, showClient = false, state, emptyMessage = "No payments recorded yet." }: { payments: Payment[]; returnTo: string; showClient?: boolean; state?: PaymentListState; emptyMessage?: string }) {
  if (!payments.length) return <div className="ledger-empty"><WorkspaceMotif kind="receipt" /><p>{emptyMessage}</p></div>;
  const heading = (label: string, ascending: string, descending: string) => !state ? label : <Link className="sortable-heading" scroll={false} href={`/payments?${paymentListStateQuery({ ...state, sort: state.sort === ascending ? descending : ascending } as PaymentListState)}`}>{label} <span aria-hidden="true">{state.sort === ascending ? "↑" : state.sort === descending ? "↓" : "↕"}</span></Link>;
  return <div className="table-frame payment-table"><table><thead><tr><th aria-sort={state?.sort === "oldest" ? "ascending" : state?.sort === "recent" ? "descending" : undefined}>{heading("Date", "oldest", "recent")}</th>{showClient && <th aria-sort={state?.sort === "client-asc" ? "ascending" : state?.sort === "client-desc" ? "descending" : undefined}>{heading("Client", "client-asc", "client-desc")}</th>}<th className="amount-heading" aria-sort={state?.sort === "amount-asc" ? "ascending" : state?.sort === "amount-desc" ? "descending" : undefined}>{heading("Amount", "amount-asc", "amount-desc")}</th><th>Classes covered</th><th>Notes</th></tr></thead><tbody>{payments.map((payment, index) => {
    const href = `/payments/${payment.id}/edit?returnTo=${encodeURIComponent(returnTo)}`;
    const count = payment.classes[0]?.count ?? 0;
    const dateBreak = index > 0 && (!state || state.sort === "recent" || state.sort === "oldest") && payments[index - 1].payment_date !== payment.payment_date;
    return <tr className={dateBreak ? "ledger-date-break" : undefined} key={payment.id}><td><Link className="cell-link" href={href}>{formatDate(payment.payment_date, { year: "numeric" })}</Link></td>{showClient && <td><Link className="student-link" href={href}>{payment.client.student_name}</Link></td>}<td className="amount-cell"><Link className="cell-link payment-amount" href={href}>{formatGuarani(payment.amount)}</Link></td><td><Link className="cell-link" href={href}>{count} {count === 1 ? "class" : "classes"}</Link></td><td className="notes-cell"><Link className="cell-link" href={href}><span className="payment-notes">{payment.notes || "—"}</span></Link></td></tr>;
  })}</tbody></table></div>;
}
