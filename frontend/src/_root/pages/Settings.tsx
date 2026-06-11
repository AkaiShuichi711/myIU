import { useState } from 'react';
import { Loader2, Monitor, Smartphone, Palette, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { useUserContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const languageOptions = [
  { code: 'en' as const, label: 'English (US)', flagCode: 'gb' },
  { code: 'vi' as const, label: 'Tiếng Việt', flagCode: 'vn' },
] as const;
type LangCode = (typeof languageOptions)[number]['code'];

import { useGetAccountSessions } from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';

type Tab = 'appearance' | 'sessions';

const Settings = () => {
  const { user: _user } = useUserContext();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('appearance');

  const currentLangCode = (languageOptions.some((o) => o.code === i18n.language?.split('-')[0])
    ? i18n.language?.split('-')[0]
    : 'en') as LangCode;

  const changeLanguage = async (lng: LangCode) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const { data: sessionsData, isPending: isLoadingSessions } = useGetAccountSessions();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: t('settings.tabAppearance'), icon: <Palette size={15} /> },
    { id: 'sessions',   label: t('settings.tabSessions'),   icon: <Monitor size={15} /> },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center">
              <Palette size={18} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('settings.title')}</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-4">
        {/* Tab bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === tb.id
                    ? 'border-[#2F398E] text-[#2F398E] bg-[#2F398E]/4 dark:bg-[#2F398E]/10'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tb.icon}
                <span className="hidden sm:inline">{tb.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── APPEARANCE TAB ── */}
        {tab === 'appearance' && (
          <div className="flex flex-col gap-4">
            {/* Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
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
                        ? 'border-[#0068FF] bg-[#0068FF]/5 dark:bg-[#0068FF]/10'
                        : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Flag code={opt.flagCode} className="h-7 w-10 object-cover rounded-[4px] shadow-sm shrink-0" />
                    <span className={`text-sm font-semibold flex-1 ${currentLangCode === opt.code ? 'text-[#0068FF]' : 'text-slate-700 dark:text-slate-200'}`}>
                      {opt.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${currentLangCode === opt.code ? 'border-[#0068FF]' : 'border-slate-300 dark:border-slate-500'}`}>
                      {currentLangCode === opt.code && <div className="w-2 h-2 rounded-full bg-[#0068FF]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {tab === 'sessions' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.tabSessions')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.sessionsDesc')}</p>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
              {isLoadingSessions ? (
                <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#0068FF]" /></div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
