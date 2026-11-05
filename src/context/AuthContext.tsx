import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearStoredToken, getStoredToken, storeToken, type User } from '../lib/api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    api.me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const result = await api.login(email, password);
      storeToken(result.token);
      setUser(result.user);
    },
    async register(name, email, password) {
      const result = await api.register(name, email, password);
      storeToken(result.token);
      setUser(result.user);
    },
    logout() {
      clearStoredToken();
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
