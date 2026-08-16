'use client';

import * as React from 'react';
import { User, ActiveUser, RegisterUserInput, LoginUserInput, GoogleAuthInput } from '@taskly/shared-types';
import { api } from '../api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  activeUsers: ActiveUser[];
  loginAsGuest: (name?: string) => Promise<User>;
  register: (input: RegisterUserInput) => Promise<User>;
  login: (input: LoginUserInput) => Promise<User>;
  loginWithGoogle: (input: GoogleAuthInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const loginAsGuest = async (name?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.createGuest({ name });
      setUser(res.user);
      fetchActiveUsers();
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterUserInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(input);
      setUser(res.user);
      fetchActiveUsers();
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

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

  const loginWithGoogle = async (input: GoogleAuthInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.googleAuth(input);
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
        loginAsGuest,
        register,
        login,
        loginWithGoogle,
        logout,
        refreshUser: fetchUser,
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
