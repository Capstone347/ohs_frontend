import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import type { AdminRole } from '@/services/adminApi';

const ROLE_LEVEL: Record<AdminRole, number> = {
  support: 1,
  manager: 2,
  owner: 3,
};

interface RequireRoleProps {
  role: AdminRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole = ({ role, children, fallback }: RequireRoleProps) => {
  const { adminUser } = useAdminAuth();

  if (!adminUser || ROLE_LEVEL[adminUser.role] < ROLE_LEVEL[role]) {
    return fallback ? <>{fallback}</> : <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
