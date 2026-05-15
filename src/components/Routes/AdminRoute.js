import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import ProtectedRoute from './ProtectedRoute';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN'];

const AdminRoute = ({ children }) => (
  <ProtectedRoute>
    {ALLOWED_ROLES.includes(getUserRole()) ? children : <Navigate to="/" replace />}
  </ProtectedRoute>
);

export default AdminRoute;
