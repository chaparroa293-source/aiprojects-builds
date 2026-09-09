"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  const secret = process.env.SESSION_SECRET;

  // Sin configurar no se entra. El mensaje distingue este caso del de
  // credenciales incorrectas porque lo arregla quien despliega, no
  // quien está mirando la pantalla.
  if (!secret) {
    return {
      error: "El servidor no tiene configurado el acceso (falta SESSION_SECRET).",
    };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Escribí usuario y contraseña." };
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, passwordHash: true },
  });

  // Mismo mensaje exista o no la cuenta: no hay que dejarle a quien
  // prueba contraseñas adivinar qué usuarios existen. La comparación
  // corre igual (contra un hash que nunca va a dar, no un early
  // return) para no filtrar la diferencia por tiempo de respuesta.
  const validPassword = await verifyPassword(
    password,
    user?.passwordHash ?? undefined,
  );
  if (!user || !validPassword) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const token = await createSessionToken(secret, user.id);
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
