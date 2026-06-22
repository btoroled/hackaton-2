import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiRequestError } from "../api/client";

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/dashboard";

  const [teamCode, setTeamCode] = useState<string>(
    import.meta.env.VITE_TEAM_CODE ?? "",
  );
  const [email, setEmail] = useState<string>(
    import.meta.env.VITE_EMAIL ?? "operator@tuckersoft.com",
  );
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authed") {
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ teamCode, email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesion");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-edge bg-surface p-6 shadow-xl"
      >
        <h1 className="mb-1 font-mono text-xl text-accent">TropelCare</h1>
        <p className="mb-6 text-sm text-muted">Control Room</p>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-muted">Team Code</span>
          <input
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value)}
            placeholder="TEAM-001"
            autoComplete="username"
            required
            className="w-full rounded-md border border-edge bg-bg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-md border border-edge bg-bg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-edge bg-bg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
