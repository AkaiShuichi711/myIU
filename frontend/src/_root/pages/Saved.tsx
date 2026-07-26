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

  const savedPosts = savedRecords?.map((r: any) => r.post).filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      <div className="bg-white dark:bg-[#19191a] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-1.5">
          <Link to="/home" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0085b3] transition-colors font-mono w-fit">
            <Home size={11} /> HOME
          </Link>
          <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0057A8]/10 flex items-center justify-center">
            <Bookmark size={18} className="text-[#0057A8]" />
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
            <Loader2 size={24} className="animate-spin text-[#0057A8]" />
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
