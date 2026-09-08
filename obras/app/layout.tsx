import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "./_components/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
