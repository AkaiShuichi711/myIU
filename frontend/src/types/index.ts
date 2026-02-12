export type IContextType = {
  user: Passer,
  isLoading: boolean,
  isAuthenticated: boolean,
  setUser: React.Dispatch<React.SetStateAction<Passer>>,
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  checkAuthUser: () => Promise<boolean>,
  signIn: () => Promise<void>,
  signOut: () => Promise<void>,
  getProfileData: () => Promise<any>,
  getTenantData: () => Promise<any>,
}

export type Passer = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  Password: string;
};
