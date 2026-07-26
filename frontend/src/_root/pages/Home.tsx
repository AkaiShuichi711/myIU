import { Link } from 'react-router-dom';
import { BookOpen, Bell, FileText, GraduationCap, Star, Loader2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetCoursesByStudent,
  useGetCoursesByLecturer,
  useGetNotifications,
  useGetFormSubmissionsByUser,
} from '@/lib/react-query/queriesAndMutations';
import { isLecturerRole, isAdminRole, formatTimeAgo } from '@/lib/utils';
import { FORM_STATUS } from '@/constants/ui';
import type { SubmissionStatus, ICourse, IFormSubmission, IAppNotification } from '@/types';

const NOTIF_DOT: Record<string, string> = {
  form_approved: 'bg-green-500',
  form_rejected: 'bg-red-400',
  form_pending:  'bg-amber-400',
  grade:         'bg-[#0057A8]',
  course:        'bg-[#0057A8]',
  system:        'bg-slate-400',
};

// ── Section header — ir.vng style ─────────────────────────────────────────
const SectionHeader = ({ title, to }: { title: string; to: string }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-[15px] font-bold text-slate-900 dark:text-[#e8edf0] tracking-tight">{title}</h2>
    <Link
      to={to}
      className="flex items-center gap-1 text-[12px] font-semibold text-[#0057A8] hover:opacity-80 transition-opacity"
    >
      Xem tất cả <ArrowUpRight size={12} />
    </Link>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const isLecturer = isLecturerRole(user.roles);
  const isAdmin    = isAdminRole(user.roles);

  const { data: studentCourses = [],  isPending: loadingStudentCourses  } = useGetCoursesByStudent(!isLecturer && !isAdmin ? user.id : '');
  const { data: lecturerCourses = [], isPending: loadingLecturerCourses } = useGetCoursesByLecturer(isLecturer || isAdmin ? user.id : '');
  const { data: rawNotifs = [],       isPending: loadingNotifs          } = useGetNotifications(user.id);
  const { data: rawForms = [],        isPending: loadingForms           } = useGetFormSubmissionsByUser(user.id);

  const rawCourses     = isLecturer || isAdmin ? lecturerCourses : studentCourses;
  const loadingCourses = isLecturer || isAdmin ? loadingLecturerCourses : loadingStudentCourses;
  const courses = rawCourses as ICourse[];
  const notifs  = rawNotifs  as IAppNotification[];
  const forms   = rawForms   as IFormSubmission[];

  const unreadCount   = notifs.filter((n) => !n.read).length;
  const pendingCount  = forms.filter((f) => f.status === 'pending').length;
  const activeCourses = courses.filter((c) => c.isActive !== false).length;

  const nameParts = user.name?.trim().split(/\s+/) ?? [];
  const firstName = nameParts[nameParts.length - 1] ?? user.name;
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const roleLabel = isAdmin ? 'Quản trị viên' : isLecturer ? 'Giảng viên' : 'Sinh viên';

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8] dark:bg-[#19191a]">

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1e2028] border-b border-[#E0E4EB] dark:border-[#33485c]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-end justify-between gap-6">
          {/* Greeting */}
          <div>
            <p className="text-[11px] text-slate-400 dark:text-[#4d6070] uppercase tracking-[0.12em] font-semibold mb-1">
              {dateStr}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e8edf0] leading-tight">
              {t('home.greeting', { name: firstName })}
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#99a3ad] mt-0.5">
              {roleLabel} — myIU Portal
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-0 shrink-0">
            {[
              { value: activeCourses, label: 'Khóa học đang học',   sub: 'môn học' },
              { value: unreadCount,   label: 'Thông báo chưa đọc',  sub: 'thông báo' },
              { value: pendingCount,  label: 'Biểu mẫu chờ duyệt',  sub: 'biểu mẫu' },
            ].map(({ value, label, sub }, i) => (
              <div
                key={label}
                className="flex flex-col py-1"
                style={{
                  paddingLeft: i === 0 ? 0 : 20,
                  paddingRight: i === 2 ? 0 : 20,
                  borderLeft: i > 0 ? '1px solid #E0E4EB' : undefined,
                }}
              >
                <p className="text-[11px] text-slate-400 dark:text-[#4d6070] font-medium mb-0.5 whitespace-nowrap">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-[#e8edf0] leading-none tracking-tight">
                  {value}
                </p>
                <p className="text-[11px] text-[#0057A8] font-semibold mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content: flat 2-col grid so row 1 headers align, row 2 headers align ── */}
      <div className="max-w-5xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-x-4 gap-y-4 items-start">

        {/* ── Courses — col 1, row 1 ──────────────────────────────────────── */}
        <div>
          <SectionHeader title="Khóa học đang học" to="/courses" />
          {loadingCourses ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[#0057A8]" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] flex flex-col items-center py-6 gap-2">
              <BookOpen size={24} className="text-slate-200 dark:text-[#33485c]" />
              <p className="text-sm text-slate-400">Chưa có khóa học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.slice(0, 4).map((course) => (
                <Link
                  key={course.$id}
                  to={`/courses/${course.$id}`}
                  className="group bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-1.5 w-full" style={{ background: course.coverColor ?? '#0057A8' }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="font-mono text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded"
                        style={{ background: `${course.coverColor ?? '#0057A8'}15`, color: course.coverColor ?? '#0057A8' }}
                      >
                        {course.code}
                      </span>
                      {!course.isActive && (
                        <span className="text-[9px] font-bold uppercase text-slate-400 border border-slate-200 dark:border-[#33485c] px-1.5 py-0.5 rounded">
                          Kết thúc
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-[#dce3e8] leading-snug line-clamp-2 group-hover:text-[#0085b3] transition-colors">
                      {course.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-[#4d6070] mt-1.5 flex items-center gap-1">
                      <GraduationCap size={10} /> {course.semester}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Notifications — col 2, row 1 ───────────────────────────────── */}
        <div>
          <SectionHeader title={`Thông báo${unreadCount > 0 ? ` (${unreadCount})` : ''}`} to="/notifications" />
          <div className="bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] overflow-hidden">
            {loadingNotifs ? (
              <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-[#0057A8]" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <Bell size={20} className="text-slate-200 dark:text-[#33485c]" />
                <p className="text-xs text-slate-400">Không có thông báo</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F6F8] dark:divide-[#243447]">
                {notifs.slice(0, 5).map((n) => (
                  <Link
                    key={n.$id}
                    to={n.linkTo || '/notifications'}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F4F6F8] dark:hover:bg-[#0d2137] transition-colors ${!n.read ? 'bg-[#0057A8]/3' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${NOTIF_DOT[n.type] ?? 'bg-slate-300'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] text-slate-700 dark:text-[#bfc6cc] leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-[#4d6070] mt-0.5">{formatTimeAgo(n.$createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Grades — col 1, row 2 ───────────────────────────────────────── */}
        <div>
          <SectionHeader title="Điểm gần đây" to="/courses" />
          <div className="bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] flex flex-col items-center py-6 gap-2">
            <Star size={22} className="text-slate-200 dark:text-[#33485c]" />
            <p className="text-sm text-slate-400">Chưa có điểm nào</p>
            <Link to="/courses" className="text-xs text-[#0057A8] hover:underline mt-0.5">
              Vào khóa học để xem điểm →
            </Link>
          </div>
        </div>

        {/* ── Forms — col 2, row 2 ────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Biểu mẫu của tôi" to="/forms" />
          <div className="bg-white dark:bg-[#1e2028] rounded-2xl border border-[#E0E4EB] dark:border-[#33485c] overflow-hidden">
            {loadingForms ? (
              <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-[#0057A8]" />
              </div>
            ) : forms.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <FileText size={20} className="text-slate-200 dark:text-[#33485c]" />
                <p className="text-xs text-slate-400">Chưa có biểu mẫu nào</p>
                <Link to="/forms" className="text-xs text-[#0057A8] hover:underline mt-0.5">
                  Nộp biểu mẫu →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F6F8] dark:divide-[#243447]">
                {[...forms]
                  .sort((a, b) => {
                    const priority: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
                    const pa = priority[a.status] ?? 1;
                    const pb = priority[b.status] ?? 1;
                    if (pa !== pb) return pa - pb;
                    return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
                  })
                  .slice(0, 4)
                  .map((f) => {
                    const st = FORM_STATUS[(f.status as SubmissionStatus)] ?? FORM_STATUS.pending;
                    const StatusIcon = st.Icon;
                    return (
                      <Link
                        key={f.$id}
                        to="/forms"
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#F4F6F8] dark:hover:bg-[#0d2137] transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium text-slate-700 dark:text-[#bfc6cc] truncate">{f.formTitle}</p>
                          <p className="text-[10px] text-slate-400 dark:text-[#4d6070] mt-0.5">{formatTimeAgo(f.$createdAt)}</p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${st.cls}`}>
                            <StatusIcon size={9} /> {st.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
