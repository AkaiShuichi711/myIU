import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import Flag from 'react-world-flags';
import { useUserContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import NotificationBell from './NotificationBell';
import { LANGUAGES, getSavedLang, changeLanguage } from '@/lib/googleTranslate';

const Topbar = () => {
  const { signOut } = useUserContext();
  const { theme } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const langRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const activeLang = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  const handleLangChange = (code: string) => {
    setCurrentLang(code);
    setIsLangOpen(false);
    changeLanguage(code);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const c = {
    bg:             isDark ? '#19191a' : '#ffffff',
    border:         isDark ? '#33485c' : '#E0E4EB',
    text:           isDark ? '#e8edf0' : '#272e35',
    textMuted:      isDark ? '#99a3ad' : '#272e35',
    divider:        isDark ? '#33485c' : '#E0E4EB',
    btnHoverBg:     isDark ? '#0d2137' : '#F4F6F8',
    dropdownBg:     isDark ? '#1e2028' : '#ffffff',
    dropdownBorder: isDark ? '#33485c' : '#E0E4EB',
    optionHover:    isDark ? '#0d2137' : '#F8FAFC',
  };

  const [logoutHover, setLogoutHover] = useState(false);

  return (
    <header style={{
      background: c.bg,
      borderBottom: `1px solid ${c.border}`,
      padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', height: '52px', flexShrink: 0,
      transition: 'background 0.2s, border-color 0.2s',
      position: 'relative', zIndex: 50,
    }}>

      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/assets/images/logo_aftersignin.svg"
          alt="myIU"
          style={{ height: '34px', width: 'auto' }}
        />
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

        {/* Notification bell */}
        <NotificationBell />

        <div style={{ width: 1, height: 20, background: c.divider, margin: '0 6px', flexShrink: 0 }} />

        {/* Language switcher */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLangOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 8px', borderRadius: '6px',
              border: `1px solid ${c.border}`,
              background: 'transparent', cursor: 'pointer',
              color: c.text, fontSize: '12px', fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = c.btnHoverBg}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <Flag code={activeLang.flagCode} style={{ height: '14px', width: '20px', objectFit: 'cover', borderRadius: '2px' }} />
            <ChevronDown size={10} style={{
              color: c.textMuted,
              transform: isLangOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }} />
          </button>

          {isLangOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: c.dropdownBg, border: `1px solid ${c.dropdownBorder}`,
              borderRadius: '8px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.1)',
              minWidth: '160px', maxHeight: '320px', overflowY: 'auto', zIndex: 100,
              padding: '4px',
            }}>
              {LANGUAGES.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleLangChange(opt.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    width: '100%', padding: '7px 10px', borderRadius: '6px',
                    background: opt.code === currentLang
                      ? (isDark ? 'rgba(241,90,34,0.15)' : 'rgba(241,90,34,0.08)')
                      : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: '12.5px',
                    color: opt.code === currentLang ? '#F15A22' : c.text,
                    fontWeight: opt.code === currentLang ? 600 : 400,
                    textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (opt.code !== currentLang)
                      (e.currentTarget as HTMLElement).style.background = c.optionHover;
                  }}
                  onMouseLeave={e => {
                    if (opt.code !== currentLang)
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <Flag code={opt.flagCode} style={{ height: '13px', width: '19px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: c.divider, margin: '0 6px', flexShrink: 0 }} />

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          title="Sign out"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: logoutHover ? '#FEF2F2' : 'transparent',
            border: `1px solid ${logoutHover ? '#FCA5A5' : c.border}`,
            borderRadius: '6px', padding: '5px 10px',
            color: logoutHover ? '#ef4444' : c.textMuted,
            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </button>

      </div>
    </header>
  );
};

export default Topbar;
