import { signIn } from "@/app/auth-actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">Teacher CRM</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-intro">Sign in to manage your students and their information.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <form action={signIn} className="stack-form" noValidate>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button button-primary" type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
