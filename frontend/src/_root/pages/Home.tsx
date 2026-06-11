import { Link } from 'react-router-dom';
import {
  BookOpen, Bell, FileText, ChevronRight,
  GraduationCap, Star, Clock, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetCoursesByStudent,
  useGetCoursesByLecturer,
  useGetNotifications,
  useGetFormSubmissionsByUser,
} from '@/lib/react-query/queriesAndMutations';
import { isLecturerRole, isAdminRole, formatTimeAgo } from '@/lib/utils';

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_COURSES = [
  { $id: 'mc1', code: 'CS301', name: 'Mạng Máy Tính',            coverColor: '#0068FF', semester: 'HK2 2025-2026', isActive: true },
  { $id: 'mc2', code: 'SE302', name: 'Kiểm Thử Phần Mềm',        coverColor: '#27ae60', semester: 'HK2 2025-2026', isActive: true },
  { $id: 'mc3', code: 'IT310', name: 'Trí Tuệ Nhân Tạo',         coverColor: '#8e44ad', semester: 'HK2 2025-2026', isActive: true },
  { $id: 'mc4', code: 'CS201', name: 'Cấu Trúc Dữ Liệu',         coverColor: '#e74c3c', semester: 'HK1 2025-2026', isActive: false },
];

const MOCK_NOTIFS = [
  { $id: 'hn1', type: 'form_approved', message: 'Đơn xin miễn học phần của bạn đã được duyệt', read: false, $createdAt: '2026-06-10T09:00:00.000Z', linkTo: '/forms' },
  { $id: 'hn2', type: 'grade',         message: 'Điểm môn Mạng Máy Tính (CS301) đã được cập nhật', read: false, $createdAt: '2026-06-10T07:30:00.000Z', linkTo: '/courses' },
  { $id: 'hn3', type: 'course',        message: 'Bạn vừa được đăng ký vào lớp Lập Trình Hướng Đối Tượng', read: true, $createdAt: '2026-06-09T15:00:00.000Z', linkTo: '/courses' },
];

const MOCK_FORMS = [
  { $id: 'hf1', formTitle: 'Đơn xin bảo lưu kết quả học tập', status: 'pending',  $createdAt: '2026-06-08T10:00:00.000Z' },
  { $id: 'hf2', formTitle: 'Đơn xin miễn học phần CS101',      status: 'approved', $createdAt: '2026-06-05T08:00:00.000Z' },
  { $id: 'hf3', formTitle: 'Đơn xin xét học bổng HK2',         status: 'rejected', $createdAt: '2026-06-01T09:00:00.000Z' },
];

const NOTIF_DOT: Record<string, string> = {
  form_approved: 'bg-green-500',
  form_rejected: 'bg-red-400',
  form_pending:  'bg-amber-400',
  grade:         'bg-[#0068FF]',
  course:        'bg-[#2F398E]',
  system:        'bg-slate-400',
};

const STATUS_UI: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:  { label: 'Chờ duyệt', cls: 'bg-[#f5832f]/10 text-[#f5832f]',  icon: <Clock size={11} /> },
  approved: { label: 'Đã duyệt',  cls: 'bg-[#00c578]/10 text-[#00c578]',  icon: <CheckCircle2 size={11} /> },
  rejected: { label: 'Từ chối',   cls: 'bg-[#ef4e49]/10 text-[#ef4e49]',  icon: <XCircle size={11} /> },
};

