import { useState } from 'react';
import { Shield, Ban, Activity, Globe, Lock, Loader2, Trash2, Monitor, Smartphone, Palette, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { useUserContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const languageOptions = [
  { code: 'en' as const, label: 'English (US)', flagCode: 'gb' },
  { code: 'vi' as const, label: 'Tiếng Việt', flagCode: 'vn' },
] as const;
type LangCode = (typeof languageOptions)[number]['code'];

import {
  useGetUserById,
  useUpdateUserPrivacy,
  useGetBlockedUsers,
  useUnblockUser,
  useGetUserLikedPosts,
  useGetUserComments,
  useGetAccountSessions,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';
import { Link } from 'react-router-dom';

type Tab = 'privacy' | 'blocked' | 'activity' | 'appearance';
type ActivityTab = 'likes' | 'comments' | 'sessions';

const Settings = () => {
  const { user } = useUserContext();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('privacy');
  const [actTab, setActTab] = useState<ActivityTab>('likes');
  const [saving, setSaving] = useState(false);

  const currentLangCode = (languageOptions.some((o) => o.code === i18n.language?.split('-')[0])
    ? i18n.language?.split('-')[0]
    : 'en') as LangCode;

  const changeLanguage = async (lng: LangCode) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const { data: appwriteUser } = useGetUserById(user.id);
  const { mutateAsync: updatePrivacy } = useUpdateUserPrivacy();
  const { data: blockedList = [], isPending: isLoadingBlocked } = useGetBlockedUsers(user.id);
  const { mutate: unblock } = useUnblockUser();
  const { data: likedPosts = [], isPending: isLoadingLiked } = useGetUserLikedPosts(user.id);
  const { data: userComments = [], isPending: isLoadingComments } = useGetUserComments(user.id);
  const { data: sessionsData, isPending: isLoadingSessions } = useGetAccountSessions();

  const isPrivate = appwriteUser?.isPrivate ?? false;

  const handlePrivacyToggle = async () => {
    setSaving(true);
    try {
      await updatePrivacy({ userId: user.id, isPrivate: !isPrivate });
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'privacy',    label: t('settings.tabPrivacy'),    icon: <Shield size={15} /> },
    { id: 'blocked',    label: t('settings.tabBlocked'),    icon: <Ban size={15} /> },
    { id: 'activity',   label: t('settings.tabActivity'),   icon: <Activity size={15} /> },
    { id: 'appearance', label: t('settings.tabAppearance'), icon: <Palette size={15} /> },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F398E]/10 dark:bg-[#2F398E]/20 flex items-center justify-center">
            <Shield size={18} className="text-[#2F398E]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('settings.title')}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">
        {/* Tab bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === t.id
                    ? 'border-[#2F398E] text-[#2F398E] bg-[#2F398E]/4 dark:bg-[#2F398E]/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PRIVACY TAB ── */}
        {tab === 'privacy' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.privacySectionTitle')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.privacySectionDesc')}</p>
            </div>

            <div className="px-5 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrivate ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  {isPrivate
                    ? <Lock size={18} className="text-orange-400" />
                    : <Globe size={18} className="text-green-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {isPrivate ? t('settings.profilePrivate') : t('settings.profilePublic')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {isPrivate ? t('settings.profilePrivateDesc') : t('settings.profilePublicDesc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePrivacyToggle}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isPrivate ? 'bg-[#2F398E]' : 'bg-slate-200 dark:bg-slate-600'} disabled:opacity-60`}
              >
                {saving ? (
                  <Loader2 size={12} className="animate-spin text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                ) : (
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${isPrivate ? 'left-[26px]' : 'left-0.5'}`} />
                )}
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-200">{currentLangCode === 'vi' ? 'Lưu ý:' : 'Note:'}</strong>{' '}
                {currentLangCode === 'vi'
                  ? <>Thay đổi chế độ hiển thị chỉ ảnh hưởng tới các bài đăng <em>mới</em>. Bài đăng cũ vẫn hiển thị như cũ cho đến khi bạn chỉnh sửa.</>
                  : <>Visibility changes only affect <em>new</em> posts. Old posts remain visible as-is until you edit them.</>}
              </div>
            </div>
          </div>
        )}

        {/* ── BLOCKED TAB ── */}
        {tab === 'blocked' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.blockedTitle')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.blockedDesc')}</p>
            </div>

            {isLoadingBlocked ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-[#009cd1]" />
              </div>
            ) : (blockedList as any[]).length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Ban size={32} className="text-slate-200 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('settings.noBlocked')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.noBlockedHint')}</p>
                <Link
                  to="/all-users"
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: '#2F398E' }}
                >
                  {t('settings.viewUsers')}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {(blockedList as any[]).map((b) => {
                  const initials = (b.blockedName || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <div key={b.$id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
                          {initials}
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{b.blockedName}</p>
                      </div>
                      <button
                        onClick={() => unblock({ blockDocId: b.$id, blockerId: user.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:border-red-100 dark:hover:border-red-800 transition-colors shrink-0"
                      >
                        <Trash2 size={12} /> {t('settings.unblock')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── APPEARANCE TAB ── */}
        {tab === 'appearance' && (
          <div className="flex flex-col gap-4">
            {/* Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.themeTitle')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.themeDesc')}</p>
              </div>
              <div className="px-5 py-5 flex flex-col gap-3">
                {[
                  { value: 'light', labelKey: 'settings.themeLight', descKey: 'settings.themeLightDesc', icon: <Sun size={16} className="text-yellow-400" />, iconBg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                  { value: 'dark',  labelKey: 'settings.themeDark',  descKey: 'settings.themeDarkDesc',  icon: <Moon size={16} className="text-slate-400 dark:text-slate-300" />, iconBg: 'bg-slate-100 dark:bg-slate-700' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { if (theme !== opt.value) toggleTheme(); }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                      theme === opt.value
                        ? 'border-[#2F398E] bg-[#2F398E]/4 dark:bg-[#2F398E]/10'
                        : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${opt.iconBg}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${theme === opt.value ? 'text-[#2F398E] dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {t(opt.labelKey)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t(opt.descKey)}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${theme === opt.value ? 'border-[#2F398E]' : 'border-slate-300 dark:border-slate-500'}`}>
                      {theme === opt.value && <div className="w-2 h-2 rounded-full bg-[#2F398E]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.langTitle')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.langDesc')}</p>
              </div>
              <div className="px-5 py-5 flex flex-col gap-3">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => void changeLanguage(opt.code)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                      currentLangCode === opt.code
                        ? 'border-[#009cd1] bg-[#009cd1]/5 dark:bg-[#009cd1]/10'
                        : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Flag code={opt.flagCode} className="h-7 w-10 object-cover rounded-[4px] shadow-sm shrink-0" />
                    <span className={`text-sm font-semibold flex-1 ${currentLangCode === opt.code ? 'text-[#009cd1]' : 'text-slate-700 dark:text-slate-200'}`}>
                      {opt.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${currentLangCode === opt.code ? 'border-[#009cd1]' : 'border-slate-300 dark:border-slate-500'}`}>
                      {currentLangCode === opt.code && <div className="w-2 h-2 rounded-full bg-[#009cd1]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {tab === 'activity' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.activityTitle')}</p>
            </div>

            <div className="flex border-b border-slate-50 dark:border-slate-700">
              {(['likes', 'comments', 'sessions'] as ActivityTab[]).map((at) => {
                const labelKeys: Record<ActivityTab, string> = {
                  likes: 'settings.tabLikes',
                  comments: 'settings.tabComments',
                  sessions: 'settings.tabSessions',
                };
                return (
                  <button
                    key={at}
                    onClick={() => setActTab(at)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                      actTab === at
                        ? 'border-[#009cd1] text-[#009cd1]'
                        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {t(labelKeys[at])}
                  </button>
                );
              })}
            </div>

            {/* Liked posts */}
            {actTab === 'likes' && (
              <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
                {isLoadingLiked ? (
                  <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#009cd1]" /></div>
                ) : (likedPosts as any[]).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-10">{t('settings.noLikes')}</p>
                ) : (
                  (likedPosts as any[]).map((post) => (
                    <Link key={post.$id} to={`/posts/${post.$id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-700" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                          {post.caption || t('settings.noCaptionPost')}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatTimeAgo(post.$updatedAt)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Comments */}
            {actTab === 'comments' && (
              <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
                {isLoadingComments ? (
                  <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#009cd1]" /></div>
                ) : (userComments as any[]).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-10">{t('settings.noComments')}</p>
                ) : (
                  (userComments as any[]).map((c) => (
                    <Link key={c.$id} to={`/posts/${c.postId}`} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}>
                        {(user.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">{c.body}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatTimeAgo(c.$createdAt)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Sessions */}
            {actTab === 'sessions' && (
              <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
                {isLoadingSessions ? (
                  <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#009cd1]" /></div>
                ) : !sessionsData || (sessionsData as any).sessions?.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-10">{t('settings.noSessions')}</p>
                ) : (
                  (sessionsData as any).sessions?.map((s: any) => {
                    const isMobile = /mobile|android|iphone|ipad/i.test(s.clientName || '');
                    return (
                      <div key={s.$id} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0">
                          {isMobile
                            ? <Smartphone size={16} className="text-slate-400 dark:text-slate-500" />
                            : <Monitor size={16} className="text-slate-400 dark:text-slate-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {s.clientName || 'Unknown device'}{' '}
                            {s.osName && <span className="text-slate-400 dark:text-slate-500 font-normal">{t('settings.on')} {s.osName}</span>}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {s.ip} · {formatTimeAgo(s.$createdAt)}
                          </p>
                        </div>
                        {s.current && (
                          <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full shrink-0">
                            {t('settings.currentSession')}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
