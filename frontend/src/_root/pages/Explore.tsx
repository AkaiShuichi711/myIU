import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Search, X, Loader2, LayoutGrid, List, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetInfinitePosts, useSearchPosts } from '@/lib/react-query/queriesAndMutations';
import { PostCard, GridPostList } from '@/components/shared';
import { useDebounce } from '@/hooks/useDebounce';

const searchInputCls = "w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009CD1]/20 focus:border-[#009CD1] transition-all";

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const { t } = useTranslation();
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isLoadingFeed,
  } = useGetInfinitePosts();

  const { data: searchResults, isFetching: isSearching } = useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && hasNextPage && !debouncedSearch) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, debouncedSearch]);

  const realPosts = (infiniteData?.pages?.flat() ?? []).filter(Boolean);
  const allPosts = realPosts;
  const isSearchMode = debouncedSearch.trim().length > 0;
  const posts = isSearchMode ? (searchResults ?? []).filter(Boolean) : allPosts;
  const isLoading = !isSearchMode && isLoadingFeed && realPosts.length === 0;

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#19191a]">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-100 dark:border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          <Link to="/home" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0085b3] transition-colors font-mono w-fit">
            <Home size={11} /> HOME
          </Link>
          <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              className={searchInputCls}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('feed')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'feed' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#009CD1]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Feed view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#009CD1]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        {isSearchMode && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            {isSearching
              ? t('explore.searching')
              : t('explore.results', { count: posts.length, query: debouncedSearch })}
          </p>
        )}

        {isLoading && (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-1/5" />
                  </div>
                </div>
                <div className="h-56 bg-slate-100 dark:bg-slate-700" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">
              {isSearchMode ? t('explore.noPostsFound') : t('explore.noPostsYet')}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {isSearchMode ? t('explore.tryDifferent') : t('explore.createFirst')}
            </p>
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          viewMode === 'feed' ? (
            <div className="flex flex-col gap-5">
              {posts.map((post: any) => (
                <PostCard key={post.$id} post={post} />
              ))}
            </div>
          ) : (
            <GridPostList posts={posts} />
          )
        )}

        {!isSearchMode && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 size={20} className="animate-spin text-[#009CD1]" />
            )}
            {!hasNextPage && posts.length > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('explore.seenAll')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
