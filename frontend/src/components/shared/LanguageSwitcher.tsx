import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';

const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English', flagCode: 'gb' },
  { code: 'vi' as const, label: 'Tiếng Việt', flagCode: 'vn' },
] as const;

type LangCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

interface LanguageSwitcherProps {
  /** 'light' = white background (Topbar); 'dark' = dark/gradient background (AuthLayout) */
  variant?: 'light' | 'dark';
}

const LanguageSwitcher = ({ variant = 'light' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<LangCode>(() => {
    const saved = localStorage.getItem('language') as LangCode | null;
    return LANGUAGE_OPTIONS.some((o) => o.code === saved) ? (saved as LangCode) : 'en';
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync when i18n changes (e.g. changed from another component)
  useEffect(() => {
    const onLangChange = (lng: string) => {
      const code = lng.split('-')[0] as LangCode;
      if (LANGUAGE_OPTIONS.some((o) => o.code === code)) setCurrent(code);
    };
    i18n.on('languageChanged', onLangChange);
    return () => { i18n.off('languageChanged', onLangChange); };
  }, [i18n]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = async (lng: LangCode) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setCurrent(lng);
    setOpen(false);
  };

  const activeLang = LANGUAGE_OPTIONS.find((o) => o.code === current) ?? LANGUAGE_OPTIONS[0];
  const isDark = variant === 'dark';

  const btnBg = isDark ? 'rgba(255,255,255,0.08)' : 'transparent';
  const btnBgHover = isDark ? 'rgba(255,255,255,0.15)' : '#F1F5F9';
  const textColor = isDark ? '#ffffff' : '#334155';
  const chevronColor = isDark ? 'rgba(255,255,255,0.6)' : '#94A3B8';
  const dropdownBg = isDark ? '#1C274C' : '#ffffff';
  const dropdownBorder = isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
  const dropdownShadow = isDark
    ? '0 8px 32px rgba(0,0,0,0.5)'
    : '0 8px 24px rgba(0,0,0,0.12)';
  const optionHover = isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFC';
  const optionActive = isDark ? 'rgba(0,156,209,0.2)' : '#EEF2FF';
  const optionActiveText = isDark ? '#009CD1' : '#009CD1';

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '6px 10px', borderRadius: '8px',
          background: open ? btnBgHover : btnBg,
          border: isDark ? 'none' : `1px solid #E2E8F0`,
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = btnBgHover)}
        onMouseLeave={e => (e.currentTarget.style.background = open ? btnBgHover : btnBg)}
      >
        <Flag
          code={activeLang.flagCode}
          className="object-cover rounded-sm shadow-sm"
          style={{ height: '15px', width: '22px', display: 'block' }}
        />
        <span style={{ fontSize: '13px', fontWeight: 500, color: textColor, whiteSpace: 'nowrap' }}>
          {activeLang.label}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: chevronColor,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: dropdownBg, border: `1px solid ${dropdownBorder}`,
          borderRadius: '10px', boxShadow: dropdownShadow,
          minWidth: '160px', overflow: 'hidden', zIndex: 9999,
        }}>
          {LANGUAGE_OPTIONS.map((opt) => {
            const isActive = opt.code === current;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => void changeLanguage(opt.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 14px',
                  background: isActive ? optionActive : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? 600 : 400,
                  color: isActive ? optionActiveText : textColor,
                  textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = optionHover; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Flag
                  code={opt.flagCode}
                  className="object-cover rounded-sm"
                  style={{ height: '14px', width: '20px', display: 'block' }}
                />
                <span>{opt.label}</span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: optionActiveText, display: 'block' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
