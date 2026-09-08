"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/lib/auth-actions";

export function LoginForm({ desde }: { desde: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    { error: null },
  );

  return (
    <form action={formAction} className="login-form">
      <input type="hidden" name="desde" value={desde} />
      <div className="field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
        />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
