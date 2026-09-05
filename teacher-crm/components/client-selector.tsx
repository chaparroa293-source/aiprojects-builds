"use client";

import { useId, useState } from "react";
import type { ClientOption } from "@/lib/schedule-shared";

export function ClientSelector({ clients, value, onChange }: { clients: ClientOption[]; value: string; onChange: (id: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState(clients.find((client) => client.id === value)?.student_name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = clients.filter((client) => client.student_name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  function select(client: ClientOption) {
    onChange(client.id);
    setQuery(client.student_name);
    setOpen(false);
  }
  return <div className="client-combobox field-wide">
    <label htmlFor={id}>Client / Student</label>
    <input type="hidden" name="client_id" value={value} />
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open && matches[active] ? `${id}-${matches[active].id}` : undefined} autoComplete="off" value={query} required placeholder="Search student names…"
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onChange={(event) => { setQuery(event.target.value); onChange(""); setActive(0); setOpen(true); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((index) => Math.max(0, Math.min(matches.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))); }
        if (event.key === "Enter" && open) { event.preventDefault(); if (matches[active]) select(matches[active]); }
        if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      }} />
    {open && <ul className="client-suggestions" id={`${id}-options`} role="listbox" aria-label="Matching students">
      {matches.map((client, index) => <li key={client.id} id={`${id}-${client.id}`} role="option" aria-selected={index === active} onMouseDown={(event) => event.preventDefault()} onClick={() => select(client)}>{client.student_name}</li>)}
      {!matches.length && <li role="presentation">No matching clients</li>}
    </ul>}
    {!value && query && <small className="field-hint">Choose an existing client from the suggestions.</small>}
  </div>;
}
