import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role's home
    if (user.role === "admin") return <Navigate to="/" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/developer" replace />;
  }

  return <Outlet />;
}
