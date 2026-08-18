'use client';

import * as React from 'react';
import { User, ActiveUser, LoginUserInput } from '@taskly/shared-types';
import { api } from '../api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  activeUsers: ActiveUser[];
  login: (input: LoginUserInput) => Promise<User>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshActiveUsers: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [activeUsers, setActiveUsers] = React.useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveUsers = React.useCallback(async () => {
    try {
      const res = await api.getActiveUsers();
      setActiveUsers(res.activeUsers);
    } catch {
      // Keep existing active users
    }
  }, []);

  React.useEffect(() => {
    fetchUser();
    fetchActiveUsers();

    // Poll active presence every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUser, fetchActiveUsers]);

  const login = async (input: LoginUserInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(input);
      setUser(res.user);
      fetchActiveUsers();
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('taskly_token');
        window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeUsers,
        login,
        logout,
        fetchUser,
        refreshActiveUsers: fetchActiveUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
