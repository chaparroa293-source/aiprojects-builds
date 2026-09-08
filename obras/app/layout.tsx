import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./_components/Sidebar";
import { QuickAddExpense } from "./_components/QuickAddExpense";
import { getQuickAddData } from "@/lib/expense-actions";

export const metadata: Metadata = {
  title: "Obras",
  description: "Gestión de obras — directorio, proyectos y gastos",
};

// El shell trae datos en vivo (quick-add de gastos) en cada request.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const quickAddData = await getQuickAddData();

  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <Sidebar quickAdd={<QuickAddExpense data={quickAddData} />} />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
