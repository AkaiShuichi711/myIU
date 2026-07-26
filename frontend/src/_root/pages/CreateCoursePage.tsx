import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import { useCreateCourse } from '@/lib/react-query/queriesAndMutations';
import { COVER_OPTIONS, COVER_GRADIENTS, SEMESTERS, INPUT_CLS } from '@/constants/courses';

const CreateCoursePage = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: createCourse, isPending } = useCreateCourse();

  const [form, setForm] = useState({
    code: '',
    name: '',
    semester: SEMESTERS[0],
    description: '',
    coverColor: '#0057A8',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    try {
      const course = await createCourse({ ...form, creatorId: user.id });
      navigate(`/courses/${(course as any).$id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const gradient = COVER_GRADIENTS[form.coverColor] ?? COVER_GRADIENTS['#0057A8'];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-200 dark:border-slate-800 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link
            to="/courses"
            className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-[#0085b3] transition-colors font-mono"
          >
            <ArrowLeft size={12} /> MÔN HỌC
          </Link>
          <span className="text-slate-300 dark:text-slate-700 text-[11px]">/</span>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-mono">TẠO MỚI</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} className="text-slate-400" /> Thông tin môn học
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                  Mã môn <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.code}
                  onChange={set('code')}
                  placeholder="VD: SE114"
                  className={INPUT_CLS + ' font-mono uppercase'}
                  maxLength={12}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                  Học kỳ
                </label>
                <select value={form.semester} onChange={set('semester')} className={INPUT_CLS}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Tên môn học <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={set('name')}
                placeholder="VD: Lập trình Hướng đối tượng"
                className={INPUT_CLS}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Mô tả (tùy chọn)
              </label>
              <textarea
                value={form.description}
                onChange={set('description') as any}
                placeholder="Mô tả ngắn về nội dung môn học..."
                rows={3}
                className={INPUT_CLS + ' resize-none'}
              />
            </div>
          </div>

          {/* Cover color */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Màu sắc bìa</h2>
            <div className="flex gap-2 flex-wrap">
              {COVER_OPTIONS.map(({ color, label }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => setForm((f) => ({ ...f, coverColor: color }))}
                  className="relative w-8 h-8 rounded-lg transition-all hover:scale-110"
                  style={{ background: COVER_GRADIENTS[color] }}
                >
                  {form.coverColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !form.code.trim() || !form.name.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 bg-[#0057A8] hover:bg-[#0087b3] transition-colors"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <BookOpen size={15} />}
            {isPending ? 'Đang tạo...' : 'Tạo môn học'}
          </button>
        </form>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Xem trước</p>
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="h-[72px] relative" style={{ background: gradient }}>
              <div className="absolute inset-0 flex items-center px-4">
                <span className="font-mono text-xl font-black text-white tracking-widest drop-shadow">
                  {form.code || 'CODE'}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/25 text-white tracking-wider">GV</span>
              </div>
            </div>
            <div className="p-3.5">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 mb-1">
                {form.name || 'Tên môn học'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{form.semester}</p>
              {form.description && (
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{form.description}</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Các bước tiếp theo</p>
            <ol className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {['Thêm nhóm (Nhóm 01, L01…)', 'Thêm sinh viên vào nhóm', 'Đăng bài thông báo / tài liệu'].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
