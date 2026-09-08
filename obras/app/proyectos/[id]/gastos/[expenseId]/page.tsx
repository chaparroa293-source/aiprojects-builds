import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteExpense,
  getExpenseEditContext,
  updateExpense,
} from "@/lib/expense-actions";
import { ExpenseEditForm } from "@/app/_components/ExpenseEditForm";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>;
}) {
  const { id, expenseId } = await params;
  const ctx = await getExpenseEditContext(expenseId);
  if (!ctx || ctx.expense.projectId !== id) notFound();

  return (
    <>
      <p className="breadcrumb">
        <Link href="/proyectos">Proyectos</Link> /{" "}
        <Link href={`/proyectos/${id}`}>{ctx.expense.projectName}</Link> / Gasto
      </p>
      <div className="page-header">
        <h1 className="page-title">Editar gasto</h1>
      </div>

      <ExpenseEditForm
        ctx={ctx}
        updateAction={updateExpense.bind(null, expenseId)}
        deleteAction={deleteExpense.bind(null, expenseId)}
      />
    </>
  );
}
