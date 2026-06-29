import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User, Network, Bell, Settings, BookOpen, FileText, Home,
  ChevronLeft, ChevronRight, GraduationCap, Headset, Mail,
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
      { labelKey: 'nav.mail',    route: '',         icon: Mail, href: 'https://outlook.office365.com/mail/' },
    ],
  },
  {
    sectionKey: 'nav.sectionAccount',
    links: [
      { labelKey: 'nav.notifications', route: '/notifications', icon: Bell, badge: 'notifs' as const },
      { labelKey: 'nav.profile',        route: '/profile',       icon: User },
      { labelKey: 'nav.tenant',         route: '/tenant',        icon: Network },
      { labelKey: 'nav.settings',       route: '/settings',      icon: Settings },
      { labelKey: 'nav.support',         route: '/support',        icon: Headset },
    ],
  },
] as const;

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('myiu-sidebar-collapsed') === 'true'
  );

  function toggleCollapse() {
    setCollapsed(v => {
      localStorage.setItem('myiu-sidebar-collapsed', String(!v));
      return !v;
    });
  }

  const { data: notifs = [] } = useGetNotifications(user.id);
  const unreadCount = (notifs as any[]).filter((n) => !n.read).length;

  const displayName = user?.name
    ? user.name.trim().split(/\s+/).slice(-2).join(' ')
    : 'User';

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 h-full overflow-hidden bg-white dark:bg-[#19191a] border-r border-[#E0E4EB] dark:border-[#33485c]"
      style={{
        width: collapsed ? '52px' : '220px',
        transition: 'width 0.18s ease',
      }}
    >

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-3' : ''}>

            {/* Section label — expanded */}
            {!collapsed && (
              <p
                className="mb-1 text-[9px] font-bold tracking-[0.16em] uppercase select-none text-slate-400 dark:text-[#4d6070]"
                style={{ padding: '0 10px' }}
              >
                {t(section.sectionKey as string)}
              </p>
            )}

            {/* Section divider — collapsed */}
            {collapsed && si > 0 && (
              <div className="bg-[#E0E4EB] dark:bg-[#33485c]" style={{ height: '1px', margin: '6px 8px' }} />
            )}

            {section.links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.route ||
                (link.route === '/courses' && pathname.startsWith('/courses')) ||
                (link.route === '/forms'   && pathname.startsWith('/forms'));

              const badge =
                (link as any).badge === 'notifs' && unreadCount > 0 ? unreadCount : null;

              const href = (link as any).href as string | undefined;
              const sharedStyle = {
                padding: collapsed ? '7px 0' : '7px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : '9px',
                background: isActive ? 'rgba(241,90,34,0.07)' : 'transparent',
                margin: '1px 4px',
                borderRadius: '6px',
              };
              const sharedProps = {
                title: collapsed ? t(link.labelKey as string) : undefined,
                className: 'relative flex items-center transition-all duration-100',
                style: sharedStyle,
                onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(241,90,34,0.05)';
                },
                onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                  (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(241,90,34,0.07)' : 'transparent';
                },
              };

              const inner = (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2"
                      style={{ width: '3px', height: '16px', background: '#F15A22', borderRadius: '0 3px 3px 0' }}
                    />
                  )}
                  <div className="relative shrink-0">
                    <Icon size={15} style={{ color: isActive ? '#F15A22' : '#272e35' }} />
                    {badge && collapsed && (
                      <span className="absolute -top-1 -right-1 w-[7px] h-[7px] rounded-full bg-red-500" />
                    )}
                  </div>
                  {!collapsed && (
                    <span
                      className="flex-1 flex items-center justify-between leading-none text-[12.5px] font-medium truncate"
                      style={{ color: isActive ? '#F15A22' : '#272e35' }}
                    >
                      {t(link.labelKey as string)}
                      {badge && (
                        <span className="min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none shrink-0">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </span>
                  )}
                </>
              );

              if (href) {
                return (
                  <a key={link.labelKey} href={href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={link.route} to={link.route} {...sharedProps}>
                  {inner}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────────────── */}
      <button
        onClick={toggleCollapse}
        className="flex items-center justify-center shrink-0 transition-colors border-t border-[#E0E4EB] dark:border-[#33485c] text-slate-400 hover:text-[#F15A22]"
        style={{ height: '36px' }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* ── User footer ──────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center border-t border-[#E0E4EB] dark:border-[#33485c]"
        style={{
          padding: collapsed ? '10px 0' : '10px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : '9px',
        }}
      >
        <Link
          to={`/update-profile/${user?.id}`}
          title={collapsed ? displayName : undefined}
          className="flex items-center shrink-0"
        >
          <UserAvatar name={user?.name || '?'} className="w-[26px] h-[26px] text-[10px] rounded-md" />
        </Link>
        {!collapsed && (
          <Link
            to={`/update-profile/${user?.id}`}
            className="min-w-0 flex-1 overflow-hidden hover:text-[#F15A22] transition-colors"
          >
            <p
              className="text-[11.5px] font-semibold text-slate-700 dark:text-[#bfc6cc] truncate leading-none"
              title={user?.name || 'User'}
            >
              {displayName}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-[#4d6070] mt-0.5 truncate">{user?.email || ''}</p>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
