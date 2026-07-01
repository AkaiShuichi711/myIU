import { useState } from 'react';
import { Loader2, Monitor, Smartphone, Tablet, Palette, MapPin, ShieldOff, Globe, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { useUserContext } from '@/context/AuthContext';
import { LANGUAGES, getSavedLang, changeLanguage } from '@/lib/googleTranslate';

import { useGetAccountSessions, useRevokeSession, useRevokeOtherSessions } from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';

type Tab = 'appearance' | 'sessions';

type LoginSession = {
  id: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  countryCode?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  current?: boolean;
  createdAt?: string;
  lastActive?: string;
};

function DeviceIcon({ type }: { type?: string }) {
  const cls = 'text-slate-400 dark:text-slate-500';
  if (type === 'mobile') return <Smartphone size={17} className={cls} />;
  if (type === 'tablet') return <Tablet size={17} className={cls} />;
  return <Monitor size={17} className={cls} />;
}

function SessionCard({ s, onRevoke, revoking }: { s: LoginSession; onRevoke: (id: string) => void; revoking: boolean }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const hasLocation = s.city && s.city !== 'Unknown' && s.city !== 'Local';
  const isLocal = s.city === 'Local' || s.country === 'Local Network';
  const locationStr = isLocal
    ? 'Mạng nội bộ'
    : hasLocation ? `${s.city}${s.countryCode ? `, ${s.country}` : ''}` : s.country || 'Không xác định';

  const timeStr = s.lastActive
    ? formatTimeAgo(s.lastActive)
    : s.createdAt ? formatTimeAgo(s.createdAt) : '—';

  const isClickable = !s.current;

  return (
    <div className={`transition-colors ${s.current ? 'bg-green-50/60 dark:bg-green-900/10' : ''}`}>
      {/* Main row — clickable for non-current sessions */}
      <div
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={() => isClickable && setExpanded(v => !v)}
        onKeyDown={e => isClickable && e.key === 'Enter' && setExpanded(v => !v)}
        className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${
          isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 select-none' : ''
        } ${expanded ? 'bg-slate-50 dark:bg-slate-700/40' : ''}`}
      >
        {/* Device icon */}
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
          s.current
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
            : expanded
              ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
              : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600'
        }`}>
          <DeviceIcon type={s.deviceType} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {s.browser || 'Unknown Browser'}{s.browserVersion ? ` ${s.browserVersion}` : ''}
            </p>
            {s.current && (
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                {t('settings.currentSession')}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {s.os || 'Unknown OS'}
          </p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              {s.countryCode && !isLocal ? (
                <Flag code={s.countryCode} className="h-3 w-4.5 object-cover rounded-[2px] shrink-0" />
              ) : (
                <Globe size={11} className="shrink-0" />
              )}
              {locationStr}
            </span>

            {s.ipAddress && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <MapPin size={10} className="shrink-0" />
                {s.ipAddress}
              </span>
            )}

            <span className="text-xs text-slate-400 dark:text-slate-500">{timeStr}</span>
          </div>
        </div>

        {/* Chevron for non-current, nothing for current */}
        {isClickable && (
          <div className="shrink-0 mt-1 text-slate-300 dark:text-slate-600">
            {expanded
              ? <ChevronUp size={15} />
              : <ChevronDown size={15} />}
          </div>
        )}
      </div>

      {/* Expanded action panel */}
      {expanded && isClickable && (
        <div className="mx-5 mb-3 rounded-xl border border-red-100 dark:border-red-800/50 bg-red-50/60 dark:bg-red-900/10 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Không nhận ra thiết bị này?{' '}
            <span className="text-red-500 font-semibold">Đăng xuất ngay để bảo vệ tài khoản.</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={() => { onRevoke(s.id); setExpanded(false); }}
              disabled={revoking}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {revoking
                ? <><Loader2 size={12} className="animate-spin" /> Đang xử lý...</>
                : <><LogOut size={12} /> Đăng xuất</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Settings = () => {
  const { user: _user } = useUserContext();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('appearance');
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const handleLangChange = (code: string) => {
    setCurrentLang(code);
    changeLanguage(code);
  };

  const { data: sessionsData, isPending: isLoadingSessions } = useGetAccountSessions();
  const { mutateAsync: doRevoke } = useRevokeSession();
  const { mutateAsync: doRevokeOthers } = useRevokeOtherSessions();

  const sessions: LoginSession[] = (sessionsData as any)?.sessions ?? [];
  const currentSession = sessions.find(s => s.current);
  const otherSessions = sessions.filter(s => !s.current);

  async function handleRevoke(id: string) {
    setRevokingId(id);
    try { await doRevoke(id); } finally { setRevokingId(null); }
  }

  async function handleRevokeOthers() {
    setRevokingOthers(true);
    setShowRevokeConfirm(false);
    try { await doRevokeOthers(); } finally { setRevokingOthers(false); }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: t('settings.tabAppearance'), icon: <Palette size={15} /> },
    { id: 'sessions',   label: t('settings.tabSessions'),   icon: <Monitor size={15} /> },
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#19191a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#19191a] border-b border-slate-100 dark:border-slate-700 px-6 py-5">
        <div>
          <div className="flex items-center gap-3">
            <Palette size={20} className="text-slate-500 dark:text-slate-400" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('settings.title')}</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {/* Tab bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  tab === tb.id
                    ? 'border-[#009CD1] text-[#009CD1] bg-[#009CD1]/4 dark:bg-[#009CD1]/10'
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
            {/* Language */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('settings.langTitle')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('settings.langDesc')}</p>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-2.5">
                {LANGUAGES.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => handleLangChange(opt.code)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      currentLang === opt.code
                        ? 'border-[#009CD1] bg-[#009CD1]/5 dark:bg-[#009CD1]/10'
                        : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Flag code={opt.flagCode} className="h-5 w-7 object-cover rounded-[3px] shadow-sm shrink-0" />
                    <span className={`text-xs font-semibold truncate ${currentLang === opt.code ? 'text-[#009CD1]' : 'text-slate-700 dark:text-slate-200'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {tab === 'sessions' && (
          <div className="flex flex-col gap-4">
            {/* Info banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 text-xs text-blue-600 dark:text-blue-400">
              Đây là danh sách các thiết bị đang đăng nhập vào tài khoản của bạn. Nếu phát hiện thiết bị lạ, hãy đăng xuất ngay.
            </div>

            {/* Current session */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thiết bị hiện tại</p>
              </div>
              {isLoadingSessions ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#009CD1]" /></div>
              ) : currentSession ? (
                <SessionCard s={currentSession} onRevoke={handleRevoke} revoking={revokingId === currentSession.id} />
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
                  {sessions.length === 0 ? 'Không có phiên nào. Hãy đăng nhập lại để xem.' : '—'}
                </p>
              )}
            </div>

            {/* Other sessions */}
            {(isLoadingSessions || otherSessions.length > 0) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Thiết bị khác {otherSessions.length > 0 ? `(${otherSessions.length})` : ''}
                  </p>
                  {otherSessions.length > 1 && (
                    <button
                      onClick={() => setShowRevokeConfirm(true)}
                      disabled={revokingOthers}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {revokingOthers
                        ? <><Loader2 size={12} className="animate-spin" /> Đang xử lý...</>
                        : <><ShieldOff size={12} /> Đăng xuất tất cả</>}
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[420px] overflow-y-auto">
                  {isLoadingSessions ? (
                    <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#009CD1]" /></div>
                  ) : otherSessions.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">Không có thiết bị nào khác</p>
                  ) : (
                    otherSessions.map(s => (
                      <SessionCard key={s.id} s={s} onRevoke={handleRevoke} revoking={revokingId === s.id} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm revoke-all modal */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto mb-4">
              <ShieldOff size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 text-center">Đăng xuất tất cả thiết bị?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
              Tất cả {otherSessions.length} thiết bị khác sẽ bị đăng xuất ngay lập tức.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowRevokeConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleRevokeOthers}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Đăng xuất tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
