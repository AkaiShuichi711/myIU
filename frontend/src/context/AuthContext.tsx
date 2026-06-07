import { getCurrentUser } from "@/lib/appwrite/api";
import { IContextType, Passer } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
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

  const backendUrl = (import.meta.env.VITE_OAUTH_BACKEND_URL || window.location.origin).replace(/\/+$/, '');

  const getBackendUser = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/user`, {
        credentials: 'include',
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.log('Backend auth check failed:', error);
      return null;
    }
  };

  const getBackendProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/profile`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Profile request failed: ${response.status} ${body}`);
      }

      return await response.json();
    } catch (error) {
      console.log('Backend profile fetch failed:', error);
      throw error;
    }
  };

  const getBackendTenant = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/tenant`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Tenant request failed: ${response.status} ${body}`);
      }

      return await response.json();
    } catch (error) {
      console.log('Backend tenant fetch failed:', error);
      throw error;
    }
  };

  const checkAuthUser = async () => {
    try {
      setIsLoading(true);

      const backendUser = await getBackendUser();
      if (backendUser?.id) {
        setUser({
          id: backendUser.id,
          name: backendUser.name || '',
          username: backendUser.username || '',
          email: backendUser.email || '',
          imageUrl: backendUser.imageUrl || '',
          bio: backendUser.bio || '',
        });
        setIsAuthenticated(true);
        return true;
      }

      const currentAccount = await getCurrentUser();
      console.log('Auth: ', currentAccount);

      if (currentAccount) {
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
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

  const value: IContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    signIn: async () => {},
    signOut: async () => {},
    getProfileData: async () => {
      return await getBackendProfile();
    },
    getTenantData: async () => {
      return await getBackendTenant();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);
