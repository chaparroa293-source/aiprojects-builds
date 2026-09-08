"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/lib/search-actions";

/**
 * Buscador global del shell. Cada resultado muestra su contexto
 * completo (proyecto + ruta de segmento para gastos), no una
 * coincidencia pelada. Clic afuera o Escape lo cierran; además hay
 * un botón visible de limpiar.
 */
export function GlobalSearch() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Clic afuera y Escape cierran el panel de resultados.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function runSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    startTransition(async () => {
      const found = await globalSearch(value);
      setResults(found);
    });
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function go(href: string) {
    clear();
    router.push(href);
  }

  // Agrupar por tipo conservando el orden de llegada.
  const groups: { name: string; items: SearchResult[] }[] = [];
  for (const r of results) {
    let g = groups.find((x) => x.name === r.group);
    if (!g) {
      g = { name: r.group, items: [] };
      groups.push(g);
    }
    g.items.push(r);
  }

  return (
    <div className="search" ref={boxRef}>
      <input
        type="search"
        className="search-input"
        placeholder="Buscar proyectos, gastos, personas…"
        value={query}
        onChange={(e) => runSearch(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        aria-label="Buscar en todo"
      />
      {query ? (
        <button
          type="button"
          className="search-clear"
          onClick={clear}
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      ) : null}

      {open ? (
        <div className="search-results">
          {pending && results.length === 0 ? (
            <p className="search-empty">Buscando…</p>
          ) : results.length === 0 ? (
            <p className="search-empty">Sin resultados para “{query}”.</p>
          ) : (
            groups.map((g) => (
              <div key={g.name} className="search-group">
                <div className="search-group-label">{g.name}</div>
                {g.items.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="search-hit"
                    onClick={() => go(r.href)}
                  >
                    <span className="search-hit-main">
                      <span className="search-hit-title">{r.title}</span>
                      {r.context ? (
                        <span className="search-hit-context">{r.context}</span>
                      ) : null}
                    </span>
                    {r.amount ? (
                      <span className="search-hit-amount">{r.amount}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
