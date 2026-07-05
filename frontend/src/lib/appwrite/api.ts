// ─── Spring Boot REST API — replaces Appwrite SDK calls ───────────────────────
import { api, upload, norm, normList } from '@/lib/api/client';
import type {
  INewNotification, INewPost, INewUser, IUpdatePost, IUpdateUser,
  INewCourse, INewCourseGroup, INewGroupMember, INewCoursePost,
  INewFormTemplate, IUpdateFormTemplate, INewFormSubmission,
  IUpdateFormSubmission, IUpsertCourseGrade, INewSupportTicket,
} from '@/types';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function createUserAccount(user: INewUser) {
  try {
    return await api.post('/api/auth/register', {
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.Password,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
}

/** @deprecated use AuthContext signIn instead */
export async function signInAccount(user: { email: string; Password: string }) {
  try {
    return await api.post('/api/auth/login', { email: user.email, password: user.Password });
  } catch (err) {
    console.log(err);
  }
}

export async function getCurrentUser() {
  try {
    const res = await api.get<any>('/api/auth/me');
    return norm(res);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signOutAccount() {
  // JWT is stateless; just clear token on the client side
  const { clearToken } = await import('@/lib/api/client');
  clearToken();
  return { status: 'ok' };
}

/** Microsoft SSO — handled server-side; not needed in local mode */
export async function signInWithMicrosoft(_accessToken: string, _msalUser: any, _roles?: string[], _groups?: any[]) {
  throw new Error('Microsoft SSO is not available in local mode');
}

export async function saveUserToDB(_user: any) {
  // no-op: registration now happens in createUserAccount
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getAllUsers(limit?: number) {
  try {
    const users = await api.get<any[]>('/api/users/search?q=');
    const docs = normList(users).slice(0, limit);
    return { total: docs.length, documents: docs };
  } catch (error) {
    console.log(error);
    return { total: 0, documents: [] };
  }
}

export async function getUsersPaginated(page: number, limit: number) {
  try {
    const users = await api.get<any[]>('/api/users/search?q=');
    const all = normList(users);
    const offset = (page - 1) * limit;
    return { total: all.length, documents: all.slice(offset, offset + limit) };
  } catch (error) {
    console.error(error);
    return { total: 0, documents: [] };
  }
}

export async function getUserById(userId: string) {
  try {
    return norm(await api.get<any>(`/api/users/${userId}`));
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByUsername(username: string) {
  try {
    return norm(await api.get<any>(`/api/users/by-username/${username}`));
  } catch {
    return null;
  }
}

export async function updateUser(user: IUpdateUser) {
  try {
    let imageUrl = user.imageUrl;
    if (user.file?.length > 0) {
      imageUrl = await upload(`/api/users/${user.userId}/avatar`, user.file[0]);
    }
    return norm(await api.put<any>(`/api/users/${user.userId}`, {
      name: user.name,
      bio: user.bio,
      imageUrl,
    }));
  } catch (error) {
    console.log(error);
  }
}

export async function updateUserPrivacy(userId: string, isPrivate: boolean) {
  return norm(await api.put<any>(`/api/users/${userId}`, { isPrivate }));
}

export async function searchUsers(searchTerm: string) {
  try {
    const users = await api.get<any[]>(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
    return { total: users.length, documents: normList(users) };
  } catch (error) {
    console.log(error);
    return { total: 0, documents: [] };
  }
}

export async function getUserPosts(userId: string) {
  try {
    const res = await api.get<any>(`/api/posts/user/${userId}?page=0&size=50`);
    return { total: res.totalElements ?? 0, documents: normList(res.content ?? []) };
  } catch (error) {
    console.log(error);
    return { total: 0, documents: [] };
  }
}

export async function getUserPostsPaginated(userId: string, page: number, limit: number) {
  try {
    const res = await api.get<any>(`/api/posts/user/${userId}?page=${page - 1}&size=${limit}`);
    return { total: res.totalElements ?? 0, documents: normList(res.content ?? []) };
  } catch (error) {
    console.error(error);
    return { total: 0, documents: [] };
  }
}

// ─── FILES ────────────────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ $id: string; url: string } | undefined> {
  try {
    const url = await upload('/api/posts/upload-image', file);
    return { $id: url, url };
  } catch (error) {
    console.log(error);
  }
}

export async function getFilePreview(fileIdOrUrl: string) {
  return fileIdOrUrl;
}

export function getFileViewUrl(fileIdOrUrl: string): string {
  return fileIdOrUrl;
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

export async function deleteFile(_fileId: string) {
  return { status: 'ok' };
}

// ─── POSTS ────────────────────────────────────────────────────────────────────

export async function createPost(post: INewPost) {
  try {
    const files = post.files || [];
    const imageUrls: string[] = await Promise.all(
      files.map((f) => upload('/api/posts/upload-image', f))
    );
    const tags = post.tags?.replace(/ /g, '').split(',').filter(Boolean) || [];
    return norm(await api.post<any>('/api/posts', {
      caption: post.caption,
      location: post.location,
      tags,
      imageUrls,
    }));
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const res = await api.get<any>('/api/posts?page=0&size=20');
    return { total: res.totalElements ?? 0, documents: normList(res.content ?? []) };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

export async function getInfinitePosts({ pageParam = 0 }: { pageParam: number }) {
  const res = await api.get<any>(`/api/posts?page=${pageParam}&size=9`);
  return normList(res.content ?? []);
}

export async function searchPosts(searchTerm: string) {
  try {
    // search by fetching all and filtering locally (server-side search can be added later)
    const res = await api.get<any>('/api/posts?page=0&size=100');
    const posts = normList(res.content ?? []);
    return posts.filter((p: any) =>
      p.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getPostById(postId: string) {
  try {
    return norm(await api.get<any>(`/api/posts/${postId}`));
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  try {
    let imageUrls: string[] | undefined;
    if (post.file?.length > 0) {
      imageUrls = await Promise.all(
        post.file.map((f: File) => upload('/api/posts/upload-image', f))
      );
    }
    const tags = post.tags?.replace(/ /g, '').split(',').filter(Boolean) || [];
    return norm(await api.put<any>(`/api/posts/${post.postId}`, {
      caption: post.caption,
      location: post.location,
      tags,
      ...(imageUrls ? { imageUrls } : {}),
    }));
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, _imageId?: string) {
  try {
    await api.delete(`/api/posts/${postId}`);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, _likesArray: string[]) {
  try {
    return norm(await api.post<any>(`/api/posts/${postId}/like`));
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, _userId: string) {
  try {
    await api.post(`/api/posts/${postId}/save`);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(postId: string) {
  try {
    await api.delete(`/api/posts/${postId}/save`);
    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

export async function getSavedPosts(_userId: string) {
  try {
    return normList(await api.get<any[]>('/api/posts/saved'));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserLikedPosts(_userId: string) {
  // Not implemented in backend yet; return empty
  return [];
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export async function createComment(data: {
  postId: string; userId: string; authorName: string;
  authorImage?: string; body: string; taggedUsers?: string[];
}) {
  return norm(await api.post<any>(`/api/comments/post/${data.postId}`, {
    body: data.body,
    taggedUsers: data.taggedUsers || [],
  }));
}

export async function getPostComments(postId: string) {
  try {
    return normList(await api.get<any[]>(`/api/comments/post/${postId}`));
  } catch { return []; }
}

export async function deleteComment(commentId: string) {
  return api.delete(`/api/comments/${commentId}`);
}

export async function getUserComments(_userId: string) {
  return [];
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function createNotification(notif: INewNotification) {
  try {
    return await api.post<any>('/api/notifications', notif);
  } catch { return null; }
}

export async function getNotifications(_userId: string) {
  try {
    return normList(await api.get<any[]>('/api/notifications'));
  } catch { return []; }
}

export async function markNotificationRead(_notificationId: string) {
  // Backend has no per-notification mark-read endpoint yet.
  // Fall back to mark-all so the UI state stays consistent after refetch.
  try {
    await api.post('/api/notifications/mark-all-read');
  } catch { /* silent */ }
}

export async function markAllNotificationsRead(_userId: string) {
  try {
    await api.post('/api/notifications/mark-all-read');
  } catch { /* silent */ }
}

// ─── BLOCKS ───────────────────────────────────────────────────────────────────

export async function blockUser(blockerId: string, blockedId: string, blockedName: string) {
  return api.post<any>('/api/blocks', { blockerId, blockedId, blockedName });
}

export async function unblockUser(blockDocId: string) {
  return api.delete(`/api/blocks/${blockDocId}`);
}

export async function getBlockedUsers(_blockerId: string) {
  try {
    return normList(await api.get<any[]>('/api/blocks'));
  } catch { return []; }
}

export async function getAccountSessions() {
  try {
    const res = await api.get<any>('/api/sessions');
    const sessions = res?.data ?? res ?? [];
    return { sessions: Array.isArray(sessions) ? sessions : [] };
  } catch { return { sessions: [] }; }
}

export async function revokeSession(id: string) {
  return api.delete(`/api/sessions/${id}`);
}

export async function revokeOtherSessions() {
  return api.delete('/api/sessions/others');
}

export async function sessionHeartbeat() {
  try { await api.put('/api/sessions/heartbeat'); } catch { /* ignore */ }
}

// ─── FORM TEMPLATES ───────────────────────────────────────────────────────────

export async function getFormTemplates() {
  try {
    return normList(await api.get<any[]>('/api/forms/templates'));
  } catch { return []; }
}

export async function createFormTemplate(data: INewFormTemplate) {
  return norm(await api.post<any>('/api/forms/templates', data));
}

export async function updateFormTemplate({ id, ...data }: IUpdateFormTemplate) {
  return norm(await api.put<any>(`/api/forms/templates/${id}`, data));
}

export async function deleteFormTemplate(id: string) {
  return api.delete(`/api/forms/templates/${id}`);
}

// ─── FORM SUBMISSIONS ─────────────────────────────────────────────────────────

export async function createFormSubmission(data: INewFormSubmission) {
  try {
    return norm(await api.post<any>('/api/forms/submissions', data));
  } catch (err) { console.error(err); return null; }
}

export async function getFormSubmissionsByUser(_userId: string) {
  try {
    return normList(await api.get<any[]>('/api/forms/submissions/mine'));
  } catch { return []; }
}

export async function getFormSubmissionsForApprover(email: string) {
  try {
    return normList(await api.get<any[]>(`/api/forms/submissions/approver?email=${encodeURIComponent(email)}`));
  } catch { return []; }
}

export async function getFormSubmissionById(id: string) {
  try {
    return norm(await api.get<any>(`/api/forms/submissions/${id}`));
  } catch { return null; }
}

export async function updateFormSubmission({ id, status, rejectionReason }: IUpdateFormSubmission) {
  try {
    return norm(await api.put<any>(`/api/forms/submissions/${id}`, { status, rejectionReason }));
  } catch (err) { console.error(err); return null; }
}

// ─── COURSES ──────────────────────────────────────────────────────────────────

export async function createCourse(data: INewCourse) {
  return norm(await api.post<any>('/api/courses', data));
}

export async function getCourseById(courseId: string) {
  try {
    return norm(await api.get<any>(`/api/courses/${courseId}`));
  } catch { return null; }
}

export async function getAllCourses() {
  try {
    return normList(await api.get<any[]>('/api/courses'));
  } catch { return []; }
}

export async function updateCourse(courseId: string, data: Partial<INewCourse & { isActive: boolean }>) {
  try {
    return norm(await api.put<any>(`/api/courses/${courseId}`, data));
  } catch { return null; }
}

export async function getCoursesByLecturer(userId: string) {
  try {
    return normList(await api.get<any[]>(`/api/course-groups/lecturer/${userId}/courses`));
  } catch { return []; }
}

export async function getCoursesByStudent(userId: string) {
  try {
    return normList(await api.get<any[]>(`/api/group-members/student/${userId}/courses`));
  } catch { return []; }
}

// ─── COURSE GROUPS ────────────────────────────────────────────────────────────

export async function createCourseGroup(data: INewCourseGroup) {
  return norm(await api.post<any>('/api/course-groups', data));
}

export async function getCourseGroups(courseId: string) {
  try {
    return normList(await api.get<any[]>(`/api/course-groups?courseId=${courseId}`));
  } catch { return []; }
}

export async function getLecturerGroupsInCourse(courseId: string, lecturerId: string) {
  try {
    return normList(await api.get<any[]>(`/api/course-groups?courseId=${courseId}&lecturerId=${lecturerId}`));
  } catch { return []; }
}

export async function deleteCourseGroup(groupId: string) {
  return api.delete(`/api/course-groups/${groupId}`);
}

// ─── GROUP MEMBERS ────────────────────────────────────────────────────────────

export async function addGroupMember(data: INewGroupMember) {
  return norm(await api.post<any>('/api/group-members', data));
}

export async function getGroupMembers(groupId: string) {
  try {
    return normList(await api.get<any[]>(`/api/group-members?groupId=${groupId}`));
  } catch { return []; }
}

export async function getStudentGroupsInCourse(courseId: string, studentId: string) {
  try {
    return normList(await api.get<any[]>(`/api/group-members?courseId=${courseId}&studentId=${studentId}`));
  } catch { return []; }
}

export async function removeGroupMember(memberId: string) {
  return api.delete(`/api/group-members/${memberId}`);
}

// ─── COURSE POSTS ─────────────────────────────────────────────────────────────

export async function createCoursePost(data: INewCoursePost) {
  return norm(await api.post<any>('/api/course-posts', data));
}

export async function getCoursePosts(courseId: string) {
  try {
    return normList(await api.get<any[]>(`/api/course-posts?courseId=${courseId}`));
  } catch { return []; }
}

export async function deleteCoursePost(postId: string) {
  return api.delete(`/api/course-posts/${postId}`);
}

// ─── GRADES ───────────────────────────────────────────────────────────────────

export async function getCourseGrades(courseId: string) {
  try {
    return normList(await api.get<any[]>(`/api/grades?courseId=${courseId}`));
  } catch { return []; }
}

export async function getStudentGrade(courseId: string, studentId: string) {
  try {
    return norm(await api.get<any>(`/api/grades?courseId=${courseId}&studentId=${studentId}`));
  } catch { return null; }
}

export async function upsertCourseGrade(data: IUpsertCourseGrade) {
  try {
    return norm(await api.post<any>('/api/grades', data));
  } catch (err) { console.error(err); return null; }
}

export async function upsertCourseGrades(grades: IUpsertCourseGrade[]) {
  return Promise.all(grades.map(upsertCourseGrade));
}

// ─── FORM SUBMISSION FILE UPLOAD ─────────────────────────────────────────────

export async function uploadFormSubmissionFile(submissionId: string, file: File): Promise<string | null> {
  try {
    return await upload(`/api/forms/submissions/${submissionId}/upload`, file);
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ─── SUPPORT ──────────────────────────────────────────────────────────────────

export async function createSupportTicket(data: INewSupportTicket) {
  return norm(await api.post<any>('/api/support', data));
}

export async function getMySupportTickets() {
  try {
    return normList(await api.get<any[]>('/api/support/mine'));
  } catch { return []; }
}

// ─── TIMETABLE ────────────────────────────────────────────────────────────────

export async function getTimetable() {
  try {
    return await api.get<any[]>('/api/timetable');
  } catch { return []; }
}

export async function getCourseSchedules(courseId: string) {
  try {
    return await api.get<any[]>(`/api/courses/${courseId}/schedules`);
  } catch { return []; }
}

export async function createCourseSchedule(courseId: string, data: {
  dayOfWeek: string; startTime: string; endTime: string; room?: string;
}) {
  return api.post<any>(`/api/courses/${courseId}/schedules`, data);
}

export async function deleteCourseSchedule(scheduleId: string) {
  return api.delete(`/api/course-schedules/${scheduleId}`);
}
