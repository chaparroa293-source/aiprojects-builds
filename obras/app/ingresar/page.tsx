import { LoginForm } from "@/app/_components/LoginForm";

export const dynamic = "force-dynamic";

/**
 * Portón de entrada. Una sola contraseña compartida — no hay usuarios,
 * ni roles, ni recuperación: es la herramienta de una familia, no un
 * producto multiusuario.
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
          Esta herramienta es privada. Escribí la contraseña para continuar.
        </p>
        <LoginForm desde={desde ?? ""} />
      </div>
    </div>
  );
}
