import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Megaphone, FileText, ClipboardList, Users,
  Plus, Trash2, Loader2, Calendar, Paperclip,
  BookOpen, UserPlus, X, ChevronDown, ChevronUp, BarChart3,
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetCourseById,
  useGetCourseGroups,
  useGetCoursePosts,
  useGetLecturerGroupsInCourse,
  useGetStudentGroupsInCourse,
  useCreateCoursePost,
  useDeleteCoursePost,
  useCreateCourseGroup,
  useAddGroupMember,
  useGetGroupMembers,
  useDeleteCourseGroup,
  useRemoveGroupMember,
  useGetCourseGrades,
  useGetStudentGrade,
  useUpsertCourseGrades,
} from '@/lib/react-query/queriesAndMutations';
import type { ICourseGrade, IUpsertCourseGrade } from '@/types';
import { formatTimeAgo, isLecturerRole, isAdminRole } from '@/lib/utils';
import { INPUT_CLS } from '@/constants/courses';
import UserAvatar from '@/components/shared/UserAvatar';

type Tab = 'feed' | 'materials' | 'assignments' | 'members' | 'grades';
type PostType = 'announcement' | 'material' | 'assignment';

const TYPE_META: Record<PostType, { label: string; color: string; border: string; bg: string; icon: typeof Megaphone }> = {
  announcement: {
    label: 'THÔNG BÁO',
    color: 'text-[#009CD1]',
    border: 'border-l-[3px] border-[#009CD1]',
    bg: 'bg-[#009CD1]/6 dark:bg-[#009CD1]/10',
    icon: Megaphone,
  },
  material: {
    label: 'TÀI LIỆU',
    color: 'text-slate-500 dark:text-slate-400',
    border: 'border-l-[3px] border-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-700/40',
    icon: FileText,
  },
  assignment: {
    label: 'BÀI TẬP',
    color: 'text-slate-600 dark:text-slate-300',
    border: 'border-l-[3px] border-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-700/60',
    icon: ClipboardList,
  },
};

