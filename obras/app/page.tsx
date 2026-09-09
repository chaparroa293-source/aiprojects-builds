import { redirect } from "next/navigation";

// Dinámica a propósito, igual que el resto de las páginas: sin esto,
// Next la marca "estática" en el build (era la única página de toda
// la app así) y Vercel la sirve como un artefacto de su capa de
// CDN/Edge en vez de ejecutar el redirect en cada pedido. En local
// (`next start`, un solo proceso) eso nunca se nota — el componente
// se ejecuta igual pase lo que pase — pero en Vercel una sesión ya
// autenticada que llega hasta acá encontraba ese artefacto roto: 404.
export const dynamic = "force-dynamic";

// Proyectos es la superficie operativa principal (spec, sección de
// rutas): es donde se trabaja todos los días, así que es lo primero
// que se ve al entrar sin un destino puntual en mente.
export default function Home() {
  redirect("/proyectos");
}
