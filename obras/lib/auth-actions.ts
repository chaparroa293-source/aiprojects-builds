"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/session";

export type AuthState = { error: string | null };

/**
 * Sólo rutas internas: evita que un `?desde=` armado a mano mande a
 * otro sitio después de entrar. "//" y "/\" son URLs de otro host
 * disfrazadas de ruta relativa.
 */
function safeReturnPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (raw.startsWith("/ingresar")) return "/";
  return raw;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;

  // Sin configurar no se entra. El mensaje distingue este caso del de
  // contraseña equivocada porque lo arregla quien despliega, no quien
  // está mirando la pantalla.
  if (!hash || !secret) {
    return {
      error:
        "El servidor no tiene configurado el acceso (falta AUTH_PASSWORD_HASH o SESSION_SECRET).",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Escribí la contraseña." };

  if (!(await verifyPassword(password, hash))) {
    return { error: "Contraseña incorrecta." };
  }

  const token = await createSessionToken(secret);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect(safeReturnPath(String(formData.get("desde") ?? "")));
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/ingresar");
}
