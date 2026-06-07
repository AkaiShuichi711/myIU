export type IContextType = {
  user: Passer;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<Passer>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getProfileData: () => Promise<any>;
  getTenantData: () => Promise<any>;
};

export type Passer = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type IUser = {
  $id: string;
  accountId: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  posts?: string[];
  liked?: string[];
  roles?: string[];
  authProvider?: string;
};

export type IPost = {
  $id: string;
  creator: IUser | string;
  caption: string;
  imageUrl: string;
  imageId: string;
  mediaUrls?: string[];
  mediaIds?: string[];
  mediaTypes?: string[];
  location?: string;
  tags: string[];
  likes: string[];
  $createdAt: string;
  $updatedAt: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  Password: string;
};

export type INewPost = {
  userId: string;
  caption: string;
  location: string;
  tags?: string;
  files: File[];
  imageUrl?: string;
  imageId?: string;
};

export type IUpdatePost = {
  postId: string;
  caption?: string;
  imageUrl?: string;
  imageId: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId?: string;
  imageUrl?: string;
  file: File[];
};

export type PaspdatePost = {
  postId: string;
  file: FileList | File[];
  imageUrl?: string;
  imageId: string;
  caption?: string;
  location?: string;
  tags?: string;
};

// ─── Phase 2 Types ─────────────────────────────────────────────────────────────

export type IComment = {
  $id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  body: string;
  taggedUsers?: string[];
  $createdAt: string;
};

export type INotification = {
  $id: string;
  userId: string;
  type: 'like' | 'comment' | 'mention' | 'tag';
  actorId: string;
  actorName: string;
  postId?: string;
  commentId?: string;
  message: string;
  read: boolean;
  $createdAt: string;
};

export type IBlock = {
  $id: string;
  blockerId: string;
  blockedId: string;
  blockedName: string;
  $createdAt: string;
};

export type INewNotification = Omit<INotification, '$id' | '$createdAt' | 'read'>;
