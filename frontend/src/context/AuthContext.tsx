import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getMe()
        .then((u) => setUser(u as User))
        .catch(() => api.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    const u = await api.getMe();
    setUser(u as User);
  };

  const register = async (email: string, password: string, name: string) => {
    await api.register(email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refresh = async () => {
    if (!api.isAuthenticated()) return;
    const u = await api.getMe();
    setUser(u as User);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
