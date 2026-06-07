import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { User, Building2, ChevronRight } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    pageBg:    isDark ? '#0F172A' : '#F8FAFC',
    cardBg:    isDark ? '#1E293B' : '#ffffff',
    border:    isDark ? '#334155' : '#E2E8F0',
    borderHov: isDark ? '#475569' : '#CBD5E1',
    heading:   isDark ? '#F1F5F9' : '#0F172A',
    sub:       isDark ? '#94A3B8' : '#64748B',
    shadow:    isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
    shadowHov: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  };

  const cardStyle = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px', padding: '36px',
    display: 'flex' as const, flexDirection: 'column' as const, gap: '16px',
    cursor: 'pointer', textAlign: 'left' as const, width: '100%',
    boxShadow: colors.shadow,
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: colors.pageBg, padding: 0, margin: 0 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "900px" }}>

          <div style={{ marginBottom: "80px" }}>
            <h1 style={{ color: colors.heading, fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {getGreeting()}, {user?.name ? user.name.trim().split(" ").slice(-1)[0] : "there"}!
            </h1>
            <p style={{ color: colors.sub, fontSize: "15px", margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
              {t('home.welcome')}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            {/* Profile Card */}
            <button
              onClick={() => navigate("/profile")}
              style={cardStyle}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = colors.borderHov;
                el.style.boxShadow = colors.shadowHov;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = colors.border;
                el.style.boxShadow = colors.shadow;
                el.style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", flexShrink: 0, background: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,119,182,0.2)" }}>
                <User size={28} color="#fff" />
              </div>
              <div>
                <div style={{ color: colors.heading, fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{t('home.myProfile')}</div>
                <div style={{ color: colors.sub, fontSize: "14px", lineHeight: 1.5 }}>{t('home.myProfileDesc')}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#0077B6", fontSize: "13px", fontWeight: 600 }}>
                {t('home.viewProfile')} <ChevronRight size={16} />
              </div>
            </button>

            {/* Tenant Card */}
            <button
              onClick={() => navigate("/tenant")}
              style={cardStyle}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = colors.borderHov;
                el.style.boxShadow = colors.shadowHov;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = colors.border;
                el.style.boxShadow = colors.shadow;
                el.style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", flexShrink: 0, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(99,102,241,0.2)" }}>
                <Building2 size={28} color="#fff" />
              </div>
              <div>
                <div style={{ color: colors.heading, fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{t('home.tenantInfo')}</div>
                <div style={{ color: colors.sub, fontSize: "14px", lineHeight: 1.5 }}>{t('home.tenantDesc')}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#6366F1", fontSize: "13px", fontWeight: 600 }}>
                {t('home.viewTenant')} <ChevronRight size={16} />
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
