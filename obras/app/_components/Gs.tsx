import { formatGs } from "@/lib/money";

/**
 * Monto en guaraníes con el símbolo puesto una sola vez por bloque y
 * en segundo plano: a tamaño y peso de titular, el ₲ del sistema se
 * lee como un ¢ y le compite al número, que es lo que importa.
 */
export function Gs({ value }: { value: number }) {
  return (
    <>
      <span className="gs-sym">₲</span>
      {formatGs(value)}
    </>
  );
}
