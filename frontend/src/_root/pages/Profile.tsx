import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User, Briefcase, Mail, Edit3, ArrowLeft,
  Loader2, ShieldAlert, Copy, CheckCheck, Grid3x3, List
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserById, useGetUserPostsPaginated } from '@/lib/react-query/queriesAndMutations';
import { GridPostList, PostCard, Paginator } from '@/components/shared';
import { getInitials } from '@/lib/utils';

const POSTS_PER_PAGE = 9;

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, getProfileData, isAuthenticated } = useUserContext();
  const [graphProfile, setGraphProfile] = useState<any>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [postView, setPostView] = useState<'grid' | 'feed'>('grid');
  const [copied, setCopied] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);

  const { t } = useTranslation();
  const profileUserId = id || currentUser.id;
  const isOwnProfile = !id || id === currentUser.id;

  const { data: appwriteUser, isPending: isLoadingUser } = useGetUserById(profileUserId);
  const { data: userPostsData, isPending: isLoadingPosts } = useGetUserPostsPaginated(profileUserId, postsPage, POSTS_PER_PAGE);

  const isMicrosoftUser = appwriteUser?.authProvider === 'microsoft';

  useEffect(() => {
    if (isOwnProfile && isAuthenticated && isMicrosoftUser) {
      setIsLoadingGraph(true);
      getProfileData()
        .then((data) => setGraphProfile(data))
        .catch(() => {})
        .finally(() => setIsLoadingGraph(false));
    }
  }, [isOwnProfile, isAuthenticated, isMicrosoftUser]);

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleSetPostView = (view: 'grid' | 'feed') => {
    setPostView(view);
    setPostsPage(1);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#009cd1]" />
      </div>
    );
  }

  const displayName = appwriteUser?.name || (isOwnProfile ? currentUser.name : 'Unknown User');
  const displayEmail = appwriteUser?.email || (isOwnProfile ? currentUser.email : '');
  const displayBio = appwriteUser?.bio || (isOwnProfile ? currentUser.bio : '');
  const displayUsername = appwriteUser?.username || (isOwnProfile ? currentUser.username : '');
  const initials = getInitials(displayName || '?');
  const posts = userPostsData?.documents ?? [];
  const totalPosts = userPostsData?.total ?? 0;

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} /> {t('profile.back')}
          </button>
          {isOwnProfile && (
            <Link
              to={`/update-profile/${currentUser.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2F398E] dark:text-blue-400 bg-[#2F398E]/8 dark:bg-[#2F398E]/20 hover:bg-[#2F398E]/12 transition-colors"
            >
              <Edit3 size={13} /> {t('profile.editProfile')}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">
        {/* Profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="h-24" style={{ background: 'linear-gradient(135deg, #009cd1 0%, #2F398E 100%)' }} />

          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div
                className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}
              >
                {appwriteUser?.imageUrl && !String(appwriteUser.imageUrl).includes('avatars') ? (
                  <img src={appwriteUser.imageUrl} alt={displayName} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{displayName}</h1>
            {displayUsername && (
              <p className="text-sm text-slate-400 dark:text-slate-500">@{displayUsername}</p>
            )}
            {displayBio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{displayBio}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-400 dark:text-slate-500">
              {displayEmail && (
                <span className="flex items-center gap-1">
                  <Mail size={11} /> {displayEmail}
                </span>
              )}
              {graphProfile?.jobTitle && (
                <span className="flex items-center gap-1">
                  <Briefcase size={11} /> {graphProfile.jobTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('profile.posts'), value: totalPosts },
            { label: t('profile.liked'), value: appwriteUser?.liked?.length ?? 0 },
            { label: t('profile.saved'), value: 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Microsoft Graph info — own profile + Microsoft account only */}
        {isOwnProfile && isMicrosoftUser && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-[#009cd1]/10 dark:bg-[#009cd1]/20 flex items-center justify-center">
                <User size={15} className="text-[#009cd1]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('profile.microsoftIdentity')}</p>
              {isLoadingGraph && <Loader2 size={13} className="animate-spin text-slate-400 ml-auto" />}
            </div>
            <div className="px-5 py-3">
              {graphProfile ? (
                [
                  { label: t('profile.displayName'), value: graphProfile.displayName, id: 'dn' },
                  { label: t('profile.emailUpn'), value: graphProfile.userPrincipalName, id: 'upn', mono: true },
                  { label: t('profile.jobTitle'), value: graphProfile.jobTitle, id: 'jt' },
                  { label: t('profile.mail'), value: graphProfile.mail, id: 'ml', mono: true },
                ].map(({ label, value, id, mono }) => (
                  <div key={id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-700 last:border-0 gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 w-28">{label}</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {value ? (
                        <>
                          <span className={`text-xs text-slate-800 dark:text-slate-200 truncate ${mono ? 'font-mono' : 'font-medium'}`} title={value}>
                            {value}
                          </span>
                          <button
                            onClick={() => copy(value, id)}
                            className="shrink-0 text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
                          >
                            {copied === id ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                ))
              ) : !isLoadingGraph ? (
                <div className="flex items-center gap-2 py-4 text-xs text-slate-400 dark:text-slate-500">
                  <ShieldAlert size={14} />
                  <span>{t('profile.signInHint')}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Posts section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('profile.posts')} {totalPosts > 0 && <span className="text-slate-400 dark:text-slate-500 font-normal">({totalPosts})</span>}
            </p>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => handleSetPostView('grid')}
                className={`p-1.5 rounded-md transition-all ${postView === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#2F398E] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => handleSetPostView('feed')}
                className={`p-1.5 rounded-md transition-all ${postView === 'feed' ? 'bg-white dark:bg-slate-600 shadow-sm text-[#2F398E] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="p-4">
            {isLoadingPosts ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-[#009cd1]" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Grid3x3 size={20} className="text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.noPosts')}</p>
                {isOwnProfile && (
                  <Link
                    to="/create-post"
                    className="text-xs text-[#009cd1] hover:underline mt-1"
                  >
                    {t('profile.createFirstPost')}
                  </Link>
                )}
              </div>
            ) : postView === 'grid' ? (
              <GridPostList posts={posts} showUser={false} />
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post: any) => <PostCard key={post.$id} post={post} />)}
              </div>
            )}
            <Paginator
              page={postsPage}
              total={totalPosts}
              pageSize={POSTS_PER_PAGE}
              onChange={setPostsPage}
              isLoading={isLoadingPosts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
