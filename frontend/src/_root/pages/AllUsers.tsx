import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetUsersPaginated, useSearchUsers } from '@/lib/react-query/queriesAndMutations';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials } from '@/lib/utils';
import { Paginator } from '@/components/shared';

const PAGE_SIZE = 12;

const PALETTE = ['#1D4ED8', '#7C3AED', '#0891B2', '#059669', '#B45309', '#DC2626', '#19191a', '#009CD1'];
const avatarBg = (n: string) => PALETTE[(n?.charCodeAt(0) ?? 65) % PALETTE.length];

const UserCard = ({ user }: { user: any }) => {
  const initials = getInitials(user.name || '?');
  const hasCustomImage = user.imageUrl && !String(user.imageUrl).includes('avatars');

  return (
    <Link
      to={`/profile/${user.$id}`}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
        style={{ background: hasCustomImage ? undefined : avatarBg(user.name) }}
      >
        {hasCustomImage ? (
          <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 w-full">
        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">{user.name}</p>
        {user.username && (
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{user.bio}</p>
        )}
        {user.roles?.length > 0 && (
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#009CD1]/8 dark:bg-[#009CD1]/20 text-[#009CD1] dark:text-blue-400 text-xs font-medium">
            {user.roles[0]}
          </span>
        )}
      </div>
    </Link>
  );
};

const AllUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const debouncedSearch = useDebounce(searchTerm, 400);

  const isSearchMode = debouncedSearch.trim().length > 0;

  const { data: pagedData, isPending: isLoadingAll } = useGetUsersPaginated(page, PAGE_SIZE);
  const { data: searchData, isFetching: isSearching } = useSearchUsers(debouncedSearch);

  const rawUsers = isSearchMode ? (searchData?.documents ?? []) : (pagedData?.documents ?? []);
  const users = rawUsers;
  const total = isSearchMode ? users.length : (pagedData?.total ?? 0);
  const isLoading = isSearchMode ? isSearching : (isLoadingAll && rawUsers.length === 0);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const startItem = isSearchMode ? 1 : (page - 1) * PAGE_SIZE + 1;
  const endItem = isSearchMode ? users.length : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#009CD1]/10 flex items-center justify-center">
              <Users size={18} className="text-[#009CD1]" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 hidden sm:block">{t('people.title')}</h1>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('people.searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009CD1]/20 focus:border-[#009CD1] dark:focus:border-[#009CD1] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {!isLoading && users.length > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            {isSearchMode
              ? t('people.results', { count: users.length, query: debouncedSearch })
              : t('people.showing', { count: total, start: startItem, end: endItem, total })}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col items-center gap-3 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700" />
                <div className="w-full space-y-1.5">
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mx-auto" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}I
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Users size={24} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">
              {isSearchMode ? t('people.noUsers') : t('people.noMembers')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {users.map((u: any) => <UserCard key={u.$id} user={u} />)}
            </div>
            {!isSearchMode && (
              <Paginator
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                isLoading={isLoadingAll}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
