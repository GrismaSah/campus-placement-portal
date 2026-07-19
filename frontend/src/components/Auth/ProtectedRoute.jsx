import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Context } from "../../main";
import LoaderPage from "../Loader/LoaderPage.jsx";

/**
 * Guards a route behind authentication and (optionally) roles.
 *
 * Usage:
 *   <ProtectedRoute><Jobs /></ProtectedRoute>                          // any logged-in user
 *   <ProtectedRoute roles={["TNP"]}><PostJob /></ProtectedRoute>       // TNP only
 *   <ProtectedRoute roles={["Student"]}><Application /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthorized, user, authLoading } = useContext(Context);
  const location = useLocation();

  // Auth check still in flight (e.g. page refresh) — don't redirect yet
  if (authLoading) {
    return <LoaderPage />;
  }

  // Not logged in — go to login, remember where they were headed
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but wrong role for this page — send home
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
