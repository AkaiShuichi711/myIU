import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const ADMIN_TOKEN_KEY = 'myiu_admin_token';

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(ADMIN_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!storedToken) { setIsLoading(false); return; }

    fetch('/api/admin/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: AdminUser) => { setAdmin(data); setToken(storedToken); })
      .catch(() => { localStorage.removeItem(ADMIN_TOKEN_KEY); setToken(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Login failed');
    }
    const data = await res.json() as AdminUser & { token: string };
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setToken(data.token);
    setAdmin({ id: data.id, name: data.name, email: data.email, role: data.role });
  };

  const signOut = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, signIn, signOut, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};
