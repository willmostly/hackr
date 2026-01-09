import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AppPhase } from '@hackr/shared';
import { getSession, logout as apiLogout } from '../api/client';

interface AuthContextType {
  user: User | null;
  phase: AppPhase;
  loading: boolean;
  setUser: (user: User | null) => void;
  setPhase: (phase: AppPhase) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<AppPhase>('registration');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const session = await getSession();
      setUser(session.user);
      setPhase(session.phase);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, phase, loading, setUser, setPhase, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
