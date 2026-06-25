import { IContextType, Passer } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, clearToken, getToken, norm, setAuthProvider, getAuthProvider, clearAuthProvider } from "@/lib/api/client";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
  roles: [] as string[],
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
  signIn: async () => {},
  signOut: async () => {},
  getProfileData: async () => ({}),
  getTenantData: async () => ({}),
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Passer>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const checkAuthUser = async () => {
    try {
      setIsLoading(true);
      if (!getToken()) {
        setIsAuthenticated(false);
        return false;
      }
      const me = await api.get<any>('/api/auth/me');
      if (me?.id) {
        const u = norm(me);
        setUser({
          id: u.id,
          name: u.name || '',
          username: u.username || '',
          email: u.email || '',
          imageUrl: u.imageUrl || '',
          bio: u.bio || '',
          roles: Array.isArray(u.roles) ? u.roles : [],
        });
        setIsAuthenticated(true);
        return true;
      }
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.log(error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<any>('/api/auth/login', { email, password });
    if (res?.token) {
      setToken(res.token);
      setAuthProvider('local');
      setUser({
        id: res.id,
        name: res.name || '',
        username: res.username || '',
        email: res.email || '',
        imageUrl: res.imageUrl || '',
        bio: res.bio || '',
        roles: Array.isArray(res.roles) ? res.roles : [],
      });
      setIsAuthenticated(true);
    }
  };

  const TENANT = 'a7380202-eb54-415a-9b66-4d9806cfab42';
  const MS_LOGOUT = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/logout`
    + `?post_logout_redirect_uri=${encodeURIComponent('http://localhost:5173/sign-in')}`;

  const signOut = async () => {
    const provider = getAuthProvider();
    clearToken();
    clearAuthProvider();
    setUser(INITIAL_USER);
    setIsAuthenticated(false);
    if (provider === 'microsoft') {
      // Clear Microsoft SSO session so next login shows the Microsoft page
      window.location.href = MS_LOGOUT;
    } else {
      navigate('/sign-in');
    }
  };

  const value: IContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    signIn: signIn as any,
    signOut,
    getProfileData: async () => ({}),
    getTenantData: async () => ({}),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);
