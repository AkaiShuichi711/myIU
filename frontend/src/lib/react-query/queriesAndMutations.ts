import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  createUserAccount,
  signInAccount,
  getAllUsers,
  getUsersPaginated,
  getUserById,
  getUserPosts,
  getUserPostsPaginated,
  updateUser,
  searchUsers,
  createPost,
  getRecentPosts,
  getPostById,
  getInfinitePosts,
  updatePost,
  deletePost,
  likePost,
  savePost,
  deleteSavedPost,
  getSavedPosts,
  searchPosts,
  // Phase 2
  createComment,
  getPostComments,
  deleteComment,
  getUserComments,
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  blockUser,
  unblockUser,
  getBlockedUsers,
  updateUserPrivacy,
  getUserLikedPosts,
  getAccountSessions,
} from '../appwrite/api';
import { INewNotification, INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types';

export const QUERY_KEYS = {
  GET_CURRENT_USER: 'getCurrentUser',
  GET_USERS: 'getUsers',
  GET_USER_BY_ID: 'getUserById',
  GET_USER_POSTS: 'getUserPosts',
  GET_RECENT_POSTS: 'getRecentPosts',
  GET_POSTS: 'getPosts',
  GET_POST_BY_ID: 'getPostById',
  GET_INFINITE_POSTS: 'getInfinitePosts',
  GET_SAVED_POSTS: 'getSavedPosts',
  SEARCH_POSTS: 'searchPosts',
  SEARCH_USERS: 'searchUsers',
  // Phase 2
  GET_POST_COMMENTS: 'getPostComments',
  GET_NOTIFICATIONS: 'getNotifications',
  GET_BLOCKED_USERS: 'getBlockedUsers',
  GET_USER_LIKED_POSTS: 'getUserLikedPosts',
  GET_USER_COMMENTS: 'getUserComments',
  GET_ACCOUNT_SESSIONS: 'getAccountSessions',
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const useCreateUserAccount = () =>
  useMutation({ mutationFn: (user: INewUser) => createUserAccount(user) });

export const useSignInAccount = () =>
  useMutation({
    mutationFn: (user: { email: string; Password: string }) => signInAccount(user),
  });

// ─── USERS ────────────────────────────────────────────────────────────────────

export const useGetAllUsers = (limit?: number) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USERS, limit],
    queryFn: () => getAllUsers(limit),
  });

export const useGetUsersPaginated = (page: number, limit: number) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USERS, 'paginated', page, limit],
    queryFn: () => getUsersPaginated(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

export const useGetUserById = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

export const useGetUserPosts = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });

export const useGetUserPostsPaginated = (userId: string, page: number, limit: number) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId, 'paginated', page, limit],
    queryFn: () => getUserPostsPaginated(userId, page, limit),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  });

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id] });
    },
  });
};

export const useSearchUsers = (searchTerm: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.SEARCH_USERS, searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: !!searchTerm,
  });

// ─── POSTS ────────────────────────────────────────────────────────────────────

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_INFINITE_POSTS] });
    },
  });
};

export const useGetRecentPosts = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });

export const useGetPostById = (postId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

export const useGetInfinitePosts = () =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: ({ pageParam }: { pageParam: string }) => getInfinitePosts({ pageParam }),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || lastPage.length === 0) return null;
      return lastPage[lastPage.length - 1].$id;
    },
    initialPageParam: '',
  });

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_INFINITE_POSTS] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_INFINITE_POSTS] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) =>
      likePost(postId, likesArray),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_INFINITE_POSTS] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      savePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SAVED_POSTS] });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SAVED_POSTS] });
    },
  });
};

export const useGetSavedPosts = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_POSTS, userId],
    queryFn: () => getSavedPosts(userId),
    enabled: !!userId,
  });

export const useSearchPosts = (searchTerm: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export const useGetPostComments = (postId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
    queryFn: () => getPostComments(postId),
    enabled: !!postId,
  });

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createComment>[0]) => createComment(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_COMMENTS, vars.postId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
      deleteComment(commentId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_COMMENTS, vars.postId] });
    },
  });
};

export const useGetUserComments = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_COMMENTS, userId],
    queryFn: () => getUserComments(userId),
    enabled: !!userId,
  });

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export const useGetNotifications = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30s as lightweight realtime fallback
  });

export const useCreateNotification = () =>
  useMutation({
    mutationFn: (notif: INewNotification) => createNotification(notif),
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notifId, userId }: { notifId: string; userId: string }) =>
      markNotificationRead(notifId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, vars.userId] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => markAllNotificationsRead(userId),
    onSuccess: (_d, userId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId] });
    },
  });
};

// ─── BLOCKS ───────────────────────────────────────────────────────────────────

export const useGetBlockedUsers = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_BLOCKED_USERS, userId],
    queryFn: () => getBlockedUsers(userId),
    enabled: !!userId,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockerId, blockedId, blockedName }: { blockerId: string; blockedId: string; blockedName: string }) =>
      blockUser(blockerId, blockedId, blockedName),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BLOCKED_USERS, vars.blockerId] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockDocId, blockerId }: { blockDocId: string; blockerId: string }) =>
      unblockUser(blockDocId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BLOCKED_USERS, vars.blockerId] });
    },
  });
};

// ─── PRIVACY ──────────────────────────────────────────────────────────────────

export const useUpdateUserPrivacy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isPrivate }: { userId: string; isPrivate: boolean }) =>
      updateUserPrivacy(userId, isPrivate),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID, vars.userId] });
    },
  });
};

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────

export const useGetUserLikedPosts = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_LIKED_POSTS, userId],
    queryFn: () => getUserLikedPosts(userId),
    enabled: !!userId,
  });

export const useGetAccountSessions = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_ACCOUNT_SESSIONS],
    queryFn: getAccountSessions,
  });
