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
  roles: string[];
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

export type INewNotification = Omit<INotification, '$id' | '$createdAt' | 'read'>;

// ─── Phase 4 – Forms ──────────────────────────────────────────────────────────

export type FormCategory = 'academic' | 'finance' | 'administrative' | 'other';
export type FormFileType = 'pdf' | 'docx' | 'xlsx' | 'doc' | 'ppt' | 'other';

export type IFormTemplate = {
  $id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: FormFileType;
  category: FormCategory;
  sortOrder: number;
  isActive: boolean;
  createdBy: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewFormTemplate = Omit<IFormTemplate, '$id' | '$createdAt' | '$updatedAt'>;
export type IUpdateFormTemplate = Partial<Omit<IFormTemplate, '$id' | '$createdAt' | '$updatedAt'>> & { id: string };

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type IFormSubmission = {
  $id: string;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  formTemplateId: string;
  formTitle: string;
  uploadedFileId: string;
  uploadedFileUrl: string;
  approverEmail: string;
  approverName: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewFormSubmission = Omit<IFormSubmission, '$id' | '$createdAt' | '$updatedAt' | 'status' | 'rejectionReason'>;
export type IUpdateFormSubmission = { id: string; status: SubmissionStatus; rejectionReason?: string };

// ─── Phase 4 – Grades ─────────────────────────────────────────────────────────

export type ICourseGrade = {
  $id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  quiz?: number;
  exercise?: number;
  lab?: number;
  midterm?: number;
  project?: number;
  final?: number;
  gradedBy: string;
  $createdAt: string;
  $updatedAt: string;
};

export type IUpsertCourseGrade = {
  courseId: string;
  studentId: string;
  studentName: string;
  quiz?: number;
  exercise?: number;
  lab?: number;
  midterm?: number;
  project?: number;
  final?: number;
  gradedBy: string;
};

// ─── Phase 3 – Courses ─────────────────────────────────────────────────────────

export type ICourse = {
  $id: string;
  name: string;
  code: string;
  semester: string;
  description?: string;
  coverColor: string;
  isActive: boolean;
  creatorId: string;
  $createdAt: string;
};

export type ICourseGroup = {
  $id: string;
  courseId: string;
  lecturerId: string;
  lecturerName: string;
  name: string;
  description?: string;
  $createdAt: string;
};

export type IGroupMember = {
  $id: string;
  groupId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  $createdAt: string;
};

export type ICoursePost = {
  $id: string;
  courseId: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  body?: string;
  type: 'announcement' | 'material' | 'assignment';
  attachmentUrls: string[];
  attachmentNames: string[];
  isPublished: boolean;
  dueDate?: string;
  $createdAt: string;
  $updatedAt: string;
};

export type INewCourse = {
  name: string;
  code: string;
  semester: string;
  description?: string;
  coverColor: string;
  creatorId: string;
};

export type INewCourseGroup = {
  courseId: string;
  lecturerId: string;
  lecturerName: string;
  name: string;
  description?: string;
};

export type INewGroupMember = {
  groupId: string;
  courseId: string;
  studentId: string;
  studentName: string;
};

export type INewCoursePost = {
  courseId: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  body?: string;
  type: 'announcement' | 'material' | 'assignment';
  attachmentUrls?: string[];
  attachmentNames?: string[];
  dueDate?: string;
};

export type INewSupportTicket = {
  service: string;
  need: string;
  description: string;
  attachmentUrl?: string;
};

export type SupportTicketDTO = {
  id: string;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  service: string;
  need: string;
  description: string;
  attachmentUrl: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  response: string | null;
  createdAt: string;
};
