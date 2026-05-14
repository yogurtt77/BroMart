import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../../utils/auth';

const InmateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() !== 'INMATE') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default InmateRoute;
