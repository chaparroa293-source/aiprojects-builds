import Link from "next/link";

import { signOut } from "@/app/auth-actions";

type NavName = "Dashboard" | "Clients" | "Schedule" | "Payments" | "Analytics";

const navItems: Array<{ label: NavName; active: boolean }> = [
  { label: "Dashboard", active: false },
  { label: "Clients", active: true },
  { label: "Schedule", active: false },
  { label: "Payments", active: false },
  { label: "Analytics", active: false },
];

function NavIcon({ name }: { name: NavName }) {
  const paths: Record<NavName, React.ReactNode> = {
    Dashboard: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></>,
    Clients: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V20"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14a4.5 4.5 0 0 1 4 4.5V20"/></>,
    Schedule: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    Payments: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h4"/></>,
    Analytics: <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M2 20h20"/></>,
  };

  return <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AppSidebar({ email }: { email: string | undefined }) {
  return (
    <aside className="sidebar">
      <div>
        <Link href="/clients" className="brand">Teacher CRM</Link>
        <nav aria-label="Primary navigation" className="main-nav">
          {navItems.map((item) => item.active ? (
            <Link href="/clients" className="nav-item nav-active" aria-current="page" key={item.label}>
              <NavIcon name={item.label} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="nav-item nav-disabled" aria-disabled="true" key={item.label}>
              <NavIcon name={item.label} />
              <span>{item.label}</span>
            </span>
          ))}
        </nav>
      </div>
      <form action={signOut} className="account-area">
        <span className="account-avatar" aria-hidden="true">T</span>
        <span className="account-copy"><strong>Tutor</strong><span>{email ?? "Tutor account"}</span></span>
        <button className="sidebar-logout" type="submit">Log out</button>
      </form>
    </aside>
  );
}