// ── Post Card ─────────────────────────────────────────────────────────────────
const PostCard = ({
  post,
  isLecturer,
  onDelete,
}: {
  post: any;
  isLecturer: boolean;
  onDelete: (id: string) => void;
}) => {
  const meta = TYPE_META[post.type as PostType] ?? TYPE_META.announcement;
  const Icon = meta.icon;
  return (
    <div className={`bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 ${meta.border} overflow-hidden`}>
      <div className={`px-4 py-3 ${meta.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon size={13} className={meta.color} />
          <span className={`text-[10px] font-bold tracking-widest uppercase ${meta.color}`}>{meta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{formatTimeAgo(post.$createdAt)}</span>
          {isLecturer && (
            <button onClick={() => onDelete(post.$id)} className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{post.title}</h3>
        {post.body && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
        )}
        {post.dueDate && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Calendar size={12} /> Hạn nộp: {post.dueDate}
          </div>
        )}
        {post.attachmentNames?.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {post.attachmentNames.map((name: string, i: number) => (
              <a
                key={i}
                href={post.attachmentUrls?.[i] || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Paperclip size={12} className="text-slate-400" /> {name}
              </a>
            ))}
          </div>
        )}
        {post.groupId && (
          <div className="mt-2.5">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              Nhóm: {post.groupId}
            </span>
          </div>
        )}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <UserAvatar name={post.authorName || 'U'} className="w-5 h-5 text-[9px]" />
          {post.authorName}
        </div>
      </div>
    </div>
  );
};

// ── Group Panel ───────────────────────────────────────────────────────────────
const GroupPanel = ({ group, courseId, isLecturer, onDeleteGroup }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ studentId: '', studentName: '' });

  const { data: members = [], isPending } = useGetGroupMembers(expanded ? group.$id : '');
  const { mutate: addMember, isPending: isAdding } = useAddGroupMember();
  const { mutate: removeMember } = useRemoveGroupMember();

  const handleAddMember = () => {
    if (!memberForm.studentId.trim() || !memberForm.studentName.trim()) return;
    addMember(
      { groupId: group.$id, courseId, studentId: memberForm.studentId.trim(), studentName: memberForm.studentName.trim() },
      { onSuccess: () => setMemberForm({ studentId: '', studentName: '' }) },
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#009CD1] transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span className="font-mono">{group.name}</span>
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">— {group.lecturerName}</span>
        </button>
        <div className="flex items-center gap-2">
          {isLecturer && (
            <>
              <button
                onClick={() => { setExpanded(true); setShowAddMember((v) => !v); }}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#009CD1] transition-colors flex items-center gap-1"
              >
                <UserPlus size={12} /> Thêm SV
              </button>
              <button onClick={() => onDeleteGroup(group.$id)} className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 flex flex-col gap-2">
          {showAddMember && isLecturer && (
            <div className="flex gap-2 mb-2">
              <input
                value={memberForm.studentId}
                onChange={(e) => setMemberForm((f) => ({ ...f, studentId: e.target.value }))}
                placeholder="Appwrite User ID"
                className={INPUT_CLS + ' text-xs font-mono'}
              />
              <input
                value={memberForm.studentName}
                onChange={(e) => setMemberForm((f) => ({ ...f, studentName: e.target.value }))}
                placeholder="Họ tên sinh viên"
                className={INPUT_CLS + ' text-xs'}
              />
              <button
                onClick={handleAddMember}
                disabled={isAdding}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors shrink-0 disabled:opacity-60"
              >
                {isAdding ? <Loader2 size={12} className="animate-spin" /> : 'Thêm'}
              </button>
            </div>
          )}

          {isPending ? (
            <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
          ) : (members as any[]).length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">Chưa có sinh viên trong nhóm này</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              {(members as any[]).map((m) => (
                <div key={m.$id} className="flex items-center justify-between py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar name={m.studentName || '?'} className="w-6 h-6 text-[10px]" variant="muted" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{m.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{m.studentId}</p>
                    </div>
                  </div>
                  {isLecturer && (
                    <button
                      onClick={() => removeMember({ memberId: m.$id, groupId: group.$id })}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GRADE_COMPONENTS = [
  { key: 'quiz',     label: 'Quizzes',  weight: 10 },
  { key: 'exercise', label: 'Exercise', weight: 10 },
  { key: 'lab',      label: 'Lab',      weight: 15 },
  { key: 'midterm',  label: 'Midterm',  weight: 25 },
  { key: 'project',  label: 'Project',  weight: 10 },
  { key: 'final',    label: 'Final',    weight: 30 },
];

function calcGpa(scores: Record<string, number>) {
  return GRADE_COMPONENTS.reduce((sum, c) => sum + (scores[c.key] ?? 0) * c.weight / 100, 0);
}
function gradeLabel(g: number) {
  if (g >= 9.0) return 'A';
  if (g >= 8.5) return 'B+';
  if (g >= 8.0) return 'B';
  if (g >= 7.0) return 'C+';
  if (g >= 6.5) return 'C';
  if (g >= 5.5) return 'D+';
  if (g >= 5.0) return 'D';
  return 'F';
}
// ── END MOCK GRADES ────────────────────────────────────────────────────────────


// ── Main Component ────────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [tab, setTab] = useState<Tab>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '', body: '', type: 'announcement' as PostType,
    groupId: '', dueDate: '', attachmentUrl: '', attachmentName: '',
  });
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });

  const { data: rawCourse, isPending: isLoadingCourse } = useGetCourseById(id);
  const { data: rawGroups = [] } = useGetCourseGroups(id);
  const { data: rawPosts = [], isPending: isLoadingPosts } = useGetCoursePosts(id);
  const { data: myLecturerGroups = [] } = useGetLecturerGroupsInCourse(id, user.id);
  const { data: myStudentGroups  = [] } = useGetStudentGroupsInCourse(id, user.id);

  const course   = rawCourse as any;
  const groups   = rawGroups as any[];
  const allPosts = rawPosts  as any[];

  const { mutate: createPost,  isPending: isCreatingPost  } = useCreateCoursePost();
  const { mutate: deletePost  } = useDeleteCoursePost();
  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateCourseGroup();
  const { mutate: deleteGroup } = useDeleteCourseGroup();

  const roles: string[] = (user as any).roles ?? [];
  const isLecturerByRole = isLecturerRole(roles) || isAdminRole(roles);
  const isLecturer  = (myLecturerGroups as any[]).length > 0 || isLecturerByRole;
  const isStudent   = (myStudentGroups  as any[]).length > 0 || !isLecturerByRole;
  const myStudentId = isStudent ? (myStudentGroups as any[])[0]?.studentId ?? user.id : user.id;

  // Grades
  const { data: gradesRaw = [], isPending: isLoadingGrades } = useGetCourseGrades(tab === 'grades' && isLecturer ? id : '');
  const { data: myGradeRaw } = useGetStudentGrade(tab === 'grades' && isStudent && !isLecturer ? id : '', myStudentId);
  const { mutate: saveGrades, isPending: isSavingGrades } = useUpsertCourseGrades();

  const allGrades = gradesRaw as unknown as ICourseGrade[];
  const myGrade   = (myGradeRaw ?? null) as unknown as ICourseGrade | null;

  // Local edit state for the grade table (lecturer only)
  const [editedScores, setEditedScores] = useState<Record<string, Record<string, number>>>({});
  const myGroupIds  = isStudent ? (myStudentGroups as any[]).map((g: any) => g.groupId) : [];

  const visiblePosts    = (allPosts as any[]).filter((p) => isLecturer || !p.groupId || myGroupIds.includes(p.groupId));
  const materialPosts   = visiblePosts.filter((p) => p.type === 'material');
  const assignmentPosts = visiblePosts.filter((p) => p.type === 'assignment');

  const tabPosts: Record<Tab, any[]> = {
    feed:        visiblePosts,
    materials:   materialPosts,
    assignments: assignmentPosts,
    members:     [],
    grades:      [],
  };

  const handleCreatePost = () => {
    if (!postForm.title.trim()) return;
    createPost({
      courseId: id,
      groupId: postForm.groupId,
      authorId: user.id,
      authorName: user.name,
      title: postForm.title.trim(),
      body: postForm.body.trim() || undefined,
      type: postForm.type,
      dueDate: postForm.dueDate || undefined,
      attachmentUrls:  postForm.attachmentUrl  ? [postForm.attachmentUrl]  : [],
      attachmentNames: postForm.attachmentName ? [postForm.attachmentName] : [],
    }, {
      onSuccess: () => {
        setPostForm({ title: '', body: '', type: 'announcement', groupId: '', dueDate: '', attachmentUrl: '', attachmentName: '' });
        setShowCreatePost(false);
      },
    });
  };

  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) return;
    createGroup({
      courseId: id,
      lecturerId: user.id,
      lecturerName: user.name,
      name: groupForm.name.trim(),
      description: groupForm.description.trim() || undefined,
    }, {
      onSuccess: () => {
        setGroupForm({ name: '', description: '' });
        setShowCreateGroup(false);
      },
    });
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a] flex flex-col items-center justify-center gap-3">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy môn học</p>
        <button onClick={() => navigate('/courses')} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">← Quay lại</button>
      </div>
    );
  }



  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'feed',        label: 'Tất cả',    count: visiblePosts.length },
    { id: 'materials',   label: 'Tài liệu',  count: materialPosts.length },
    { id: 'assignments', label: 'Bài tập',   count: assignmentPosts.length },
    { id: 'members',     label: 'Thành viên' },
    { id: 'grades',      label: 'Bảng điểm' },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/courses" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#009CD1] transition-colors font-mono">
              <ArrowLeft size={12} /> MÔN HỌC
            </Link>
            <span className="text-slate-300 dark:text-slate-700 text-[11px]">/</span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">{(course as any).code}</span>
          </div>
          {isLecturer && (
            <button
              onClick={() => setShowCreatePost((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors"
            >
              <Plus size={12} /> Tạo bài đăng
            </button>
          )}
        </div>
      </div>

      {/* Course hero banner */}
      <div className="h-28 relative bg-[#0B2275]">
        <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-mono text-2xl font-black tracking-widest text-white">{(course as any).code}</span>
            {isLecturer && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">GIẢNG VIÊN</span>}
            {isStudent && !isLecturer && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/80">SINH VIÊN</span>}
            {!(course as any).isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/30 text-white/60 tracking-wider">KẾT THÚC</span>}
          </div>
          <p className="font-semibold text-sm text-white/90">{(course as any).name}</p>
          <p className="text-white/50 text-[11px] font-mono mt-0.5">{(course as any).semester} · {(groups as any[]).length} nhóm</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-5xl mx-auto flex gap-0">
          {TABS.map(({ id: tid, label, count }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                tab === tid
                  ? 'border-[#009CD1] text-[#009CD1]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  tab === tid ? 'bg-[#009CD1]/12 text-[#009CD1]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Create post form */}
        {showCreatePost && isLecturer && (
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Plus size={14} className="text-slate-500" /> Tạo bài đăng mới
              </h3>
              <button onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['announcement', 'material', 'assignment'] as PostType[]).map((pt) => {
                const m = TYPE_META[pt];
                const Icon = m.icon;
                return (
                  <button
                    key={pt}
                    onClick={() => setPostForm((f) => ({ ...f, type: pt }))}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                      postForm.type === pt
                        ? `${m.border.replace('border-l-[3px]', 'border-2')} ${m.bg} ${m.color}`
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon size={12} /> {m.label}
                  </button>
                );
              })}
            </div>

            <input
              value={postForm.title}
              onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề *"
              className={INPUT_CLS}
            />
            <textarea
              value={postForm.body}
              onChange={(e) => setPostForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Nội dung (tùy chọn)"
              rows={3}
              className={INPUT_CLS + ' resize-none'}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Nhóm (trống = tất cả)</label>
                <select
                  value={postForm.groupId}
                  onChange={(e) => setPostForm((f) => ({ ...f, groupId: e.target.value }))}
                  className={INPUT_CLS}
                >
                  <option value="">Tất cả nhóm</option>
                  {(groups as any[]).map((g) => (
                    <option key={g.$id} value={g.$id}>{g.name}</option>
                  ))}
                </select>
              </div>
              {postForm.type === 'assignment' && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Hạn nộp</label>
                  <input type="date" value={postForm.dueDate} onChange={(e) => setPostForm((f) => ({ ...f, dueDate: e.target.value }))} className={INPUT_CLS} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                value={postForm.attachmentName}
                onChange={(e) => setPostForm((f) => ({ ...f, attachmentName: e.target.value }))}
                placeholder="Tên tệp đính kèm"
                className={INPUT_CLS + ' text-xs'}
              />
              <input
                value={postForm.attachmentUrl}
                onChange={(e) => setPostForm((f) => ({ ...f, attachmentUrl: e.target.value }))}
                placeholder="Link tệp / Drive / OneDrive"
                className={INPUT_CLS + ' text-xs'}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreatePost(false)} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreatingPost || !postForm.title.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isCreatingPost ? <Loader2 size={12} className="animate-spin" /> : null}
                Đăng bài
              </button>
            </div>
          </div>
        )}

        {/* Posts feed tabs */}
        {tab !== 'members' && tab !== 'grades' && (
          <>
            {isLoadingPosts ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : tabPosts[tab].length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <BookOpen size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có bài đăng nào</p>
                {isLecturer && (
                  <button onClick={() => setShowCreatePost(true)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-1 transition-colors">
                    + Tạo bài đăng đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tabPosts[tab].map((post) => (
                  <PostCard
                    key={post.$id}
                    post={post}
                    isLecturer={isLecturer}
                    onDelete={(pid) => deletePost({ postId: pid, courseId: id })}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div className="flex flex-col gap-3">
            {isLecturer && (
              <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Users size={14} className="text-slate-400" /> Quản lý nhóm
                  </h3>
                  <button
                    onClick={() => setShowCreateGroup((v) => !v)}
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#009CD1] transition-colors"
                  >
                    <Plus size={12} /> Thêm nhóm
                  </button>
                </div>

                {showCreateGroup && (
                  <div className="flex gap-2 mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600">
                    <input
                      value={groupForm.name}
                      onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Tên nhóm (VD: Nhóm 01)"
                      className={INPUT_CLS + ' text-xs'}
                    />
                    <input
                      value={groupForm.description}
                      onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Mô tả (tùy chọn)"
                      className={INPUT_CLS + ' text-xs'}
                    />
                    <button
                      onClick={handleCreateGroup}
                      disabled={isCreatingGroup || !groupForm.name.trim()}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors shrink-0 disabled:opacity-60"
                    >
                      {isCreatingGroup ? <Loader2 size={12} className="animate-spin" /> : 'Tạo'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {(groups as any[]).length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2 text-center">
                <Users size={24} className="text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có nhóm nào</p>
                {isLecturer && (
                  <button onClick={() => { setTab('members'); setShowCreateGroup(true); }} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    + Tạo nhóm đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(groups as any[]).map((group) => (
                  <GroupPanel
                    key={group.$id}
                    group={group}
                    courseId={id}
                    isLecturer={isLecturer}
                    onDeleteGroup={(gid: string) => deleteGroup({ groupId: gid, courseId: id })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {/* Grades tab */}
        {tab === 'grades' && (
          <div className="flex flex-col gap-4">
            {/* Component weights legend */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cấu trúc điểm</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_COMPONENTS.map((c) => (
                  <div key={c.key} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.label}</span>
                    <span className="text-[10px] font-bold text-[#009CD1] bg-[#009CD1]/10 px-1.5 py-0.5 rounded-full">{c.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── LECTURER VIEW: full gradebook table ── */}
            {isLecturer && (
              isLoadingGrades ? (
                <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Bảng điểm — {allGrades.length} sinh viên
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/40">
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 min-w-[40px]">#</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 min-w-[160px]">Họ tên / MSSV</th>
                          {GRADE_COMPONENTS.map((c) => (
                            <th key={c.key} className="px-2 py-2.5 text-center font-semibold text-slate-500 dark:text-slate-400 min-w-[72px]">
                              <div>{c.label}</div>
                              <div className="text-[9px] text-slate-400 font-normal">{c.weight}%</div>
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center font-bold text-slate-600 dark:text-slate-300 min-w-[60px]">GPA</th>
                          <th className="px-3 py-2.5 text-center font-bold text-slate-600 dark:text-slate-300 min-w-[48px]">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                        {allGrades.map((st, idx) => {
                          const scores = {
                            quiz:     st.quiz     ?? 0,
                            exercise: st.exercise ?? 0,
                            lab:      st.lab      ?? 0,
                            midterm:  st.midterm  ?? 0,
                            project:  st.project  ?? 0,
                            final:    st.final    ?? 0,
                          };
                          return (
                            <tr key={st.$id || st.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                              <td className="px-3 py-2 text-slate-400 dark:text-slate-500">{idx + 1}</td>
                              <td className="px-3 py-2">
                                <p className="font-medium text-slate-700 dark:text-slate-200">{st.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{st.studentId}</p>
                              </td>
                              {GRADE_COMPONENTS.map((c) => {
                                const val = editedScores[st.studentId]?.[c.key] ?? (scores[c.key as keyof typeof scores] ?? 0);
                                return (
                                  <td key={c.key} className="px-2 py-2 text-center">
                                    <input
                                      type="number"
                                      value={val}
                                      min={0} max={10} step={0.5}
                                      onChange={(e) => {
                                        const v = Math.min(10, Math.max(0, parseFloat(e.target.value) || 0));
                                        setEditedScores((prev) => ({
                                          ...prev,
                                          [st.studentId]: { ...(prev[st.studentId] ?? scores), [c.key]: v },
                                        }));
                                      }}
                                      className="w-14 text-center text-xs px-1 py-1 rounded-md bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#009CD1]/40 focus:border-[#009CD1]"
                                    />
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 text-center font-bold text-slate-800 dark:text-slate-100">
                                {calcGpa({ ...scores, ...(editedScores[st.studentId] ?? {}) }).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {(() => {
                                  const g = calcGpa({ ...scores, ...(editedScores[st.studentId] ?? {}) });
                                  return (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                      g >= 8.5 ? 'bg-[#00c578]/12 text-[#00c578]'
                                      : g >= 7.0 ? 'bg-[#009CD1]/12 text-[#009CD1]'
                                      : g >= 5.5 ? 'bg-[#f5832f]/12 text-[#f5832f]'
                                      : 'bg-[#ef4e49]/12 text-[#ef4e49]'
                                    }`}>{gradeLabel(g)}</span>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {allGrades.length > 0 && (
                        <tfoot>
                          <tr className="bg-slate-50 dark:bg-slate-700/30 border-t-2 border-slate-200 dark:border-slate-600">
                            <td colSpan={2} className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Trung bình lớp</td>
                            {GRADE_COMPONENTS.map((c) => {
                              const avg = allGrades.reduce((s, st) => {
                                const v = editedScores[st.studentId]?.[c.key] ?? (st[c.key as keyof ICourseGrade] as number ?? 0);
                                return s + v;
                              }, 0) / allGrades.length;
                              return (
                                <td key={c.key} className="px-2 py-2 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                  {avg.toFixed(1)}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center text-[11px] font-bold text-[#009CD1]">
                              {(allGrades.reduce((s, st) => {
                                const merged = { quiz: st.quiz ?? 0, exercise: st.exercise ?? 0, lab: st.lab ?? 0, midterm: st.midterm ?? 0, project: st.project ?? 0, final: st.final ?? 0, ...(editedScores[st.studentId] ?? {}) };
                                return s + calcGpa(merged);
                              }, 0) / allGrades.length).toFixed(2)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {Object.keys(editedScores).length > 0 ? `${Object.keys(editedScores).length} sinh viên có thay đổi chưa lưu` : 'Chỉnh điểm trực tiếp trong ô'}
                    </p>
                    <button
                      disabled={isSavingGrades || Object.keys(editedScores).length === 0}
                      onClick={() => {
                        const payload: IUpsertCourseGrade[] = allGrades
                          .filter((st) => editedScores[st.studentId])
                          .map((st) => ({
                            courseId: id,
                            studentId: st.studentId,
                            studentName: st.studentName,
                            gradedBy: user.id,
                            quiz:     (editedScores[st.studentId]?.quiz     ?? st.quiz     ?? 0),
                            exercise: (editedScores[st.studentId]?.exercise ?? st.exercise ?? 0),
                            lab:      (editedScores[st.studentId]?.lab      ?? st.lab      ?? 0),
                            midterm:  (editedScores[st.studentId]?.midterm  ?? st.midterm  ?? 0),
                            project:  (editedScores[st.studentId]?.project  ?? st.project  ?? 0),
                            final:    (editedScores[st.studentId]?.final    ?? st.final    ?? 0),
                          }));
                        saveGrades(payload, { onSuccess: () => setEditedScores({}) });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#009CD1] hover:bg-[#0087b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingGrades ? <><Loader2 size={11} className="animate-spin" /> Đang lưu…</> : 'Lưu điểm'}
                    </button>
                  </div>
                </div>
              )
            )}

            {/* ── STUDENT VIEW: personal score card ── */}
            {isStudent && !isLecturer && (() => {
              if (!myGrade) return (
                <div className="flex flex-col items-center py-16 gap-2 text-center">
                  <BarChart3 size={24} className="text-slate-200 dark:text-slate-700" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có điểm cho môn học này</p>
                </div>
              );
              const scores = { quiz: myGrade.quiz ?? 0, exercise: myGrade.exercise ?? 0, lab: myGrade.lab ?? 0, midterm: myGrade.midterm ?? 0, project: myGrade.project ?? 0, final: myGrade.final ?? 0 };
              const gpa = calcGpa(scores);
              return (
                <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Điểm của bạn — {myGrade.studentId}</p>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      gpa >= 8.5 ? 'bg-[#00c578]/12 text-[#00c578]' : gpa >= 7.0 ? 'bg-[#009CD1]/12 text-[#009CD1]' : gpa >= 5.5 ? 'bg-[#f5832f]/12 text-[#f5832f]' : 'bg-[#ef4e49]/12 text-[#ef4e49]'
                    }`}>{gradeLabel(gpa)} — {gpa.toFixed(2)}</span>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {GRADE_COMPONENTS.map((c) => {
                      const score = scores[c.key as keyof typeof scores];
                      const weighted = score * c.weight / 100;
                      return (
                        <div key={c.key} className="flex items-center px-4 py-3 gap-4">
                          <div className="w-28 shrink-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.label}</p>
                            <p className="text-[10px] text-slate-400">{c.weight}% trọng số</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-[#009CD1] rounded-full transition-all" style={{ width: `${score * 10}%` }} />
                              </div>
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 w-8 text-right">{score}</span>
                            </div>
                          </div>
                          <div className="w-20 text-right shrink-0">
                            <span className="text-xs text-slate-400">+{weighted.toFixed(2)} điểm</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tổng kết</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{gpa.toFixed(2)}<span className="text-sm font-normal text-slate-400"> / 10</span></span>
                      <span className={`px-2.5 py-1 rounded-lg text-sm font-black ${
                        gpa >= 8.5 ? 'bg-[#00c578]/15 text-[#00c578]' : gpa >= 7.0 ? 'bg-[#009CD1]/15 text-[#009CD1]' : gpa >= 5.5 ? 'bg-[#f5832f]/15 text-[#f5832f]' : 'bg-[#ef4e49]/15 text-[#ef4e49]'
                      }`}>{gradeLabel(gpa)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!isLecturer && !isStudent && (
              <div className="flex flex-col items-center py-16 gap-2 text-center">
                <BarChart3 size={24} className="text-slate-200 dark:text-slate-700" />
                <p className="text-sm text-slate-400 dark:text-slate-500">Bạn chưa tham gia môn học này</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
