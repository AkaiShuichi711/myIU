import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Users, FileText, ChevronRight,
  Loader2, GraduationCap, Briefcase, Home,
  UserCheck, Info,
} from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { isLecturerRole } from '@/lib/utils';
import {
  useGetCoursesByLecturer,
  useGetCoursesByStudent,
} from '@/lib/react-query/queriesAndMutations';

// ── Course Card ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, role }: { course: any; role: 'lecturer' | 'student' }) => {
  const coverColor = course.coverColor ?? '#323393';
  return (
    <Link
      to={`/courses/${course.$id}`}
      className="group block bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
      style={{ ['--hover-shadow' as any]: `${coverColor}20` }}
    >
      <div className="h-[72px] relative bg-[#0B2275] dark:bg-[#0B2275]/90 border-b border-[#0B2275]/20">
        <div className="absolute inset-0 flex items-center px-4">
          <span className="font-mono text-xl font-black tracking-widest text-white">{course.code}</span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {!course.isActive && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/30 text-white/60 tracking-wider">KẾT THÚC</span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white">
            {role === 'lecturer' ? 'GV' : 'SV'}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-[#4040aa] transition-colors">
          {course.name}
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-2.5">{course.semester}</p>
        {course.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2.5">{course.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            {role === 'lecturer' && <span className="flex items-center gap-1"><Users size={10} /> Nhóm</span>}
            <span className="flex items-center gap-1"><FileText size={10} /> Bài đăng</span>
          </div>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-[#4040aa] transition-colors" />
        </div>
      </div>
    </Link>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const CoursesPage = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const isLecturer = isLecturerRole(user.roles);
  const isStudent  = !isLecturer;

  const [tab, setTab] = useState<'teaching' | 'learning'>(isLecturer ? 'teaching' : 'learning');

  const { data: teachingCourses = [], isPending: loadingTeaching } = useGetCoursesByLecturer(user.id);
  const { data: learningCourses  = [], isPending: loadingLearning  } = useGetCoursesByStudent(user.id);

  const isLoading = tab === 'teaching' ? loadingTeaching : loadingLearning;
  const rawCourses = (tab === 'teaching' ? teachingCourses : learningCourses) as any[];
  const courses = rawCourses;

  const TAB_DEFS = [
    { id: 'teaching' as const, label: 'Giảng dạy', icon: Briefcase,     count: (teachingCourses as any[]).length, visible: isLecturer },
    { id: 'learning' as const, label: 'Học tập',   icon: GraduationCap, count: (learningCourses  as any[]).length, visible: isStudent  },
  ].filter((t) => t.visible);

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-[#4040aa] transition-colors font-mono"
              >
                <Home size={11} /> HOME
              </button>
              <span className="text-slate-300 dark:text-slate-700 text-[11px]">/</span>
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} className="text-[#323393]" />
                <h1 className="text-base font-bold text-slate-900 dark:text-[#e8edf0] tracking-tight">Môn học</h1>
              </div>
            </div>

            {/* Only lecturers can create a course */}
            {isLecturer && tab === 'teaching' && (
              <Link
                to="/courses/create"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#323393] hover:bg-[#0087b3] transition-colors"
              >
                <Plus size={12} /> Tạo môn học
              </Link>
            )}
          </div>

          {/* Tabs — only visible ones */}
          {TAB_DEFS.length > 1 && (
            <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg w-fit border border-slate-200 dark:border-slate-700/60">
              {TAB_DEFS.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    tab === id
                      ? 'bg-white dark:bg-slate-700 text-[#323393] shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={12} /> {label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    tab === id
                      ? 'bg-[#323393]/12 text-[#323393]'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                  }`}>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#323393]" />
          </div>

        ) : courses.length === 0 ? (
          tab === 'teaching' ? (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-xl border border-[#323393]/20 bg-[#323393]/5 flex items-center justify-center">
                <Briefcase size={24} className="text-[#323393]/60" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Chưa có môn học nào để giảng dạy</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                Tạo môn học, thêm nhóm và sinh viên để bắt đầu quản lý lớp học.
              </p>
              <Link
                to="/courses/create"
                className="mt-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#323393] hover:bg-[#0087b3] transition-colors"
              >
                + Tạo môn học đầu tiên
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 gap-4 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <GraduationCap size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">Chưa được ghi danh vào môn học nào</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Sinh viên được giảng viên thêm vào nhóm môn học. Liên hệ giảng viên phụ trách để được ghi danh.
                </p>
              </div>

              <div className="w-full bg-[#323393]/5 dark:bg-[#323393]/8 border border-[#323393]/15 rounded-xl p-4 text-left">
                <p className="text-[11px] font-bold text-[#323393] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info size={11} /> Cách ghi danh
                </p>
                <ol className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {['Giảng viên tạo môn học và nhóm học', 'GV thêm sinh viên vào nhóm bằng User ID', 'Môn học xuất hiện ở đây ngay lập tức'].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#323393]/15 text-[#323393] flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">User ID của bạn</p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-200 select-all">{user.id}</p>
                </div>
                <UserCheck size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
              </div>
            </div>
          )

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <CourseCard key={course.$id} course={course} role={tab === 'teaching' ? 'lecturer' : 'student'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
