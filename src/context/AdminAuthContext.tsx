import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, AdminUser } from '@/services/adminApi';
import { toast } from 'sonner';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: AdminUser['role'] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await adminApi.getMe();
      setAdminUser(me);
    } catch {
      setAdminUser(null);
    }
  }, []);

  // Hydrate session on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await adminApi.getMe();
        setAdminUser(me);
      } catch {
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Listen for admin 401 events
  useEffect(() => {
    if (isLoading) return;

    const handleUnauthorized = () => {
      if (adminUser) {
        setAdminUser(null);
        toast.error('Your admin session has expired. Please log in again.');
        navigate('/admin/login', { replace: true });
      }
    };

    window.addEventListener('admin-auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin-auth:unauthorized', handleUnauthorized);
  }, [navigate, isLoading, adminUser]);

  const login = async (email: string, password: string) => {
    const result = await adminApi.login(email, password);
    setAdminUser(result.admin);
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Logout is idempotent
    }
    setAdminUser(null);
    navigate('/admin/login', { replace: true });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isAuthenticated: !!adminUser,
        role: adminUser?.role ?? null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
