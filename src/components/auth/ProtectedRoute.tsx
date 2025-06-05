import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4400B8]"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no user data, we need to wait for data to load
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4400B8]"></div>
      </div>
    );
  }

  // Check if user has required role
  if (!allowedRoles.includes(userData.role)) {
    // Redirect based on actual user role
    switch (userData.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "bank":
        return <Navigate to="/bank/dashboard" replace />;
      case "pos_agent":
        return <Navigate to="/pos/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the required role
  return <Outlet />;
};

export default ProtectedRoute;
