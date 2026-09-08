"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Gauge,
  HandshakeIcon,
  HardHat,
  LogOut,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  DIRECTORY_KINDS,
  DIRECTORY,
  type DirectoryKind,
} from "@/lib/directory-config";
import { logout } from "@/lib/auth-actions";
import { UniversalAdd } from "./UniversalAdd";
import { GlobalSearch } from "./GlobalSearch";

const STORE_KEY = "obras.sidebar.collapsed";

// Íconos sacados del mundo de la obra, no del catálogo genérico: el
// casco es el proyecto, el camión es el proveedor que entrega en obra,
// el apretón de manos es el cliente. Uno por ítem, mismo trazo.
const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

const DIRECTORY_ICON: Record<DirectoryKind, LucideIcon> = {
  clientes: HandshakeIcon,
  proveedores: Truck,
  personal: Users,
};

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="sidebar-icon"
      size={ICON_SIZE}
      strokeWidth={ICON_STROKE}
      aria-hidden="true"
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // La pantalla de ingreso no lleva navegación: todavía no hay a dónde ir.
  const bare = pathname === "/ingresar";

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

  if (bare) return <>{children}</>;

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
          <UniversalAdd />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Obra</div>
          <Link
            href="/proyectos"
            className="sidebar-link"
            data-active={isActive("/proyectos")}
          >
            <NavIcon icon={HardHat} />
            Proyectos
          </Link>
          <Link
            href="/historial"
            className="sidebar-link"
            data-active={isActive("/historial")}
          >
            <NavIcon icon={Archive} />
            Historial
          </Link>
          <Link
            href="/panel"
            className="sidebar-link"
            data-active={isActive("/panel")}
          >
            <NavIcon icon={Gauge} />
            Panel
          </Link>
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
              <NavIcon icon={DIRECTORY_ICON[kind]} />
              {DIRECTORY[kind].navLabel}
            </Link>
          ))}
        </nav>

        <form action={logout} className="sidebar-logout">
          <button type="submit" className="sidebar-link sidebar-logout-btn">
            <NavIcon icon={LogOut} />
            Salir
          </button>
        </form>
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
