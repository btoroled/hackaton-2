import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "./auth/PrivateRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TropelesPage } from "./features/tropeles/TropelesPage";
import { SignalsFeedPage } from "./features/signals/SignalsFeedPage";
import { SectorsPage } from "./features/story/SectorsPage";
import { SectorStoryPage } from "./features/story/SectorStoryPage";

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
          { path: "/signals", element: <SignalsFeedPage /> },
          { path: "/sectors", element: <SectorsPage /> },
          { path: "/sectors/:id/story", element: <SectorStoryPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
