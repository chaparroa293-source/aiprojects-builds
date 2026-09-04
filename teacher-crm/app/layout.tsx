import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teacher CRM",
  description: "A simple operational tool for a private tutor.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
