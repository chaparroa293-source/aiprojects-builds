"use client";

import { useEffect, useRef, useState } from "react";
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
  X,
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
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // La pantalla de ingreso no lleva navegación: todavía no hay a dónde ir.
  const bare = pathname === "/ingresar";

  // Restaurar la preferencia al montar. En pantalla angosta la barra
  // arranca cerrada (es un cajón que tapa el contenido).
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1199px)").matches;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORE_KEY);
    } catch {
      /* sin almacenamiento */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(stored === null ? compact : stored === "1");
  }, []);

  function setSidebarCollapsed(next: boolean) {
    setCollapsed(next);
    try {
      localStorage.setItem(STORE_KEY, next ? "1" : "0");
    } catch {
      /* ignorar */
    }
  }

  function toggleSidebar() {
    setSidebarCollapsed(!collapsed);
  }

  function closeNavigation() {
    if (window.matchMedia("(max-width: 1199px)").matches) {
      setSidebarCollapsed(true);
    }
  }

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    if (collapsed || !narrow) return;

    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const focusable = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSidebarCollapsed(true);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [collapsed]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  if (bare) return <>{children}</>;

  return (
    <div className="app-shell" data-collapsed={collapsed}>
      {/* Fondo que cierra el cajón en pantalla angosta (clic afuera). */}
      {!collapsed ? (
        <button
          type="button"
          className="sidebar-scrim"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Cerrar menú"
        />
      ) : null}

      <aside className="sidebar" ref={sidebarRef} aria-label="Navegación principal">
        <div className="sidebar-brand-row">
          <div className="sidebar-brand">Obras</div>
          <button
            ref={closeButtonRef}
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Cerrar menú"
            title="Cerrar menú"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="sidebar-quickadd">
          <UniversalAdd />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Obra</div>
          <Link
            href="/proyectos"
            className="sidebar-link"
            data-active={isActive("/proyectos")}
            aria-current={isActive("/proyectos") ? "page" : undefined}
            aria-label="Proyectos"
            title="Proyectos"
            onClick={closeNavigation}
          >
            <NavIcon icon={HardHat} />
            Proyectos
          </Link>
          <Link
            href="/historial"
            className="sidebar-link"
            data-active={isActive("/historial")}
            aria-current={isActive("/historial") ? "page" : undefined}
            aria-label="Historial"
            title="Historial"
            onClick={closeNavigation}
          >
            <NavIcon icon={Archive} />
            Historial
          </Link>
          <Link
            href="/panel"
            className="sidebar-link"
            data-active={isActive("/panel")}
            aria-current={isActive("/panel") ? "page" : undefined}
            aria-label="Panel"
            title="Panel"
            onClick={closeNavigation}
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
              aria-current={isActive(`/${kind}`) ? "page" : undefined}
              aria-label={DIRECTORY[kind].navLabel}
              title={DIRECTORY[kind].navLabel}
              onClick={closeNavigation}
            >
              <NavIcon icon={DIRECTORY_ICON[kind]} />
              {DIRECTORY[kind].navLabel}
            </Link>
          ))}
        </nav>

        <form action={logout} className="sidebar-logout" noValidate>
          <div className="sidebar-session" aria-label="Estado de acceso">
            <span className="sidebar-session-title">Acceso al estudio</span>
            <span className="sidebar-session-copy">Sesión compartida</span>
          </div>
          <button
            type="submit"
            className="sidebar-link sidebar-logout-btn"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <NavIcon icon={LogOut} />
            Cerrar sesión
          </button>
        </form>
      </aside>

      <div className="content">
        <header className="topbar">
          <button
            ref={menuButtonRef}
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
          <div className="topbar-quickadd">
            <UniversalAdd />
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
