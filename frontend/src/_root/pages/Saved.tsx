import { Bookmark, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import { useGetSavedPosts } from '@/lib/react-query/queriesAndMutations';
import { GridPostList } from '@/components/shared';

const Saved = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const { data: savedRecords, isPending } = useGetSavedPosts(user.id);

  // ── MOCK DATA — xóa/comment block này khi Appwrite saves collection đã có data ──
  const MOCK_SAVED_POSTS = [
    { $id: 'mp2', creator: { $id: 'mu2', name: 'Trần Thị Bảo',   imageUrl: '' }, caption: 'Thư viện IU mới refactor xong — clean code, no more spaghetti! 🍝 Ai muốn review PR không?',                    mediaUrls: [], mediaTypes: [], tags: ['cleancode', 'refactor'], location: 'IU Library', likes: ['mu1', 'mu3'], $createdAt: '2026-06-08T14:30:00.000Z' },
    { $id: 'mp3', creator: { $id: 'mu3', name: 'Lê Văn Cường',   imageUrl: '' }, caption: 'GPA kỳ này: 3.8/4.0 🔥 Cảm ơn thầy cô và các bạn trong nhóm học!',                                               mediaUrls: [], mediaTypes: [], tags: ['gpa', 'academic'], location: '', likes: ['mu1'], $createdAt: '2026-06-07T10:00:00.000Z' },
    { $id: 'mp4', creator: { $id: 'mu4', name: 'Phạm Thị Duyên', imageUrl: '' }, caption: 'Demo hackathon IU 2026 đã xong! Team mình làm app hỗ trợ sinh viên khuyết tật tiếp cận tài liệu 📚',             mediaUrls: [], mediaTypes: [], tags: ['hackathon', 'iu2026'], location: 'Hall B', likes: ['mu1', 'mu2'], $createdAt: '2026-06-06T16:00:00.000Z' },
    { $id: 'mp5', creator: { $id: 'mu5', name: 'Hoàng Minh Đức', imageUrl: '' }, caption: 'Có ai học Embedded Systems không cho tôi hỏi cái oscilloscope reading với? Debug cả buổi không ra 😭',            mediaUrls: [], mediaTypes: [], tags: ['embedded', 'help'], location: 'Lab 4F', likes: [], $createdAt: '2026-06-05T09:30:00.000Z' },
  ];
  const realSavedPosts = savedRecords?.map((r: any) => r.post).filter(Boolean) ?? [];
  const savedPosts = realSavedPosts.length > 0 ? realSavedPosts : MOCK_SAVED_POSTS;
  // ── END MOCK ──

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-1.5">
          <Link to="/home" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0068FF] transition-colors font-mono w-fit">
            <Home size={11} /> HOME
          </Link>
          <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F398E]/10 flex items-center justify-center">
            <Bookmark size={18} className="text-[#2F398E]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('saved.title')}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('saved.subtitle')}</p>
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        {isPending ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#0068FF]" />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bookmark size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">{t('saved.empty')}</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{t('saved.emptyHint')}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {t('saved.count', { count: savedPosts.length })}
            </p>
            <GridPostList posts={savedPosts} />
          </>
        )}
      </div>
    </div>
  );
};

export default Saved;
