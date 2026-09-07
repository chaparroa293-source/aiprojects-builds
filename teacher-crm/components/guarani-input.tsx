"use client";

import { useState } from "react";

function digits(value: string) { return value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""); }
function display(value: string) { return value ? new Intl.NumberFormat("es-PY").format(Number(value)) : ""; }

export function GuaraniInput({ initialValue }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue ? String(initialValue) : "");
  return <label>Amount (₲)<input type="hidden" name="amount" value={value} /><input inputMode="numeric" value={display(value)} placeholder="0" required aria-label="Amount in Paraguayan guaraní" onChange={(event) => setValue(digits(event.target.value).slice(0, 16))} /></label>;
}
