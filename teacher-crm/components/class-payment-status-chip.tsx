import Link from "next/link";

export function ClassPaymentStatusChip({ paymentId, href }: { paymentId: string | null; href?: string }) {
  const paid = Boolean(paymentId);
  const className = `payment-status-chip payment-status-${paid ? "paid" : "unpaid"}`;
  const label = paid ? "Paid" : "Unpaid";

  if (paid && href) {
    return <Link className={className} href={href} aria-label="Paid — open linked payment" title="Open linked payment">{label}</Link>;
  }

  return <span className={className} aria-label={`Payment status: ${label}`}>{label}</span>;
}
