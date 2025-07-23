import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, token } = useAuth(); // Get user and loading state from AuthProvider
  // Show a loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>; // Or replace with a proper loading component
  }

  // If no user is authenticated, redirect to sign-in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const role = localStorage.getItem('role')
  // If the user's role is not allowed, redirect to unauthorized page
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}