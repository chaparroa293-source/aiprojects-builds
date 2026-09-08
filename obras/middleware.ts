import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Portón único de la app: sin cookie de sesión válida no se llega a
 * ninguna ruta salvo la de ingreso.
 *
 * Cierra ante la duda: si SESSION_SECRET no está configurado, no
 * "deja pasar por las dudas" — manda a /ingresar, donde se explica que
 * el servidor está sin configurar. Un despliegue a medio configurar
 * queda inaccesible, no abierto.
 */
export async function middleware(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const allowed = secret
    ? await verifySessionToken(secret, token)
    : false;

  if (allowed) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/ingresar";
  url.search = "";

  // Para volver a donde iba después de entrar. Sólo la ruta, nunca la
  // query, que puede llevar datos.
  const from = request.nextUrl.pathname;
  if (from && from !== "/") url.searchParams.set("desde", from);

  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Todo menos: la propia pantalla de ingreso (si no, bucle de
   * redirecciones) y los assets que esa pantalla necesita para
   * dibujarse. Los chunks de _next son código, no datos del negocio.
   */
  matcher: [
    "/((?!ingresar|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
