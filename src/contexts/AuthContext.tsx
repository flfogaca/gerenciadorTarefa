import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string; permissions: string[] } | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const { isAuth, userData } = JSON.parse(savedAuth);
      setIsAuthenticated(isAuth);
      setUser(userData);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = {
      'admin@gestorpro.com': {
        name: 'João Silva',
        email: email,
        role: 'Administrador',
        permissions: ['all']
      },
      'gestor@gestorpro.com': {
        name: 'Maria Santos',
        email: email,
        role: 'Gestor',
        permissions: ['dashboard', 'cronograma', 'tarefas', 'financeiro', 'relatorios', 'notificacoes', 'perfil']
      },
      'funcionario@gestorpro.com': {
        name: 'Pedro Costa',
        email: email,
        role: 'Funcionário',
        permissions: ['dashboard', 'cronograma', 'tarefas', 'notificacoes', 'perfil']
      },
      'diretor@gestorpro.com': {
        name: 'Ana Oliveira',
        email: email,
        role: 'Diretor',
        permissions: ['dashboard', 'financeiro', 'relatorios', 'notificacoes', 'perfil']
      }
    };

    if (password === '123456' && users[email.toLowerCase() as keyof typeof users]) {
      const userData = users[email.toLowerCase() as keyof typeof users];
      
      setIsAuthenticated(true);
      setUser(userData);
      
      localStorage.setItem('auth', JSON.stringify({
        isAuth: true,
        userData: userData
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
