import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
