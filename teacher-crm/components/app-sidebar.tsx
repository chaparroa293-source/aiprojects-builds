"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/app/auth-actions";

type NavName = "Dashboard" | "Clients" | "Schedule" | "Payments" | "Analytics";

const navItems: Array<{ label: NavName; href?: string }> = [
  { label: "Dashboard" },
  { label: "Clients", href: "/clients" },
  { label: "Schedule", href: "/schedule" },
  { label: "Payments" },
  { label: "Analytics" },
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      <div>
        <Link href="/clients" className="brand" aria-label="Teacher CRM"><span className="brand-full">Teacher CRM</span><svg className="brand-compact" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 5v15M12 6C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 2Z" /></svg></Link>
        <nav aria-label="Primary navigation" className="main-nav">
          {navItems.map((item) => item.href ? (
            <Link href={item.href} className={`nav-item${pathname.startsWith(item.href) ? " nav-active" : ""}`} aria-current={pathname.startsWith(item.href) ? "page" : undefined} aria-label={item.label} title={collapsed ? item.label : undefined} key={item.label}>
              <NavIcon name={item.label} />
              <span className="nav-label">{item.label}</span>
            </Link>
          ) : (
            <span className="nav-item nav-disabled" aria-disabled="true" title={collapsed ? `${item.label} unavailable` : undefined} key={item.label}>
              <NavIcon name={item.label} />
              <span className="nav-label">{item.label}</span>
            </span>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <button className="sidebar-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <form action={signOut} className="account-area">
          <span className="account-avatar" aria-hidden="true">T</span>
          <span className="account-copy"><strong>Tutor</strong><span>{email ?? "Tutor account"}</span></span>
          <button className="sidebar-logout" type="submit" aria-label="Log out" title={collapsed ? "Log out" : undefined}><span className="logout-icon" aria-hidden="true">↪</span><span className="logout-label">Log out</span></button>
        </form>
      </div>
    </aside>
  );
}
