import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItem =
  "px-3 py-2 rounded-md text-sm transition-colors hover:bg-edge hover:text-text";
const navActive = "bg-edge text-text";
const navInactive = "text-muted";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-edge bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-mono text-lg font-semibold text-accent">
              TropelCare
            </span>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? navActive : navInactive}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/tropels"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? navActive : navInactive}`
                }
              >
                Tropeles
              </NavLink>
              <NavLink
                to="/signals"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? navActive : navInactive}`
                }
              >
                Senales
              </NavLink>
              <NavLink
                to="/sectors"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? navActive : navInactive}`
                }
              >
                Sectores
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted">
              {user?.teamCode}
              <span className="mx-2 text-edge">|</span>
              {user?.displayName}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-md border border-edge bg-surface px-3 py-1.5 text-sm text-text hover:border-accent hover:text-accent"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
