import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "./auth/PrivateRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TropelesPage } from "./features/tropeles/TropelesPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/tropels", element: <TropelesPage /> },
          {
            path: "/signals",
            element: (
              <section>
                <h1 className="mb-2 font-mono text-2xl text-text">Senales</h1>
                <p className="text-sm text-muted">
                  Pendiente: Checkpoint 3 (feed infinito).
                </p>
              </section>
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
