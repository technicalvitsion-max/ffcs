import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import LandingPage from "./pages/LandingPage.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RootLayout from "./components/common/RootLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import {
  AuthRoute,
  ProtectedRoute,
} from "./components/common/RouteProtection.tsx";
import ErrorComponent from "./components/common/Error.tsx";
import StudentViewPage from "./pages/admin/StudentViewPage.tsx";
import NewRequestForm from "./pages/student/NewRequestPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "login",
        element: (
          <AuthRoute>
            <LoginPage />,
          </AuthRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />,
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/student/:id",
        element: (
          <ProtectedRoute>
            <StudentViewPage />,
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/request",
        element: (
          <ProtectedRoute>
            <NewRequestForm />,
          </ProtectedRoute>
        ),
      },
      {
        path: "error",
        element: <ErrorComponent />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
