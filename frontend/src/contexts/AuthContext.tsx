import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, User, RegisterData } from '@/lib/api';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing auth on mount
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

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
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
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.response?.data?.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: `Bem-vindo(a) à Rede de Companhia, ${userData.nome}!`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.response?.data?.message || 'Não foi possível criar a conta',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
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
