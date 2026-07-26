import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Loader2, CheckCheck, FileText, BookOpen, Star, GraduationCap } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/react-query/queriesAndMutations';
import { formatTimeAgo } from '@/lib/utils';

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  form_approved: { icon: <FileText size={15} className="text-[#00c578]" />,       color: 'bg-[#00c578]/12' },
  form_rejected: { icon: <FileText size={15} className="text-[#ef4e49]" />,       color: 'bg-[#ef4e49]/12' },
  form_pending:  { icon: <FileText size={15} className="text-[#f5832f]" />,       color: 'bg-[#f5832f]/12' },
  grade:         { icon: <Star size={15} className="text-[#0057A8]" />,           color: 'bg-[#0057A8]/10' },
  course:        { icon: <BookOpen size={15} className="text-[#0057A8]" />,       color: 'bg-[#0057A8]/10' },
  system:        { icon: <GraduationCap size={15} className="text-[#99a3ad]" />,  color: 'bg-[#33485c]/15' },
};

const NotificationBell = () => {
  const { user } = useUserContext();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [], isPending } = useGetNotifications(user.id);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const unreadCount = (notifications as any[]).filter((n) => !n.read).length;
  const preview = (notifications as any[]).slice(0, 5);

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
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
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
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#0085b3] transition-colors"
              >
                <CheckCheck size={13} /> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#0057A8]" />
              </div>
            ) : preview.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-center">
                <Bell size={28} className="text-slate-200" />
                <p className="text-xs text-slate-400">Chưa có thông báo nào</p>
              </div>
            ) : (
              preview.map((n: any) => {
                const meta = TYPE_META[n.type] ?? { icon: <Bell size={15} className="text-slate-400" />, color: 'bg-slate-100' };
                return (
                  <button
                    key={n.$id}
                    onClick={() => handleClickNotif(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                      !n.read ? 'bg-[#0057A8]/4' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(n.$createdAt)}</p>
                    </div>

                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#0057A8] shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {(notifications as any[]).length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-50">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-[#0057A8] hover:underline"
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
