import { useState } from 'react';
import { Bell, CheckCheck, Loader2, FileText, BookOpen, Star, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';

type Filter = 'all' | 'unread';

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  form_approved: { icon: <FileText size={15} className="text-[#00c578]" />,  color: 'bg-[#00c578]/12' },
  form_rejected: { icon: <FileText size={15} className="text-[#ef4e49]" />,  color: 'bg-[#ef4e49]/12' },
  form_pending:  { icon: <FileText size={15} className="text-[#f5832f]" />,  color: 'bg-[#f5832f]/12' },
  grade:         { icon: <Star size={15} className="text-[#0057A8]" />,      color: 'bg-[#0057A8]/10' },
  course:        { icon: <BookOpen size={15} className="text-[#0057A8]" />,  color: 'bg-[#0057A8]/10' },
  system:        { icon: <GraduationCap size={15} className="text-[#99a3ad]" />, color: 'bg-[#33485c]/15' },
};

const Notifications = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: rawNotifs = [], isPending } = useGetNotifications(user.id);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const allNotifs = rawNotifs as any[];

  const notifications = allNotifs.filter((n) => filter === 'all' || !n.read);
  const unreadCount = allNotifs.filter((n) => !n.read).length;

  const handleClick = (n: any) => {
    if (!n.read) markRead({ notifId: n.$id, userId: user.id });
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#19191a]">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#19191a] border-b border-slate-100 dark:border-slate-700 px-6 py-4">
        <div>
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#0057A8] dark:text-blue-400" />
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50">
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAll(user.id)}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0057A8] bg-[#0057A8]/8 border border-[#0057A8]/20 hover:bg-[#0085b3]/12 transition-colors disabled:opacity-60"
            >
              {isMarkingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
              {t('notifications.markAllRead')}
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-[#0057A8] text-white'
                  : 'bg-white dark:bg-[#19191a] border border-slate-200 dark:border-[#33485c]/50 text-slate-500 dark:text-[#DCE3E8] hover:bg-slate-50 dark:hover:bg-[#0d2137]'
              }`}
            >
              {f === 'all'
                ? t('notifications.filterAll')
                : `${t('notifications.filterUnread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#19191a] rounded-xl border border-slate-200 dark:border-[#33485c]/50 overflow-hidden">
          {isPending ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#0057A8]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-[#0d2137] flex items-center justify-center">
                <Bell size={24} className="text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                {filter === 'unread' ? t('notifications.noUnread') : t('notifications.empty')}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                {filter === 'unread' ? t('notifications.noUnreadHint') : t('notifications.emptyHint')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-[#0d2137]">
              {notifications.map((n: any) => {
                const meta = TYPE_META[n.type] ?? { icon: <Bell size={15} className="text-[#DCE3E8]" />, color: 'bg-[#33485c]/12' };

                const content = (
                  <div
                    className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#0d2137] transition-colors cursor-pointer ${!n.read ? 'bg-[#0057A8]/4 dark:bg-[#0057A8]/6' : ''}`}
                    onClick={() => handleClick(n)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTimeAgo(n.$createdAt)}</p>
                    </div>

                    {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-[#0057A8] shrink-0 mt-1.5" />}
                  </div>
                );

                return n.linkTo ? (
                  <Link key={n.$id} to={n.linkTo} onClick={() => handleClick(n)}>{content}</Link>
                ) : (
                  <div key={n.$id}>{content}</div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
