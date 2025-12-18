import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  profile: any;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string, tenantId: string = 'default-tenant') => {
    try {
      setIsLoading(true);
      const data = await apiService.login(email, password, tenantId);
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      console.error('Login error:', errorMessage, error);
      const formattedError = new Error(errorMessage);
      if (error.response) {
        (formattedError as any).response = error.response;
      }
      if (error.status) {
        (formattedError as any).status = error.status;
      }
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('tenantId');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};