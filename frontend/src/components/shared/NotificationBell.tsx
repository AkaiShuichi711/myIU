import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageCircle, AtSign, Loader2, CheckCheck } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queriesAndMutations';

const ICON_MAP: Record<string, React.ReactNode> = {
  like: <Heart size={13} className="text-red-400" fill="#f87171" />,
  comment: <MessageCircle size={13} className="text-[#1e51f9]" />,
  mention: <AtSign size={13} className="text-purple-400" />,
  tag: <AtSign size={13} className="text-green-400" />,
};

const NotificationBell = () => {
  const { user } = useUserContext();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isPending } = useGetNotifications(user.id);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const unreadCount = (notifications as any[]).filter((n) => !n.read).length;
  const preview = (notifications as any[]).slice(0, 5);

  // Poll for new notifications every 30s
  useEffect(() => {
    if (!user.id) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, user.id] });
    }, 30000);
    return () => clearInterval(interval);
  }, [user.id, queryClient]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClickNotif = (n: any) => {
    if (!n.read) markRead({ notifId: n.$id, userId: user.id });
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <p className="text-sm font-bold text-slate-900">Thông báo</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll(user.id)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#1e51f9] transition-colors"
              >
                <CheckCheck size={13} /> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#1e51f9]" />
              </div>
            ) : preview.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-center">
                <Bell size={28} className="text-slate-200" />
                <p className="text-xs text-slate-400">Chưa có thông báo nào</p>
              </div>
            ) : (
              preview.map((n: any) => (
                <button
                  key={n.$id}
                  onClick={() => handleClickNotif(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                    !n.read ? 'bg-[#1e51f9]/4' : ''
                  }`}
                >
                  {/* Actor avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: '#1e51f9' }}
                  >
                    {(n.actorName || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold">{n.actorName}</span>{' '}
                      {n.message?.replace(n.actorName, '').trim() || n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(n.$createdAt)}</p>
                  </div>

                  {/* Type icon */}
                  <div className="mt-0.5 shrink-0">{ICON_MAP[n.type] ?? <Bell size={13} className="text-slate-300" />}</div>

                  {/* Unread dot */}
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#1e51f9] shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {(notifications as any[]).length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-50">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-[#1e51f9] hover:underline"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
