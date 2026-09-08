"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIRECTORY_KINDS, DIRECTORY } from "@/lib/directory-config";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Obras</div>

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
        <div className="sidebar-section-label">Próximamente</div>
        {/* Habilitados en slices posteriores del plan. */}
        <span className="sidebar-link" data-disabled="true">
          Proyectos
        </span>
        <span className="sidebar-link" data-disabled="true">
          Panel
        </span>
      </nav>
    </aside>
  );
}
