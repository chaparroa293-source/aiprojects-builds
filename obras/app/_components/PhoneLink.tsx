/**
 * Teléfono como enlace `tel:`, sin tocar el estilo mudo/secundario que
 * ya tenía como texto plano. `href` limpia todo lo que no sea dígito o
 * "+" inicial — lo que se escribe suele traer espacios ("0981 123
 * 456") que un enlace tel: no necesita.
 */
export function PhoneLink({ phone }: { phone: string }) {
  const dial = phone.trim().replace(/(?!^\+)[^\d]/g, "");
  return <a href={`tel:${dial}`}>{phone}</a>;
}
