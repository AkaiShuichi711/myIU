import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Megaphone, FileText, ClipboardList, Users,
  Plus, Trash2, Loader2, Calendar, Paperclip,
  BookOpen, UserPlus, X, ChevronDown, ChevronUp, BarChart3,
  Upload, CheckCircle2, Clock, AlertCircle, UserCheck, Link2,
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
  useGetMySubmission,
  useSubmitAssignment,
  useGetAssignmentSubmissions,
  useGradeSubmission,
  useGetAttendance,
  useGetMyAttendance,
  useBulkUpsertAttendance,
  useGetAllCourseMembers,
} from '@/lib/react-query/queriesAndMutations';
import type { ICourse, ICourseGroup, ICoursePost, IGroupMember, ICourseGrade, IUpsertCourseGrade } from '@/types';
import { formatTimeAgo, isLecturerRole, isAdminRole } from '@/lib/utils';
import { INPUT_CLS } from '@/constants/courses';
import UserAvatar from '@/components/shared/UserAvatar';
import { PageLoader } from '@/components/shared';

type Tab = 'feed' | 'materials' | 'assignments' | 'members' | 'grades' | 'attendance';
type PostType = 'announcement' | 'material' | 'assignment';

const TYPE_META: Record<PostType, { label: string; color: string; border: string; bg: string; icon: typeof Megaphone }> = {
  announcement: {
    label: 'THÔNG BÁO',
    color: 'text-[#0057A8]',
    border: 'border-l-[3px] border-[#0057A8]',
    bg: 'bg-[#0057A8]/6 dark:bg-[#0057A8]/10',
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
  post: ICoursePost;
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

// ── Assignment Card (with submission panel) ───────────────────────────────────
const ATTEND_STATUS = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const;
type AttendStatus = (typeof ATTEND_STATUS)[number];
const ATTEND_LABEL: Record<AttendStatus, { short: string; color: string; bg: string }> = {
  PRESENT:  { short: 'P', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300' },
  LATE:     { short: 'L', color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300' },
  ABSENT:   { short: 'A', color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20 border-red-300' },
  EXCUSED:  { short: 'E', color: 'text-slate-500',   bg: 'bg-slate-50 dark:bg-slate-700/40 border-slate-300' },
};

const AssignmentCard = ({
  post, isLecturer, userId, courseId, onDelete,
}: {
  post: ICoursePost; isLecturer: boolean; userId: string; courseId: string;
  onDelete: (id: string) => void;
}) => {
  const [showSubmit, setShowSubmit]     = useState(false);
  const [showSubs, setShowSubs]         = useState(false);
  const [submitUrl, setSubmitUrl]       = useState('');
  const [submitText, setSubmitText]     = useState('');
  const [gradingId, setGradingId]       = useState<string | null>(null);
  const [gradeForm, setGradeForm]       = useState({ score: '', feedback: '' });

  const { data: mySubmission }       = useGetMySubmission(!isLecturer ? post.$id : '');
  const { data: submissions = [] }   = useGetAssignmentSubmissions(isLecturer && showSubs ? post.$id : '');
  const { mutate: submit, isPending: isSubmitting } = useSubmitAssignment();
  const { mutate: gradeIt, isPending: isGrading }   = useGradeSubmission();

  const sub = mySubmission as any;
  const subs = submissions as any[];

  const statusBadge = sub ? (
    sub.status === 'GRADED'    ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200"><CheckCircle2 size={10}/> Đã chấm: {sub.score}/10</span>
    : sub.status === 'LATE'    ? <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200"><Clock size={10}/> Nộp trễ</span>
    : <span className="flex items-center gap-1 text-[10px] font-bold text-[#0057A8] bg-[#0057A8]/10 px-2 py-0.5 rounded-full border border-[#0057A8]/20"><CheckCircle2 size={10}/> Đã nộp</span>
  ) : (
    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600"><AlertCircle size={10}/> Chưa nộp</span>
  );

  const meta = TYPE_META.assignment;
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 border-l-[3px] border-l-slate-500 overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={13} className={meta.color} />
          <span className={`text-[10px] font-bold tracking-widest uppercase ${meta.color}`}>BÀI TẬP</span>
          {!isLecturer && <div className="ml-2">{statusBadge}</div>}
          {isLecturer && subs.length > 0 && (
            <span className="ml-2 text-[10px] font-bold text-[#0057A8] bg-[#0057A8]/10 px-2 py-0.5 rounded-full">{subs.length} bài nộp</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">{post.$createdAt ? new Date(post.$createdAt).toLocaleDateString('vi-VN') : ''}</span>
          {isLecturer && (
            <button onClick={() => onDelete(post.$id)} className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 size={12}/>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3.5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{post.title}</h3>
        {post.body && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>}
        {post.dueDate && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Calendar size={12}/> Hạn nộp: {new Date(post.dueDate).toLocaleDateString('vi-VN')}
          </div>
        )}
        {post.attachmentNames?.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {post.attachmentNames.map((name: string, i: number) => (
              <a key={i} href={post.attachmentUrls?.[i] || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors">
                <Paperclip size={12} className="text-slate-400"/> {name}
              </a>
            ))}
          </div>
        )}

        {/* Student: submit area */}
        {!isLecturer && (
          <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
            {sub?.feedback && (
              <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nhận xét giảng viên</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{sub.feedback}</p>
              </div>
            )}
            {sub && !showSubmit ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sub.fileName && <span className="flex items-center gap-1.5 text-xs text-slate-500"><Paperclip size={11}/>{sub.fileName}</span>}
                  {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0057A8] hover:underline flex items-center gap-1"><Link2 size={11}/> Xem bài nộp</a>}
                </div>
                <button onClick={() => setShowSubmit(true)} className="text-xs text-slate-400 hover:text-[#0057A8] transition-colors">Nộp lại</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!showSubmit && (
                  <button onClick={() => setShowSubmit(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors w-full">
                    <Upload size={12}/> Nộp bài
                  </button>
                )}
                {showSubmit && (
                  <>
                    <input value={submitUrl} onChange={e => setSubmitUrl(e.target.value)}
                      placeholder="Link bài nộp (Drive, OneDrive…)"
                      className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40" />
                    <textarea value={submitText} onChange={e => setSubmitText(e.target.value)}
                      placeholder="Ghi chú (tùy chọn)" rows={2}
                      className="w-full px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40 resize-none" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowSubmit(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                      <button
                        disabled={isSubmitting || (!submitUrl.trim() && !submitText.trim())}
                        onClick={() => submit({ coursePostId: post.$id, fileUrl: submitUrl || undefined, textContent: submitText || undefined },
                          { onSuccess: () => { setShowSubmit(false); setSubmitUrl(''); setSubmitText(''); } })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-60">
                        {isSubmitting ? <Loader2 size={11} className="animate-spin"/> : <Upload size={11}/>} Nộp
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lecturer: submissions list */}
        {isLecturer && (
          <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
            <button onClick={() => setShowSubs(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0057A8] hover:text-[#0087b3] transition-colors">
              <UserCheck size={12}/> {showSubs ? 'Ẩn' : 'Xem'} bài nộp
              {showSubs && <ChevronUp size={12}/>}{!showSubs && <ChevronDown size={12}/>}
            </button>
            {showSubs && (
              <div className="mt-2 flex flex-col gap-1.5">
                {subs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">Chưa có sinh viên nộp bài</p>
                ) : subs.map((s: any) => (
                  <div key={s.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-600">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.studentName}</p>
                        {s.status === 'GRADED' && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{s.score}/10</span>}
                        {s.status === 'LATE'   && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Trễ</span>}
                      </div>
                      {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0057A8] hover:underline flex items-center gap-1 mt-1"><Link2 size={10}/> Xem bài</a>}
                      {s.textContent && <p className="text-xs text-slate-500 mt-1 truncate">{s.textContent}</p>}
                      {gradingId === s.id && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <input type="number" min={0} max={10} step={0.5} value={gradeForm.score}
                            onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))}
                            placeholder="Điểm (0–10)" className="w-28 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40"/>
                          <input value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                            placeholder="Nhận xét" className="px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40"/>
                          <div className="flex gap-1.5">
                            <button onClick={() => setGradingId(null)} className="px-2 py-1 rounded text-[11px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Hủy</button>
                            <button disabled={isGrading || !gradeForm.score}
                              onClick={() => gradeIt({ id: s.id, data: { score: parseFloat(gradeForm.score), feedback: gradeForm.feedback } },
                                { onSuccess: () => { setGradingId(null); setGradeForm({ score: '', feedback: '' }); } })}
                              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-60">
                              {isGrading ? <Loader2 size={10} className="animate-spin"/> : null} Lưu
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {gradingId !== s.id && (
                      <button onClick={() => { setGradingId(s.id); setGradeForm({ score: s.score?.toString() ?? '', feedback: s.feedback ?? '' }); }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-[#0057A8] transition-colors shrink-0">Chấm</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Group Panel ───────────────────────────────────────────────────────────────
const GroupPanel = ({ group, courseId, isLecturer, onDeleteGroup }: {
  group: ICourseGroup;
  courseId: string;
  isLecturer: boolean;
  onDeleteGroup: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ studentId: '', studentName: '' });

  const { data: rawMembers = [], isPending } = useGetGroupMembers(expanded ? group.$id : '');
  const members = rawMembers as IGroupMember[];
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
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0085b3] transition-colors"
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
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#0085b3] transition-colors flex items-center gap-1"
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
                className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors shrink-0 disabled:opacity-60"
              >
                {isAdding ? <Loader2 size={12} className="animate-spin" /> : 'Thêm'}
              </button>
            </div>
          )}

          {isPending ? (
            <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
          ) : members.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">Chưa có sinh viên trong nhóm này</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              {members.map((m) => (
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


// ── Attendance Tab ────────────────────────────────────────────────────────────
const AttendanceTab = ({ courseId, isLecturer }: {
  courseId: string; isLecturer: boolean;
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [draft, setDraft] = useState<Record<string, AttendStatus>>({});

  const { data: rawAttendance = [], isPending: isLoadingAtt } = useGetAttendance(isLecturer ? courseId : '', date);
  const { data: myAtt = [], isPending: isLoadingMyAtt } = useGetMyAttendance(!isLecturer ? courseId : '');
  const { data: membersRaw = [] } = useGetAllCourseMembers(isLecturer ? courseId : '');
  const { mutate: bulkSave, isPending: isSaving } = useBulkUpsertAttendance();

  const members = membersRaw as any[];
  const attendance = rawAttendance as any[];
  const myAttList = myAtt as any[];

  const statusOf = (studentId: string): AttendStatus =>
    draft[studentId] ?? attendance.find((a: any) => a.studentId === studentId)?.status ?? 'PRESENT';

  const handleSave = () => {
    const records = members.map((m) => ({
      studentId: m.studentId,
      studentName: m.studentName,
      status: statusOf(m.studentId),
    }));
    bulkSave({ courseId, date, records }, { onSuccess: () => setDraft({}) });
  };

  if (!isLecturer) {
    return (
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <UserCheck size={12}/> Điểm danh của bạn
          </p>
        </div>
        {isLoadingMyAtt ? (
          <div className="flex justify-center py-12"><Loader2 size={18} className="animate-spin text-slate-400"/></div>
        ) : myAttList.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <UserCheck size={24} className="text-slate-200 dark:text-slate-700"/>
            <p className="text-sm text-slate-400">Chưa có dữ liệu điểm danh</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {myAttList.map((a: any) => {
              const s = ATTEND_LABEL[a.status as AttendStatus] ?? ATTEND_LABEL.PRESENT;
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-600 dark:text-slate-300">{a.date}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>{a.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40"/>
          <span className="text-[11px] text-slate-400">{members.length} sinh viên</span>
        </div>
      </div>

      {isLoadingAtt ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-slate-400"/></div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2 text-center">
          <Users size={24} className="text-slate-200 dark:text-slate-700"/>
          <p className="text-sm text-slate-400">Chưa có sinh viên nào trong môn học</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {members.map((m: any) => {
              const current = statusOf(m.studentId);
              return (
                <div key={m.studentId} className="flex items-center gap-3 px-4 py-2.5">
                  <UserAvatar name={m.studentName || '?'} className="w-7 h-7 text-[10px] shrink-0" variant="muted"/>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{m.studentName}</p>
                  <div className="flex gap-1">
                    {ATTEND_STATUS.map((s) => {
                      const meta = ATTEND_LABEL[s];
                      const active = current === s;
                      return (
                        <button key={s} onClick={() => setDraft(d => ({ ...d, [m.studentId]: s }))}
                          className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition-colors ${
                            active ? `${meta.bg} ${meta.color}` : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300'
                          }`}>
                          {meta.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              {Object.keys(draft).length > 0 ? `${Object.keys(draft).length} thay đổi chưa lưu` : 'P = Có mặt · L = Trễ · A = Vắng · E = Phép'}
            </p>
            <button onClick={handleSave} disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 size={11} className="animate-spin"/> : null} Lưu điểm danh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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

  const course   = rawCourse as unknown as ICourse;
  const groups   = rawGroups as unknown as ICourseGroup[];
  const allPosts = rawPosts  as unknown as ICoursePost[];

  const { mutate: createPost,  isPending: isCreatingPost  } = useCreateCoursePost();
  const { mutate: deletePost  } = useDeleteCoursePost();
  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateCourseGroup();
  const { mutate: deleteGroup } = useDeleteCourseGroup();

  const isLecturerByRole = isLecturerRole(user.roles) || isAdminRole(user.roles);
  const lecturerGroups = myLecturerGroups as unknown as ICourseGroup[];
  const studentGroups  = myStudentGroups  as unknown as IGroupMember[];
  const isLecturer  = isAdminRole(user.roles) || (lecturerGroups.length > 0 && isLecturerByRole);
  const isStudent   = studentGroups.length > 0 || !isLecturerByRole;
  const myStudentId = isStudent ? (studentGroups[0]?.studentId ?? user.id) : user.id;

  // Grades
  const { data: gradesRaw = [], isPending: isLoadingGrades } = useGetCourseGrades(tab === 'grades' && isLecturer ? id : '');
  const { data: myGradeRaw } = useGetStudentGrade(tab === 'grades' && isStudent && !isLecturer ? id : '', myStudentId);
  const { mutate: saveGrades, isPending: isSavingGrades } = useUpsertCourseGrades();

  const allGrades = gradesRaw as unknown as ICourseGrade[];
  const myGrade   = (myGradeRaw ?? null) as unknown as ICourseGrade | null;

  // Local edit state for the grade table (lecturer only)
  const [editedScores, setEditedScores] = useState<Record<string, Record<string, number>>>({});
  const myGroupIds  = isStudent ? studentGroups.map((g) => g.groupId) : [];

  const visiblePosts    = allPosts.filter((p) => isLecturer || !p.groupId || myGroupIds.includes(p.groupId));
  const materialPosts   = visiblePosts.filter((p) => p.type === 'material');
  const assignmentPosts = visiblePosts.filter((p) => p.type === 'assignment');

  const tabPosts: Record<Tab, ICoursePost[]> = {
    feed:        visiblePosts,
    materials:   materialPosts,
    assignments: assignmentPosts,
    members:     [],
    grades:      [],
    attendance:  [],
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

  if (isLoadingCourse) return <PageLoader />;

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
    { id: 'attendance',  label: 'Điểm danh' },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/courses" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0085b3] transition-colors font-mono">
              <ArrowLeft size={12} /> MÔN HỌC
            </Link>
            <span className="text-slate-300 dark:text-slate-700 text-[11px]">/</span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">{course?.code}</span>
          </div>
          {isLecturer && (
            <button
              onClick={() => setShowCreatePost((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors"
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
            <span className="font-mono text-2xl font-black tracking-widest text-white">{course?.code}</span>
            {isLecturer && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">GIẢNG VIÊN</span>}
            {isStudent && !isLecturer && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/80">SINH VIÊN</span>}
            {!course?.isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/30 text-white/60 tracking-wider">KẾT THÚC</span>}
          </div>
          <p className="font-semibold text-sm text-white/90">{course?.name}</p>
          <p className="text-white/50 text-[11px] font-mono mt-0.5">{course?.semester} · {groups.length} nhóm</p>
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
                  ? 'border-[#0057A8] text-[#0057A8]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  tab === tid ? 'bg-[#0057A8]/12 text-[#0057A8]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
                  {groups.map((g) => (
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
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isCreatingPost ? <Loader2 size={12} className="animate-spin" /> : null}
                Đăng bài
              </button>
            </div>
          </div>
        )}

        {/* Posts feed tabs (feed + materials only) */}
        {(tab === 'feed' || tab === 'materials') && (
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

        {/* Assignments tab — uses AssignmentCard with submission panel */}
        {tab === 'assignments' && (
          <>
            {isLoadingPosts ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : assignmentPosts.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-2 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ClipboardList size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có bài tập nào</p>
                {isLecturer && <button onClick={() => setShowCreatePost(true)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-1 transition-colors">+ Tạo bài tập đầu tiên</button>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assignmentPosts.map((post) => (
                  <AssignmentCard
                    key={post.$id}
                    post={post}
                    isLecturer={isLecturer}
                    userId={user.id}
                    courseId={id}
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
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#0085b3] transition-colors"
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
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors shrink-0 disabled:opacity-60"
                    >
                      {isCreatingGroup ? <Loader2 size={12} className="animate-spin" /> : 'Tạo'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {groups.length === 0 ? (
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
                {groups.map((group) => (
                  <GroupPanel
                    key={group.$id}
                    group={group}
                    courseId={id}
                    isLecturer={isLecturer}
                    onDeleteGroup={(gid) => deleteGroup({ groupId: gid, courseId: id })}
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
                    <span className="text-[10px] font-bold text-[#0057A8] bg-[#0057A8]/10 px-1.5 py-0.5 rounded-full">{c.weight}%</span>
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
                                      className="w-14 text-center text-xs px-1 py-1 rounded-md bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0057A8]/40 focus:border-[#0057A8]"
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
                                      : g >= 7.0 ? 'bg-[#0057A8]/12 text-[#0057A8]'
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
                            <td className="px-3 py-2 text-center text-[11px] font-bold text-[#0057A8]">
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0057A8] hover:bg-[#0087b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      gpa >= 8.5 ? 'bg-[#00c578]/12 text-[#00c578]' : gpa >= 7.0 ? 'bg-[#0057A8]/12 text-[#0057A8]' : gpa >= 5.5 ? 'bg-[#f5832f]/12 text-[#f5832f]' : 'bg-[#ef4e49]/12 text-[#ef4e49]'
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
                                <div className="h-full bg-[#0057A8] rounded-full transition-all" style={{ width: `${score * 10}%` }} />
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
                        gpa >= 8.5 ? 'bg-[#00c578]/15 text-[#00c578]' : gpa >= 7.0 ? 'bg-[#0057A8]/15 text-[#0057A8]' : gpa >= 5.5 ? 'bg-[#f5832f]/15 text-[#f5832f]' : 'bg-[#ef4e49]/15 text-[#ef4e49]'
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

        {/* Attendance tab */}
        {tab === 'attendance' && (
          <AttendanceTab courseId={id} isLecturer={isLecturer} />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
