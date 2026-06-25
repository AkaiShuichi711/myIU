// Appwrite removed — backend is now Java Spring Boot.
// This stub prevents import errors during incremental migration.

export const appwriteConfig = {
  projectId: '',
  url: '',
  databaseId: '',
  storageId: '',
  savesCollectionId: '',
  usersCollectionId: '',
  postsCollectionId: '',
  notificationsCollectionId: '',
  commentsCollectionId: '',
  blocksCollectionId: '',
  coursesCollectionId: '',
  courseGroupsCollectionId: '',
  groupMembersCollectionId: '',
  coursePostsCollectionId: '',
  formTemplatesCollectionId: '',
  formSubmissionsCollectionId: '',
  courseGradesCollectionId: '',
};

// Stub types to avoid any import crash
export const client = { subscribe: () => () => {} } as any;
export const account = {} as any;
export const databases = {} as any;
export const storage = {} as any;
export const avatars = {} as any;
