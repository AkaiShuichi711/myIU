import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  submitAssignment, getAssignmentSubmissions, getMySubmission, gradeSubmission,
  getAttendance, getMyAttendance, upsertAttendance, bulkUpsertAttendance, deleteAttendanceRecord,
  getAllCourseMembers,
  createUserAccount,
  signInAccount,
  getAllUsers,
  // Phase 3 – Courses
  createCourse,
  getCourseById,
  getAllCourses,
  getCoursesByLecturer,
  getCoursesByStudent,
  updateCourse,
  createCourseGroup,
  getCourseGroups,
  getLecturerGroupsInCourse,
  deleteCourseGroup,
  addGroupMember,
  getGroupMembers,
  getStudentGroupsInCourse,
  removeGroupMember,
  createCoursePost,
  getCoursePosts,
  deleteCoursePost,
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
  revokeSession,
  revokeOtherSessions,
  // Phase 4 – Forms
  getFormTemplates,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
  createFormSubmission,
  getFormSubmissionsByUser,
  getFormSubmissionsForApprover,
  getFormSubmissionById,
  updateFormSubmission,
  // Phase 4 – Grades
  getCourseGrades,
  getStudentGrade,
  upsertCourseGrades,
  // Support
  createSupportTicket,
  getMySupportTickets,
  getTimetable,
  getCourseSchedules,
  createCourseSchedule,
  deleteCourseSchedule,
} from '../appwrite/api';
import { INewNotification, INewPost, INewUser, IUpdatePost, IUpdateUser, INewCourse, INewCourseGroup, INewGroupMember, INewCoursePost, INewFormTemplate, IUpdateFormTemplate, INewFormSubmission, IUpdateFormSubmission, IUpsertCourseGrade, INewSupportTicket } from '@/types';

export const QUERY_KEYS = {
  // Phase 4 – Forms
  GET_FORM_TEMPLATES:             'getFormTemplates',
  GET_FORM_SUBMISSIONS_BY_USER:   'getFormSubmissionsByUser',
  GET_FORM_SUBMISSIONS_APPROVER:  'getFormSubmissionsForApprover',
  GET_FORM_SUBMISSION_BY_ID:      'getFormSubmissionById',
  // Phase 4 – Grades
  GET_COURSE_GRADES:              'getCourseGrades',
  GET_STUDENT_GRADE:              'getStudentGrade',
  GET_MY_SUPPORT_TICKETS:         'getMySupportTickets',
  // Phase 3 – Courses
  GET_COURSES_BY_LECTURER: 'getCoursesByLecturer',
  GET_COURSES_BY_STUDENT:  'getCoursesByStudent',
  GET_ALL_COURSES:         'getAllCourses',
  GET_COURSE_BY_ID:        'getCourseById',
  GET_COURSE_GROUPS:       'getCourseGroups',
  GET_LECTURER_GROUPS:     'getLecturerGroupsInCourse',
  GET_GROUP_MEMBERS:       'getGroupMembers',
  GET_STUDENT_GROUPS:      'getStudentGroupsInCourse',
  GET_COURSE_POSTS:        'getCoursePosts',
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
    onSuccess: (_data: any, vars: IUpdateUser) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID, vars.userId] });
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
    queryFn: ({ pageParam }: { pageParam: number }) => getInfinitePosts({ pageParam }),
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (!lastPage || lastPage.length === 0) return null;
      return allPages.length;
    },
    initialPageParam: 0,
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
    refetchInterval: 300_000, // 5-min fallback — WebSocket handles real-time
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

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ACCOUNT_SESSIONS] }),
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ACCOUNT_SESSIONS] }),
  });
};

// ─── COURSES ──────────────────────────────────────────────────────────────────

export const useGetCoursesByLecturer = (userId: string, enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSES_BY_LECTURER, userId],
    queryFn: () => getCoursesByLecturer(userId),
    enabled: !!userId && enabled,
  });

export const useGetCoursesByStudent = (userId: string, enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSES_BY_STUDENT, userId],
    queryFn: () => getCoursesByStudent(userId),
    enabled: !!userId && enabled,
  });

