import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useChildAuth } from "@/hooks/useChildAuth";
import { LOGIN_PATH } from "@/const";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
    </div>
  );
}

function ParentGate({ requireAdmin }: { requireAdmin: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to={LOGIN_PATH} replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function ChildGate() {
  const { data: child, isLoading } = useChildAuth();
  if (isLoading) return <Spinner />;
  if (!child) return <Navigate to="/child-login" replace />;
  return <Outlet />;
}

export default function ProtectedRoute({ variant }: { variant: "parent" | "admin" | "child" }) {
  if (variant === "child") return <ChildGate />;
  return <ParentGate requireAdmin={variant === "admin"} />;
}
