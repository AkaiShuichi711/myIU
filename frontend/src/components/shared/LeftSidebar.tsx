import { Link, useLocation } from 'react-router-dom';
import {
  User, Network, Bell, Settings, BookOpen, FileText, Home,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/context/AuthContext';
import { useGetNotifications } from '@/lib/react-query/queriesAndMutations';
import UserAvatar from './UserAvatar';

const NAV_SECTIONS = [
  {
    sectionKey: 'nav.sectionAcademic',
    links: [
      { labelKey: 'nav.home',    route: '/home',    icon: Home },
      { labelKey: 'nav.courses', route: '/courses', icon: BookOpen },
      { labelKey: 'nav.forms',   route: '/forms',   icon: FileText },
    ],
  },
  {
    sectionKey: 'nav.sectionAccount',
    links: [
      { labelKey: 'nav.notifications', route: '/notifications', icon: Bell, badge: 'notifs' as const },
      { labelKey: 'nav.profile',        route: '/profile',       icon: User },
      { labelKey: 'nav.tenant',         route: '/tenant',        icon: Network },
      { labelKey: 'nav.settings',       route: '/settings',      icon: Settings },
    ],
  },
] as const;

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { t } = useTranslation();

  const { data: notifs = [] } = useGetNotifications(user.id);
  const unreadCount = (notifs as any[]).filter((n) => !n.read).length;

  return (
    <aside className="w-full max-w-[220px] border-r border-slate-200 dark:border-[#33485c]/50 bg-white dark:bg-[#001a33] hidden md:flex flex-col shrink-0 h-full transition-colors duration-200">

      {/* Brand bar */}
      {/* <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80"> */}
      {/* <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg,#0068FF,#2F398E)' }}
        >
          <GraduationCap size={14} className="text-white" />
        </div> */}
      {/* <div className="min-w-0">
          <p className="text-[13px] font-black text-slate-900 dark:text-slate-50 leading-none tracking-tight">myIU</p>
          <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-[#0068FF]/70 leading-none mt-0.5 tracking-[0.12em] uppercase">Portal v3</p>
        </div> */}
      {/* </div> */}

      {/* Navigation */}
      <nav className="flex flex-col flex-1 px-2 py-2.5 gap-3.5 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {section.sectionKey && (
              <p className="px-2 mb-0.5 text-[9px] font-bold tracking-[0.14em] uppercase text-slate-400 dark:text-[#4d6070] select-none">
                {t(section.sectionKey as string)}
              </p>
            )}

            {section.links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.route ||
                (link.route === '/courses' && pathname.startsWith('/courses')) ||
                (link.route === '/forms'   && pathname.startsWith('/forms'));

              const badge =
                (link as any).badge === 'notifs' && unreadCount > 0 ? unreadCount : null;

              return (
                <Link
                  key={link.route}
                  to={link.route}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${isActive
                      ? 'bg-[#0068FF]/8 dark:bg-[#0068FF]/15 text-[#0068FF]'
                      : 'text-[#0F172A] dark:text-[#bfc6cc]'
                    }`}
                >
                  {/* Left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-[#0068FF]" />
                  )}

                  <Icon
                    size={15}
                    className={`shrink-0 transition-colors ${isActive
                        ? 'text-[#0068FF]'
                        : 'text-[#0F172A] dark:text-[#bfc6cc]'
                      }`}
                  />

                  <span className="flex-1 truncate leading-none">{t(link.labelKey as string)}</span>

                  {badge && (
                    <span className="min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none shrink-0">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      {/* <div className="px-2 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to={`/update-profile/${user?.id}`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#0068FF,#2F398E)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-none">{user?.name || 'User'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Online</span>
            </div>
          </div>
        </Link>
      </div> */}

  <div className="px-2 pb-3 pt-2 border-t border-slate-100 dark:border-[#33485c]/40">
  <Link
    to={`/update-profile/${user?.id}`}
    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0d2137] transition-colors group"
  >
    <UserAvatar name={user?.name || '?'} className="w-7 h-7 text-[10px]" />
    <div className="min-w-0 flex-1">
      <p
        className="text-[12px] font-semibold text-slate-700 dark:text-[#99a3ad] truncate leading-none"
        title={user?.name || 'User'}
      >
        {user?.name
          ? user.name.trim().split(/\s+/).slice(-2).join(' ')
          : 'User'}
      </p>
    </div>
  </Link>
</div>

    </aside>
  );
};

export default LeftSidebar;
