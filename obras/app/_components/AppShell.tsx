"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIRECTORY_KINDS, DIRECTORY } from "@/lib/directory-config";
import { QuickAddExpense } from "./QuickAddExpense";
import { GlobalSearch } from "./GlobalSearch";

const STORE_KEY = "obras.sidebar.collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Restaurar la preferencia al montar. En pantalla angosta la barra
  // arranca cerrada (es un cajón que tapa el contenido).
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 720px)").matches;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORE_KEY);
    } catch {
      /* sin almacenamiento */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(stored === null ? narrow : stored === "1");
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORE_KEY, next ? "1" : "0");
      } catch {
        /* ignorar */
      }
      return next;
    });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="app-shell" data-collapsed={collapsed}>
      {/* Fondo que cierra el cajón en pantalla angosta (clic afuera). */}
      {!collapsed ? (
        <div
          className="sidebar-scrim"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      ) : null}

      <aside className="sidebar">
        <div className="sidebar-brand">Obras</div>

        <div className="sidebar-quickadd">
          <QuickAddExpense />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Obra</div>
          <Link
            href="/proyectos"
            className="sidebar-link"
            data-active={isActive("/proyectos")}
          >
            Proyectos
          </Link>
          {/* El Panel llega en un slice posterior del plan. */}
          <span className="sidebar-link" data-disabled="true">
            Panel
          </span>
        </nav>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Directorio</div>
          {DIRECTORY_KINDS.map((kind) => (
            <Link
              key={kind}
              href={`/${kind}`}
              className="sidebar-link"
              data-active={isActive(`/${kind}`)}
            >
              {DIRECTORY[kind].navLabel}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="content">
        <header className="topbar">
          <button
            type="button"
            className="hamburger"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Mostrar menú" : "Ocultar menú"}
            aria-expanded={!collapsed}
            title={collapsed ? "Mostrar menú" : "Ocultar menú"}
          >
            <span />
            <span />
            <span />
          </button>
          <GlobalSearch />
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
