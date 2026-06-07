import { ID, Query } from 'appwrite';
import { INewNotification, INewPost, INewUser, IUpdatePost, IUpdateUser, PaspdatePost } from '@/types';
import { account, avatars, databases, appwriteConfig, storage } from './config';

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(ID.unique(), user.email, user.Password, user.name);
    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(user.name);
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (err) {
    console.log(err);
  }
}

export async function signInAccount(user: { email: string; Password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.Password);
    return session;
  } catch (err) {
    console.log(err);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );
    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession('cookieFallback');
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function signInWithMicrosoft(
  accessToken: string,
  msalUser: any,
  roles: string[] = [],
  groups: Array<{ id: string; displayName: string }> = []
) {
  try {
    const existingUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('email', msalUser.mail || msalUser.userPrincipalName)]
    );

    if (existingUser.documents.length > 0) {
      const existing = existingUser.documents[0];
      const needsUpdate =
        JSON.stringify(existing.roles || []) !== JSON.stringify(roles) ||
        JSON.stringify(existing.groups || []) !== JSON.stringify(groups);
      if (needsUpdate) {
        try {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            existing.$id,
            { roles, groups }
          );
        } catch (err) {
          console.log('Failed to update roles/groups for existing user', err);
        }
      }
      return { ...existing, roles, groups } as any;
    }

    const avatarUrl = avatars.getInitials(msalUser.displayName);
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        accountId: msalUser.id,
        name: msalUser.displayName,
        email: msalUser.mail || msalUser.userPrincipalName,
        username: msalUser.mailNickname || msalUser.mail?.split('@')[0],
        imageUrl: avatarUrl,
        roles,
        groups,
        bio: '',
        authProvider: 'microsoft',
      }
    );
    return newUser;
  } catch (error) {
    console.log('Error signing in with Microsoft:', error);
    throw error;
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getAllUsers(limit?: number) {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    if (limit) queries.push(Query.limit(limit));
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      queries
    );
    if (!users) throw Error;
    return users;
  } catch (error) {
    console.log(error);
  }
}

export async function getUsersPaginated(page: number, limit: number) {
  try {
    const offset = (page - 1) * limit;
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset(offset)]
    );
    return { total: response.total, documents: response.documents };
  } catch (error) {
    console.error(error);
    return { total: 0, documents: [] };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId
    );
    if (!user) throw Error;
    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = { imageUrl: user.imageUrl, imageId: user.imageId };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
      image = { imageUrl: String(fileUrl), imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      user.userId,
      { name: user.name, bio: user.bio, imageUrl: image.imageUrl, imageId: image.imageId }
    );

    if (!updatedUser && hasFileToUpdate && image.imageId) {
      await deleteFile(image.imageId);
      throw Error;
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
    );
    if (!posts) throw Error;
    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserPostsPaginated(userId: string, page: number, limit: number) {
  try {
    const offset = (page - 1) * limit;
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset(offset)]
    );
    return { total: response.total, documents: response.documents };
  } catch (error) {
    console.error(error);
    return { total: 0, documents: [] };
  }
}

export async function searchUsers(searchTerm: string) {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.search('name', searchTerm)]
    );
    if (!users) throw Error;
    return users;
  } catch (error) {
    console.log(error);
  }
}

// ─── FILES ────────────────────────────────────────────────────────────────────

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(appwriteConfig.storageId, ID.unique(), file);
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export async function getFilePreview(fileId: string) {
  try {
    const fileUrl = await storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      'top',
      100
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export function getFileViewUrl(fileId: string): string {
  return storage.getFileView(appwriteConfig.storageId, fileId).toString();
}

export function getMediaCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType === 'application/msword') return 'word';
  if (mimeType.includes('excel') || mimeType === 'application/vnd.ms-excel') return 'excel';
  if (mimeType.includes('powerpoint') || mimeType === 'application/vnd.ms-powerpoint') return 'ppt';
  return 'file';
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

// ─── POSTS ────────────────────────────────────────────────────────────────────

export async function createPost(post: INewPost) {
  try {
    const files = post.files || [];
    if (!files.length) throw Error('No files provided');

    const uploaded = (await Promise.all(files.map((f) => uploadFile(f)))).filter(Boolean) as any[];
    if (!uploaded.length) throw Error('All uploads failed');

    const mediaData = await Promise.all(
      uploaded.map(async (uf, i) => {
        const mime = files[i]?.type || '';
        const isImage = mime.startsWith('image/');
        const url = isImage ? String(await getFilePreview(uf.$id)) : getFileViewUrl(uf.$id);
        return { id: uf.$id, url, type: getMediaCategory(mime) };
      })
    );

    const first = mediaData[0];
    const tags = post.tags?.replace(/ /g, '').split(',').filter(Boolean) || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: first.url,
        imageId: first.id,
        mediaUrls: mediaData.map((m) => m.url),
        mediaIds: mediaData.map((m) => m.id),
        mediaTypes: mediaData.map((m) => m.type),
        location: post.location,
        tags,
      }
    );

    if (!newPost) {
      await Promise.all(uploaded.map((uf) => deleteFile(uf.$id)));
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    );
    if (!posts) throw Error;
    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      { likes: likesArray }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const savedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      { post: postId, user: userId }
    );
    if (!savedPost) throw Error;
    return savedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );
    if (!statusCode) throw Error;
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );
    if (!post) throw Error;
    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  try {
    let image = { imageUrl: post.imageUrl, imageId: post.imageId };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;
      const fileUrl = String(await getFilePreview(uploadedFile.$id));
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
      image = { imageUrl: String(fileUrl), imageId: uploadedFile.$id };
    }

    const tags = post.tags?.replace(/ /g, '').split(',').filter(Boolean) || [];

    // FIX: use post.postId instead of ID.unique()
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags,
      }
    );

    if (!updatedPost) {
      if (hasFileToUpdate) await deleteFile(image.imageId);
      throw Error;
    }

    if (hasFileToUpdate) await deleteFile(post.imageId);

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  try {
    if (!postId || !imageId) throw Error;
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );
    await deleteFile(imageId);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam = '' }: { pageParam: string }) {
  const queries: string[] = [Query.orderDesc('$updatedAt'), Query.limit(9)];
  if (pageParam !== '') {
    queries.push(Query.cursorAfter(pageParam));
  }
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    queries
  );
  return posts.documents;
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search('caption', searchTerm)]
    );
    if (!posts) throw Error;
    return posts.documents;
  } catch (error) {
    console.log(error);
  }
}

