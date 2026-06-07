import { useState } from 'react';
import { Bell, Heart, MessageCircle, AtSign, CheckCheck, Loader2 } from 'lucide-react';
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

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; darkColor: string }> = {
  like:    { icon: <Heart size={15} fill="#f87171" className="text-red-400" />,      color: 'bg-red-50',         darkColor: 'dark:bg-red-900/20' },
  comment: { icon: <MessageCircle size={15} className="text-[#009cd1]" />,           color: 'bg-[#009cd1]/8',    darkColor: 'dark:bg-[#009cd1]/20' },
  mention: { icon: <AtSign size={15} className="text-purple-400" />,                 color: 'bg-purple-50',      darkColor: 'dark:bg-purple-900/20' },
  tag:     { icon: <AtSign size={15} className="text-green-500" />,                  color: 'bg-green-50',       darkColor: 'dark:bg-green-900/20' },
};

const Notifications = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: rawNotifs = [], isPending } = useGetNotifications(user.id);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const notifications = (rawNotifs as any[]).filter((n) => filter === 'all' || !n.read);
  const unreadCount = (rawNotifs as any[]).filter((n) => !n.read).length;

  const handleClick = (n: any) => {
    if (!n.read) markRead({ notifId: n.$id, userId: user.id });
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#2F398E]/10 flex items-center justify-center">
              <Bell size={16} className="text-[#2F398E]" />
            </div>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
            >
              {isMarkingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-[#2F398E] text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all'
                ? t('notifications.filterAll')
                : `${t('notifications.filterUnread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {isPending ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#009cd1]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
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
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {notifications.map((n: any) => {
                const meta = TYPE_META[n.type] ?? { icon: <Bell size={15} className="text-slate-400" />, color: 'bg-slate-50', darkColor: 'dark:bg-slate-700' };
                const actorInitials = (n.actorName || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

                const content = (
                  <div
                    className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!n.read ? 'bg-[#009cd1]/4 dark:bg-[#009cd1]/8' : ''}`}
                    onClick={() => handleClick(n)}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}
                      >
                        {actorInitials}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${meta.color} ${meta.darkColor} border-2 border-white dark:border-slate-800`}>
                        {meta.icon && <span className="scale-75">{meta.icon}</span>}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{n.actorName}</span>{' '}
                        {n.message?.replace(n.actorName, '').trim()}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTimeAgo(n.$createdAt)}</p>
                    </div>

                    {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-[#009cd1] shrink-0 mt-1.5" />}
                  </div>
                );

                return n.postId ? (
                  <Link key={n.$id} to={`/posts/${n.postId}`} onClick={() => handleClick(n)}>{content}</Link>
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