export const useGetAllCourses = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_COURSES],
    queryFn: getAllCourses,
  });

export const useGetCourseById = (courseId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSE_BY_ID, courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewCourse) => createCourse(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES_BY_LECTURER, vars.creatorId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_ALL_COURSES] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => updateCourse(courseId, data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_BY_ID, vars.courseId] });
    },
  });
};

// ─── COURSE GROUPS ────────────────────────────────────────────────────────────

export const useGetCourseGroups = (courseId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSE_GROUPS, courseId],
    queryFn: () => getCourseGroups(courseId),
    enabled: !!courseId,
  });

export const useGetLecturerGroupsInCourse = (courseId: string, lecturerId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_LECTURER_GROUPS, courseId, lecturerId],
    queryFn: () => getLecturerGroupsInCourse(courseId, lecturerId),
    enabled: !!courseId && !!lecturerId,
  });

export const useCreateCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewCourseGroup) => createCourseGroup(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_GROUPS, vars.courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LECTURER_GROUPS, vars.courseId, vars.lecturerId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES_BY_LECTURER, vars.lecturerId] });
    },
  });
};

export const useDeleteCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, courseId }: { groupId: string; courseId: string }) => deleteCourseGroup(groupId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_GROUPS, vars.courseId] });
    },
  });
};

// ─── GROUP MEMBERS ────────────────────────────────────────────────────────────

export const useGetGroupMembers = (groupId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_GROUP_MEMBERS, groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  });

export const useGetStudentGroupsInCourse = (courseId: string, studentId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_STUDENT_GROUPS, courseId, studentId],
    queryFn: () => getStudentGroupsInCourse(courseId, studentId),
    enabled: !!courseId && !!studentId,
  });

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewGroupMember) => addGroupMember(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_MEMBERS, vars.groupId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES_BY_STUDENT, vars.studentId] });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, groupId }: { memberId: string; groupId: string }) => removeGroupMember(memberId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_GROUP_MEMBERS, vars.groupId] });
    },
  });
};

// ─── COURSE POSTS ─────────────────────────────────────────────────────────────

export const useGetCoursePosts = (courseId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSE_POSTS, courseId],
    queryFn: () => getCoursePosts(courseId),
    enabled: !!courseId,
  });

export const useCreateCoursePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewCoursePost) => createCoursePost(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_POSTS, vars.courseId] });
    },
  });
};

export const useDeleteCoursePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, courseId }: { postId: string; courseId: string }) => deleteCoursePost(postId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_POSTS, vars.courseId] });
    },
  });
};

// ─── FORM TEMPLATES ───────────────────────────────────────────────────────────

export const useGetFormTemplates = () =>
  useQuery({ queryKey: [QUERY_KEYS.GET_FORM_TEMPLATES], queryFn: getFormTemplates });

export const useCreateFormTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewFormTemplate) => createFormTemplate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_FORM_TEMPLATES] }),
  });
};

export const useUpdateFormTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateFormTemplate) => updateFormTemplate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_FORM_TEMPLATES] }),
  });
};

export const useDeleteFormTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFormTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_FORM_TEMPLATES] }),
  });
};

// ─── FORM SUBMISSIONS ─────────────────────────────────────────────────────────

export const useCreateFormSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewFormSubmission) => createFormSubmission(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_FORM_SUBMISSIONS_BY_USER, vars.submitterId] });
    },
  });
};

export const useGetFormSubmissionsByUser = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_FORM_SUBMISSIONS_BY_USER, userId],
    queryFn: () => getFormSubmissionsByUser(userId),
    enabled: !!userId,
  });

export const useGetFormSubmissionsForApprover = (email: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_FORM_SUBMISSIONS_APPROVER, email],
    queryFn: () => getFormSubmissionsForApprover(email),
    enabled: !!email,
  });

export const useGetFormSubmissionById = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_FORM_SUBMISSION_BY_ID, id],
    queryFn: () => getFormSubmissionById(id),
    enabled: !!id,
  });

