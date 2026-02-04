import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI, RegisterData, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, senha: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await authAPI.login(email, senha);
        const { token, user: userData } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo(a), ${userData.nome}!`,
        });

        return true;
      } catch (error: unknown) {
        toast({
          title: 'Erro no login',
          description: getErrorMessage(error, 'Credenciais inválidas'),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      try {
        setIsLoading(true);
        await authAPI.register(data);

        const loginSuccess = await login(data.email, data.senha);
        if (!loginSuccess) {
          return false;
        }

        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Bem-vindo(a) a Rede de Companhia!',
        });

        return true;
      } catch (error: unknown) {
        toast({
          title: 'Erro no cadastro',
          description: getErrorMessage(error, 'Não foi possível criar a conta'),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [login, toast]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // JWT is stateless, so local cleanup is enough.
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    }
  }, [toast]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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


