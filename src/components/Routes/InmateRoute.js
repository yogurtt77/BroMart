import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import ProtectedRoute from './ProtectedRoute';

const InmateRoute = ({ children }) => (
  <ProtectedRoute>
    {getUserRole() === 'INMATE' ? children : <Navigate to="/" replace />}
  </ProtectedRoute>
);

export default InmateRoute;
