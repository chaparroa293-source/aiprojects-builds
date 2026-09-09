import { LoginForm } from "@/app/_components/LoginForm";

export const dynamic = "force-dynamic";

/**
 * Portón de entrada. Cuentas nombradas (OBRAS-012) — sin roles, sin
 * recuperación de contraseña, sin alta pública: las únicas dos cuentas
 * las crea quien despliega, por CLI (scripts/crear-usuario.ts). Es la
 * herramienta de una familia, no un producto multiusuario.
 */
export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string }>;
}) {
  const { desde } = await searchParams;

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="login-brand">Obras</p>
        <h1 className="login-title">Entrar</h1>
        <p className="login-hint">
          Esta herramienta es privada. Ingresá con tu usuario y
          contraseña para continuar.
        </p>
        <LoginForm desde={desde ?? ""} />
      </div>
    </div>
  );
}
