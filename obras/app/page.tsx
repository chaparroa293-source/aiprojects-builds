import { redirect } from "next/navigation";

// Proyectos es la superficie operativa principal (spec, sección de
// rutas): es donde se trabaja todos los días, así que es lo primero
// que se ve al entrar sin un destino puntual en mente.
export default function Home() {
  redirect("/proyectos");
}
