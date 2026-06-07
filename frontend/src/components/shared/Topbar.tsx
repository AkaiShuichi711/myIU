import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { LogOut, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { useUserContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import NotificationBell from './NotificationBell';

const languageOptions = [
  { code: 'en' as const, label: 'English', flagCode: 'gb' },
  { code: 'vi' as const, label: 'Tiếng Việt', flagCode: 'vn' },
] as const;
type LangCode = (typeof languageOptions)[number]['code'];

const Topbar = () => {
  const { user } = useUserContext();
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const currentLangCode = (languageOptions.some((o) => o.code === i18n.language?.split('-')[0])
    ? i18n.language?.split('-')[0]
    : 'en') as LangCode;
  const activeLang = languageOptions.find((o) => o.code === currentLangCode) ?? languageOptions[0];

  const changeLanguage = (lng: LangCode) => {
    void i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsLangOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const colors = {
    bg:          isDark ? '#0F172A' : '#ffffff',
    border:      isDark ? '#1E293B' : '#E2E8F0',
    shadow:      isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.06)',
    text:        isDark ? '#F1F5F9' : '#0F172A',
    textMuted:   isDark ? '#94A3B8' : '#64748B',
    divider:     isDark ? '#334155' : '#E2E8F0',
    avatarBorder:isDark ? '#334155' : '#E2E8F0',
    btnHoverBg:  isDark ? '#1E293B' : '#F1F5F9',
    dropdownBg:  isDark ? '#1E293B' : '#ffffff',
    dropdownBorder: isDark ? '#334155' : '#E2E8F0',
    optionHover: isDark ? '#253450' : '#F8FAFC',
  };

  const iconBtnStyle = (hovered: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', transition: 'background 0.15s',
    background: hovered ? colors.btnHoverBg : 'transparent',
    color: colors.textMuted,
  });

  const [themeHover, setThemeHover] = useState(false);

  return (
    <header style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: colors.shadow,
      width: '100%',
      height: '64px',
      flexShrink: 0,
      transition: 'background 0.2s, border-color 0.2s',
      position: 'relative',
      zIndex: 50,
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/images/logo_aftersignin.svg" alt="myIU" style={{ height: '44px' }} />
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Notification bell */}
        <NotificationBell />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: colors.divider, margin: '0 4px', flexShrink: 0 }} />

        {/* Language switcher */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLangOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: 'transparent', cursor: 'pointer',
              color: colors.text, fontSize: '12px', fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = colors.btnHoverBg}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <Flag code={activeLang.flagCode} style={{ height: '16px', width: '22px', objectFit: 'cover', borderRadius: '2px' }} />
            <ChevronDown size={11} style={{ color: colors.textMuted, transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {isLangOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: colors.dropdownBg, border: `1px solid ${colors.dropdownBorder}`,
              borderRadius: '10px', boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '150px', overflow: 'hidden', zIndex: 100,
            }}>
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => changeLanguage(opt.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 14px',
                    background: opt.code === currentLangCode ? (isDark ? '#253450' : '#EEF2FF') : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: '13px',
                    color: opt.code === currentLangCode ? '#2F398E' : colors.text,
                    fontWeight: opt.code === currentLangCode ? 600 : 400,
                    textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (opt.code !== currentLangCode) (e.currentTarget as HTMLElement).style.background = colors.optionHover;
                  }}
                  onMouseLeave={e => {
                    if (opt.code !== currentLangCode) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <Flag code={opt.flagCode} style={{ height: '14px', width: '20px', objectFit: 'cover', borderRadius: '2px' }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={iconBtnStyle(themeHover)}
          onMouseEnter={() => setThemeHover(true)}
          onMouseLeave={() => setThemeHover(false)}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#F59E0B' }} />
            : <Moon size={16} style={{ color: '#64748B' }} />
          }
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: colors.divider, margin: '0 4px', flexShrink: 0 }} />

        {/* Avatar + name */}
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00B4D8 0%, #323393 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '12px',
            border: `2px solid ${colors.avatarBorder}`, flexShrink: 0,
          }}>
            {initials}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>
            {user?.name || 'User'}
          </span>
        </div> */}

        {/* Sign out */}
        <button
          onClick={() => (window.location.href = '/signout')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#2F398E', border: 'none',
            borderRadius: '8px', padding: '6px 12px',
            color: '#fff', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            transition: 'background 0.2s', marginLeft: '2px',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#243476'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#2F398E'}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Topbar;
