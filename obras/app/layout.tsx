import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Obras",
  description: "Gestión de obras — directorio, proyectos y gastos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
