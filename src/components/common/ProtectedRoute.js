// ProtectedRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  return isAuthenticated ? (
    <Outlet />
  ) : (
    // Redirect to login with the "from" state to store the previous location
    <Navigate to="/signin" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
