import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, Network, Bookmark, Users, PenSquare, Bell, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import { useGetNotifications } from '@/lib/react-query/queriesAndMutations';

const sidebarLinks = [
  { labelKey: 'nav.home',          route: '/home',         icon: Home },
  { labelKey: 'nav.explore',       route: '/explore',      icon: Compass },
  { labelKey: 'nav.createPost',    route: '/create-post',  icon: PenSquare },
  { labelKey: 'nav.saved',         route: '/saved',        icon: Bookmark },
  { labelKey: 'nav.people',        route: '/all-users',    icon: Users },
  { labelKey: 'nav.notifications', route: '/notifications',icon: Bell },
  { labelKey: 'nav.profile',       route: '/profile',      icon: User },
  { labelKey: 'nav.tenant',        route: '/tenant',       icon: Network },
  { labelKey: 'nav.settings',      route: '/settings',     icon: Settings },
];

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { t } = useTranslation();

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const { data: notifs = [] } = useGetNotifications(user.id);
  const unreadCount = (notifs as any[]).filter((n) => !n.read).length;

  return (
    <aside className="w-full max-w-[220px] border-r border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0 h-full transition-colors duration-200">
      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.route ||
            (link.route === '/home' && pathname === '/');

          return (
            <Link
              key={link.route}
              to={link.route}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-[#2F398E]/8 text-[#2F398E]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2F398E]'
                }`}
            >
              <Icon
                size={18}
                className={`transition-colors shrink-0 ${
                  isActive ? 'text-[#009cd1]' : 'text-slate-400 group-hover:text-[#2F398E]'
                }`}
              />
              <span className="flex-1">{t(link.labelKey)}</span>

              {/* Badge: unread notifications */}
              {link.route === '/notifications' && unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

              {/* Dot: create post */}
              {/* {link.route === '/create-post' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#009cd1] opacity-60" />
              )} */}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
        <Link
          to={`/update-profile/${user?.id}`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #009cd1, #2F398E)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
            {/* <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{t('nav.editProfile')}</p> */}
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default LeftSidebar;