// ── Components ─────────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, to }: { icon: React.ReactNode; title: string; to: string }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="w-0.5 h-3.5 rounded-full bg-[#0068FF] shrink-0" />
      {icon}
      <span className="text-sm font-bold text-slate-700 dark:text-[#bfc6cc]">{title}</span>
    </div>
    <Link to={to} className="flex items-center gap-0.5 text-[11px] font-semibold text-[#0068FF] hover:text-[#3aaee0] transition-colors">
      Xem tất cả <ChevronRight size={12} />
    </Link>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const roles: string[] = (user as any).roles ?? [];
  const isLecturer = isLecturerRole(roles);
  const isAdmin    = isAdminRole(roles);

  const { data: studentCourses = [],  isPending: loadingStudentCourses  } = useGetCoursesByStudent(!isLecturer && !isAdmin ? user.id : '');
  const { data: lecturerCourses = [], isPending: loadingLecturerCourses } = useGetCoursesByLecturer(isLecturer || isAdmin ? user.id : '');
  const { data: rawNotifs = [],       isPending: loadingNotifs          } = useGetNotifications(user.id);
  const { data: rawForms = [],        isPending: loadingForms           } = useGetFormSubmissionsByUser(user.id);

  const rawCourses = isLecturer || isAdmin ? lecturerCourses : studentCourses;
  const loadingCourses = isLecturer || isAdmin ? loadingLecturerCourses : loadingStudentCourses;
  const courses    = (rawCourses  as any[]).length > 0 ? (rawCourses  as any[]) : MOCK_COURSES;
  const notifs     = (rawNotifs   as any[]).length > 0 ? (rawNotifs   as any[]) : MOCK_NOTIFS;
  const forms      = (rawForms    as any[]).length > 0 ? (rawForms    as any[]) : MOCK_FORMS;

  const unreadCount   = notifs.filter((n: any) => !n.read).length;
  const pendingCount  = forms.filter((f: any) => f.status === 'pending').length;
  const activeCourses = courses.filter((c: any) => c.isActive !== false).length;

  const firstName = user.name?.trim().split(/\s+/).at(-1) ?? user.name;

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 dark:border-[#0d2137] px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-400 dark:text-[#4d6070] capitalize tracking-wide">{dateStr}</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#e8edf0] mt-0.5">
              {t('home.greeting', { name: firstName })}
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#667685] mt-0.5">
              {isAdmin ? 'Quản trị viên' : isLecturer ? 'Giảng viên' : 'Sinh viên'} — myIU Portal
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2.5 flex-wrap">
            {[
              { icon: <BookOpen size={14} className="text-[#0068FF]" />, value: activeCourses, label: 'Khóa học',  color: '#0068FF' },
              { icon: <Bell size={14} className="text-[#f5832f]" />,     value: unreadCount,   label: 'Thông báo', color: '#f5832f' },
              { icon: <FileText size={14} className="text-[#2F398E]" />, value: pendingCount,  label: 'Chờ duyệt', color: '#2F398E' },
            ].map(({ icon, value, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border"
                style={{ backgroundColor: `${color}0d`, borderColor: `${color}20` }}
              >
                {icon}
                <div>
                  <p className="text-base font-bold leading-none" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#4d6070] mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* ── LEFT: Courses ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div>
            <SectionHeader
              icon={<BookOpen size={15} className="text-[#0068FF]" />}
              title="Khóa học đang học"
              to="/courses"
            />

            {loadingCourses ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#0068FF]" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.slice(0, 4).map((course: any) => {
                  return (
                    <Link
                      key={course.$id}
                      to={`/courses/${course.$id}`}
                      className="group bg-white dark:bg-[#001a33] rounded-xl border border-slate-200 dark:border-[#33485c]/50 overflow-hidden hover:border-[#0B2275]/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0B2275]/8 transition-all duration-200"
                    >
                      <div className="h-16 relative bg-[#0B2275]">
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="font-mono text-lg font-black text-white tracking-widest">{course.code}</span>
                        </div>
                        {!course.isActive && (
                          <span className="absolute top-1.5 right-2 text-[9px] font-bold bg-black/30 text-white/60 px-1.5 py-0.5 rounded">Kết thúc</span>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-snug">{course.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                          <GraduationCap size={10} /> {course.semester}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Grades placeholder ─────────────────────────────────────────── */}
          <div>
            <SectionHeader
              icon={<Star size={15} className="text-amber-500" />}
              title="Điểm gần đây"
              to="/courses"
            />
            <div className="bg-white dark:bg-[#001a33] rounded-xl border border-slate-200 dark:border-[#33485c]/50 divide-y divide-slate-50 dark:divide-[#0d2137]">
              {[
                { subject: 'Mạng Máy Tính (CS301)',         component: 'Giữa kỳ', score: 8.5, max: 10, color: '#0068FF' },
                { subject: 'Kiểm Thử Phần Mềm (SE302)',     component: 'Bài tập', score: 9.0, max: 10, color: '#27ae60' },
                { subject: 'Trí Tuệ Nhân Tạo (IT310)',      component: 'Lab',     score: 7.5, max: 10, color: '#8e44ad' },
              ].map((g) => (
                <div key={g.subject} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{g.subject}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{g.component}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-28 hidden sm:block">
                      <div className="h-1.5 bg-slate-100 dark:bg-[#33485c]/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(g.score / g.max) * 100}%`, background: g.color }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 w-10 text-right">
                      {g.score}<span className="text-xs font-normal text-slate-400">/{g.max}</span>
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <Link to="/courses" className="text-xs text-[#0068FF] hover:underline">Xem toàn bộ điểm →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Notifications + Forms ───────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Notifications */}
          <div>
            <SectionHeader
              icon={<Bell size={15} className="text-amber-500" />}
              title={`Thông báo${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              to="/notifications"
            />
            <div className="bg-white dark:bg-[#001a33] rounded-xl border border-slate-200 dark:border-[#33485c]/50 overflow-hidden">
              {loadingNotifs ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#0068FF]" /></div>
              ) : notifs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Không có thông báo</p>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-[#0d2137]">
                  {notifs.slice(0, 4).map((n: any) => (
                    <Link
                      key={n.$id}
                      to={n.linkTo || '/notifications'}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#0d2137] transition-colors ${!n.read ? 'bg-[#0068FF]/4 dark:bg-[#0068FF]/6' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${NOTIF_DOT[n.type] ?? 'bg-slate-300'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatTimeAgo(n.$createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Forms */}
          <div>
            <SectionHeader
              icon={<FileText size={15} className="text-[#2F398E]" />}
              title="Biểu mẫu của tôi"
              to="/forms"
            />
            <div className="bg-white dark:bg-[#001a33] rounded-xl border border-slate-200 dark:border-[#33485c]/50 overflow-hidden">
              {loadingForms ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#0068FF]" /></div>
              ) : forms.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <p className="text-xs text-slate-400">Chưa có biểu mẫu nào</p>
                  <Link to="/forms" className="text-xs text-[#0068FF] hover:underline">Nộp biểu mẫu →</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-[#0d2137]">
                  {forms.slice(0, 4).map((f: any) => {
                    const st = STATUS_UI[f.status] ?? STATUS_UI['pending'];
                    return (
                      <Link
                        key={f.$id}
                        to="/forms"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#0d2137] transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{f.formTitle}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatTimeAgo(f.$createdAt)}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
