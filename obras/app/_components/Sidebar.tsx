"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIRECTORY_KINDS, DIRECTORY } from "@/lib/directory-config";

export function Sidebar({ quickAdd }: { quickAdd?: ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Obras</div>

      {quickAdd ? <div className="sidebar-quickadd">{quickAdd}</div> : null}

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Directorio</div>
        {DIRECTORY_KINDS.map((kind) => {
          const href = `/${kind}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={kind}
              href={href}
              className="sidebar-link"
              data-active={active}
            >
              {DIRECTORY[kind].navLabel}
            </Link>
          );
        })}
      </nav>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Obra</div>
        <Link
          href="/proyectos"
          className="sidebar-link"
          data-active={
            pathname === "/proyectos" || pathname.startsWith("/proyectos/")
          }
        >
          Proyectos
        </Link>
        {/* El Panel llega en un slice posterior del plan. */}
        <span className="sidebar-link" data-disabled="true">
          Panel
        </span>
      </nav>
    </aside>
  );
}
