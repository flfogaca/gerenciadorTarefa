import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  const retryCountRef = useRef(0);
  const isCheckingAuthRef = useRef(false);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string, tenantId: string = 'default-tenant') => {
    try {
      setIsLoading(true);
      retryCountRef.current = 0;
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
    if (isCheckingAuthRef.current) {
      return;
    }
    
    try {
      isCheckingAuthRef.current = true;
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        isCheckingAuthRef.current = false;
        return;
      }
      
      try {
        const userData = await apiService.getCurrentUser();
        if (userData) {
          setUser(userData);
          retryCountRef.current = 0;
          setIsLoading(false);
          isCheckingAuthRef.current = false;
          return;
        } else {
          const existingToken = localStorage.getItem('authToken');
          if (existingToken) {
            console.warn('getCurrentUser returned null but token exists - keeping session');
          }
          setUser(null);
          retryCountRef.current = 0;
          setIsLoading(false);
          isCheckingAuthRef.current = false;
          return;
        }
      } catch (error: any) {
        const status = error?.response?.status || error?.status;
        
        if (status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await apiService.refreshToken();
              if (refreshResponse?.token) {
                try {
                  const userData = await apiService.getCurrentUser();
                  if (userData) {
                    setUser(userData);
                    retryCountRef.current = 0;
                    setIsLoading(false);
                    isCheckingAuthRef.current = false;
                    return;
                  } else {
                    setUser(null);
                    retryCountRef.current = 0;
                    setIsLoading(false);
                    isCheckingAuthRef.current = false;
                    return;
                  }
                } catch (retryError: any) {
                  const retryStatus = retryError?.response?.status || retryError?.status;
                  if (retryStatus === 401) {
                    console.error('Failed to get user after refresh - invalid token:', retryError);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('tenantId');
                    setUser(null);
                    setIsLoading(false);
                    isCheckingAuthRef.current = false;
                    return;
                  } else {
                    console.error('Failed to get user after refresh - network error:', retryError);
                    setIsLoading(false);
                    isCheckingAuthRef.current = false;
                    return;
                  }
                }
              } else {
                console.error('Token refresh failed - no token in response');
                setIsLoading(false);
                isCheckingAuthRef.current = false;
                return;
              }
            } catch (refreshError: any) {
              const refreshStatus = refreshError?.response?.status || refreshError?.status;
              if (refreshStatus === 401) {
                console.error('Token refresh failed - tokens invalid:', refreshError);
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tenantId');
                setUser(null);
                setIsLoading(false);
                isCheckingAuthRef.current = false;
                return;
              } else {
                console.error('Token refresh failed - network error:', refreshError);
                setIsLoading(false);
                isCheckingAuthRef.current = false;
                return;
              }
            }
          } else {
            console.error('No refresh token available');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tenantId');
            setUser(null);
            setIsLoading(false);
            isCheckingAuthRef.current = false;
            return;
          }
        } else if (status && status >= 500) {
          console.error('Server error during auth check:', error);
          const existingToken = localStorage.getItem('authToken');
          if (existingToken) {
            console.warn('Server error but token exists - preserving session');
          }
          setIsLoading(false);
          isCheckingAuthRef.current = false;
          return;
        } else if (!status || status === 0) {
          console.error('Network error during auth check (offline or timeout):', error);
          const existingToken = localStorage.getItem('authToken');
          if (existingToken && retryCountRef.current < 2) {
            console.warn('Network error but token exists - retrying auth check...');
            retryCountRef.current += 1;
            isCheckingAuthRef.current = false;
            setTimeout(() => {
              checkAuth();
            }, 2000);
            return;
          } else if (existingToken) {
            console.warn('Network error but token exists - preserving session, max retries reached');
          }
          setIsLoading(false);
          isCheckingAuthRef.current = false;
          return;
        } else {
          console.error('Auth check error:', error);
          const existingToken = localStorage.getItem('authToken');
          if (existingToken && status !== 403 && status !== 401) {
            console.warn('Error during auth check but token exists - preserving session');
          }
          setIsLoading(false);
          isCheckingAuthRef.current = false;
          return;
        }
      }
    } catch (error: any) {
      console.error('Unexpected auth check error:', error);
      setIsLoading(false);
      isCheckingAuthRef.current = false;
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