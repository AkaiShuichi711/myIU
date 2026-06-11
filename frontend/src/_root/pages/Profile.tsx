import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User, Briefcase, Mail, Edit3, ArrowLeft,
  Loader2, ShieldAlert, Copy, CheckCheck,
  GraduationCap, BookOpen, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserById } from '@/lib/react-query/queriesAndMutations';
import { getInitials, isLecturerRole, isAdminRole } from '@/lib/utils';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, getProfileData, isAuthenticated } = useUserContext();
  const [graphProfile, setGraphProfile] = useState<any>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { t } = useTranslation();
  const profileUserId = id || currentUser.id;
  const isOwnProfile = !id || id === currentUser.id;

  const { data: appwriteUser, isPending: isLoadingUser } = useGetUserById(profileUserId);

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

  if (isLoadingUser) {
    return (
      <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#0068FF]" />
      </div>
    );
  }

  const displayName = appwriteUser?.name || (isOwnProfile ? currentUser.name : 'Unknown User');
  const displayEmail = appwriteUser?.email || (isOwnProfile ? currentUser.email : '');
  const displayBio = appwriteUser?.bio || (isOwnProfile ? currentUser.bio : '');
  const displayUsername = appwriteUser?.username || (isOwnProfile ? currentUser.username : '');
  const initials = getInitials(displayName || '?');
  // Derive role from Appwrite document (synced from Azure AD on sign-in)
  const profileRoles: string[] = (appwriteUser?.roles as string[] | undefined) ?? [];
  const isProfileAdmin    = isAdminRole(profileRoles);
  const isProfileLecturer = !isProfileAdmin && isLecturerRole(profileRoles);
  const isProfileStudent  = !isProfileAdmin && !isProfileLecturer;

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-3">
        {/* Profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-20" style={{ background: '#0068FF' }} />

          <div className="px-5 pb-4">
            <div className="flex items-end justify-between -mt-7 mb-3">
              <div
                className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ background: '#0068FF' }}
              >
                {appwriteUser?.imageUrl && !String(appwriteUser.imageUrl).includes('avatars') ? (
                  <img src={appwriteUser.imageUrl} alt={displayName} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{displayName}</h1>
              {isProfileAdmin && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
                  <Shield size={10} /> Admin
                </span>
              )}
              {isProfileLecturer && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <BookOpen size={10} /> Giảng viên
                </span>
              )}
              {isProfileStudent && profileRoles.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <GraduationCap size={10} /> Sinh viên
                </span>
              )}
            </div>
            {displayUsername && (
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">@{displayUsername}</p>
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

        {/* Microsoft Graph info — own profile + Microsoft account only */}
        {isOwnProfile && isMicrosoftUser && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-[#0068FF]/10 dark:bg-[#0068FF]/20 flex items-center justify-center">
                <User size={15} className="text-[#0068FF]" />
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

      </div>
    </div>
  );
};

export default ProfilePage;