export const useUpdateFormSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateFormSubmission) => updateFormSubmission(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_FORM_SUBMISSION_BY_ID, vars.id] });
    },
  });
};

// ─── Grades ───────────────────────────────────────────────────────────────────

export const useGetCourseGrades = (courseId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_COURSE_GRADES, courseId],
    queryFn: () => getCourseGrades(courseId),
    enabled: !!courseId,
  });

export const useGetStudentGrade = (courseId: string, studentId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_STUDENT_GRADE, courseId, studentId],
    queryFn: () => getStudentGrade(courseId, studentId),
    enabled: !!courseId && !!studentId,
  });

export const useUpsertCourseGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grades: IUpsertCourseGrade[]) => upsertCourseGrades(grades),
    onSuccess: (_d, vars) => {
      if (vars.length > 0) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSE_GRADES, vars[0].courseId] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_STUDENT_GRADE, vars[0].courseId] });
      }
    },
  });
};

// ─── Support ──────────────────────────────────────────────────────────────────

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: INewSupportTicket) => createSupportTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_MY_SUPPORT_TICKETS] });
    },
  });
};

export const useGetMySupportTickets = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_MY_SUPPORT_TICKETS],
    queryFn: getMySupportTickets,
  });

// ─── Timetable ────────────────────────────────────────────────────────────────

export const useGetTimetable = () =>
  useQuery({
    queryKey: ['timetable'],
    queryFn: getTimetable,
  });

export const useGetCourseSchedules = (courseId: string) =>
  useQuery({
    queryKey: ['courseSchedules', courseId],
    queryFn: () => getCourseSchedules(courseId),
    enabled: !!courseId,
  });

export const useCreateCourseSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) =>
      createCourseSchedule(courseId, data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['courseSchedules', vars.courseId] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
};

export const useDeleteCourseSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, courseId }: { scheduleId: string; courseId: string }) =>
      deleteCourseSchedule(scheduleId),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['courseSchedules', vars.courseId] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
};

// ─── ASSIGNMENT SUBMISSIONS ───────────────────────────────────────────────────

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { coursePostId: string; fileUrl?: string; fileId?: string; fileName?: string; textContent?: string }) =>
      submitAssignment(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['mySubmission', vars.coursePostId] });
    },
  });
};

export const useGetAssignmentSubmissions = (coursePostId: string) =>
  useQuery({
    queryKey: ['submissions', coursePostId],
    queryFn: () => getAssignmentSubmissions(coursePostId),
    enabled: !!coursePostId,
  });

export const useGetMySubmission = (coursePostId: string) =>
  useQuery({
    queryKey: ['mySubmission', coursePostId],
    queryFn: () => getMySubmission(coursePostId),
    enabled: !!coursePostId,
  });

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { score?: number; feedback?: string } }) =>
      gradeSubmission(id, data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

export const useGetAttendance = (courseId: string, date?: string, studentId?: string) =>
  useQuery({
    queryKey: ['attendance', courseId, date, studentId],
    queryFn: () => getAttendance(courseId, date, studentId),
    enabled: !!courseId,
  });

export const useGetMyAttendance = (courseId: string) =>
  useQuery({
    queryKey: ['myAttendance', courseId],
    queryFn: () => getMyAttendance(courseId),
    enabled: !!courseId,
  });

export const useUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courseId: string; studentId: string; studentName: string; date: string; status: string; note?: string }) =>
      upsertAttendance(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', vars.courseId] });
    },
  });
};

export const useBulkUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courseId: string; date: string; records: { studentId: string; studentName: string; status: string; note?: string }[] }) =>
      bulkUpsertAttendance(data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', vars.courseId] });
    },
  });
};

export const useDeleteAttendanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) =>
      deleteAttendanceRecord(id),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', vars.courseId] });
    },
  });
};


export const useGetAllCourseMembers = (courseId: string) =>
  useQuery({
    queryKey: ['allCourseMembers', courseId],
    queryFn: () => getAllCourseMembers(courseId),
    enabled: !!courseId,
  });
