import type { ReactNode } from "react";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { StaticLoader } from "./Loader";

interface Props {
  children: ReactNode;
}
export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth() as AuthContextType;

  if (loading) return <StaticLoader isVisible={true} />;

  return user ? children : <Navigate to="/login" replace />;
}
export function AuthRoute({ children }: Props) {
  const { user, loading } = useAuth() as AuthContextType;

  if (loading) return <StaticLoader isVisible={true} />;

  return user ? <Navigate to="/dashboard" replace /> : children;
}