export async function getSavedPosts(userId: string) {
  try {
    const savedPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal('user', userId), Query.orderDesc('$createdAt')]
    );
    if (!savedPosts) throw Error;
    return savedPosts.documents;
  } catch (error) {
    console.log(error);
  }
}

// ─── USER PRIVACY ─────────────────────────────────────────────────────────────

export async function updateUserPrivacy(userId: string, isPrivate: boolean) {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    userId,
    { isPrivate }
  );
}

export async function getUserByUsername(username: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('username', username), Query.limit(1)]
    );
    return result.documents[0] || null;
  } catch {
    return null;
  }
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
// Appwrite collection: comments
// Attributes: postId (string), userId (string), authorName (string),
//             authorImage (string), body (string), taggedUsers (string[])

export async function createComment(data: {
  postId: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  body: string;
  taggedUsers?: string[];
}) {
  if (!appwriteConfig.commentsCollectionId) throw new Error('Comments collection not configured');
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    ID.unique(),
    {
      postId: data.postId,
      userId: data.userId,
      authorName: data.authorName,
      authorImage: data.authorImage || '',
      body: data.body,
      taggedUsers: data.taggedUsers || [],
    }
  );
}

export async function getPostComments(postId: string) {
  if (!appwriteConfig.commentsCollectionId) return [];
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal('postId', postId), Query.orderAsc('$createdAt'), Query.limit(100)]
    );
    return result.documents;
  } catch {
    return [];
  }
}

export async function deleteComment(commentId: string) {
  if (!appwriteConfig.commentsCollectionId) return;
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.commentsCollectionId,
    commentId
  );
}

export async function getUserComments(userId: string) {
  if (!appwriteConfig.commentsCollectionId) return [];
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]
    );
    return result.documents;
  } catch {
    return [];
  }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
// Appwrite collection: notifications
// Attributes: userId (string), type (string), actorId (string), actorName (string),
//             postId (string), commentId (string), message (string), read (boolean)

export async function createNotification(notif: INewNotification) {
  if (!appwriteConfig.notificationsCollectionId) return null;
  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      { ...notif, read: false }
    );
  } catch {
    return null;
  }
}

export async function getNotifications(userId: string) {
  if (!appwriteConfig.notificationsCollectionId) return [];
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]
    );
    return result.documents;
  } catch {
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  if (!appwriteConfig.notificationsCollectionId) return null;
  try {
    return await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { read: true }
    );
  } catch {
    return null;
  }
}

export async function markAllNotificationsRead(userId: string) {
  if (!appwriteConfig.notificationsCollectionId) return;
  try {
    const unread = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal('userId', userId), Query.equal('read', false), Query.limit(100)]
    );
    await Promise.all(
      unread.documents.map((n) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.notificationsCollectionId,
          n.$id,
          { read: true }
        )
      )
    );
  } catch {
    /* silent */
  }
}

// ─── BLOCKS ───────────────────────────────────────────────────────────────────
// Appwrite collection: blocks
// Attributes: blockerId (string), blockedId (string), blockedName (string)

export async function blockUser(blockerId: string, blockedId: string, blockedName: string) {
  if (!appwriteConfig.blocksCollectionId) throw new Error('Blocks collection not configured');
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.blocksCollectionId,
    ID.unique(),
    { blockerId, blockedId, blockedName }
  );
}

export async function unblockUser(blockDocId: string) {
  if (!appwriteConfig.blocksCollectionId) return;
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.blocksCollectionId,
    blockDocId
  );
}

export async function getBlockedUsers(blockerId: string) {
  if (!appwriteConfig.blocksCollectionId) return [];
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.blocksCollectionId,
      [Query.equal('blockerId', blockerId), Query.orderDesc('$createdAt')]
    );
    return result.documents;
  } catch {
    return [];
  }
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────

export async function getUserLikedPosts(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.contains('likes', [userId]), Query.orderDesc('$updatedAt'), Query.limit(30)]
    );
    return result.documents;
  } catch {
    return [];
  }
}

export async function getAccountSessions() {
  try {
    return await account.listSessions();
  } catch {
    return { sessions: [] };
  }
}
