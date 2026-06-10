import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

const ProtectedRoute = ({ children, redirectTo = '/auth/login' }) => {
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
