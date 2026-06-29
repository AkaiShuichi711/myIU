import { useUserContext } from "@/context/AuthContext";
import { ArrowLeft, ShieldCheck, ShieldAlert, Fingerprint, Network, User, GraduationCap, Copy, CheckCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const TenantPage = () => {
  const { getTenantData, isAuthenticated } = useUserContext();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tenant, setTenant] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadTenant();
  }, [isAuthenticated]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenantData();
      setTenant(data);
    } catch (err) {
      setError(t('tenant.fetching'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const c = {
    pageBg:    isDark ? '#19191a' : '#f8fafc',
    cardBg:    isDark ? '#1E293B' : '#ffffff',
    border:    isDark ? '#334155' : '#e2e8f0',
    rowBorder: isDark ? '#334155' : '#f1f5f9',
    heading:   isDark ? '#F1F5F9' : '#19191a',
    label:     isDark ? '#94A3B8' : '#19191a',
    value:     isDark ? '#93C5FD' : '#1e3a5f',
    muted:     isDark ? '#19191a' : '#cbd5e1',
    sectionHdr:isDark ? '#1E293B' : '#f8fafc',
    sectionTxt:isDark ? '#CBD5E1' : '#09090B',
    topBarBg:  isDark ? '#1E293B' : '#fff',
    shadow:    isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.05)',
    btnBorder: isDark ? '#334155' : '#e2e8f0',
    btnColor:  isDark ? '#94A3B8' : '#19191a',
  };

  const Row = ({ label, value, id, mono = true }: { label: string; value?: string; id: string; mono?: boolean }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: `1px solid ${c.rowBorder}`, gap: "12px",
    }}>
      <span style={{ color: c.label, fontSize: "13px", fontWeight: 500, flexShrink: 0, minWidth: "130px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        {value ? (
          <>
            <span style={{
              fontFamily: mono ? "'SF Mono', 'Fira Code', monospace" : "inherit",
              fontSize: "13px", color: c.value, fontWeight: mono ? 500 : 600,
              background: "transparent", border: "0", padding: "0", borderRadius: "6px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "340px",
            }} title={value}>{value}</span>
            <button onClick={() => copy(value, id)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "3px",
              color: copied === id ? "#10b981" : c.muted,
              display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.2s",
            }}>
              {copied === id ? <CheckCheck size={13} /> : <Copy size={13} />}
            </button>
          </>
        ) : (
          <span style={{ color: c.muted, fontSize: "13px" }}>—</span>
        )}
      </div>
    </div>
  );

  const Section = ({ icon, title, accent, children }: {
    icon: React.ReactNode; title: string; accent: string; children: React.ReactNode;
  }) => (
    <div style={{
      background: c.cardBg, borderRadius: "16px", border: `1px solid ${c.border}`,
      overflow: "hidden", boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px",
        borderBottom: `1px solid ${c.rowBorder}`, background: c.sectionHdr,
      }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: "11px", fontWeight: 700, color: c.sectionTxt, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "4px 20px 8px" }}>{children}</div>
    </div>
  );

  const unauthContent = (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: c.cardBg, borderRadius: "20px", padding: "48px 40px",
        boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)",
        maxWidth: "400px", width: "100%", textAlign: "center",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "14px",
          background: isDark ? "#3B1C1C" : "#fff0f0", border: `1px solid ${isDark ? "#7F1D1D" : "#fecaca"}`,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <ShieldAlert size={24} color="#ef4444" />
        </div>
        <h3 style={{ color: c.heading, fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>
          {t('tenant.authRequired')}
        </h3>
        <p style={{ color: c.label, fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px" }}>
          {t('tenant.authDesc')}
        </p>
        <button onClick={() => (window.location.href = "/sign-in")} style={{
          width: "100%", padding: "12px",
          background: "#F15A22",
          border: "none", borderRadius: "12px",
          color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer",
        }}>
          {t('tenant.signInMicrosoft')}
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <div style={{
          width: "40%", minHeight: "100vh", flexShrink: 0,
          background: "#F15A22",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "40px",
        }}>
          <div style={{ color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-2px", opacity: 0.15, marginBottom: "12px" }}>myIU</div>
            <p style={{ fontSize: "13px", opacity: 0.7, lineHeight: 1.6 }}>
              International University<br />{t('tenant.secureTenantPortal')}
            </p>
          </div>
        </div>
        <div style={{ flex: 1, background: c.pageBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          {unauthContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex" }}>
      <div style={{ width: "6px", flexShrink: 0, background: c.border }} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, background: c.pageBg, overflowY: "auto" }}>

        {/* TOP BAR */}
        <div style={{
          background: c.topBarBg, borderBottom: `1px solid ${c.border}`,
          padding: "0 32px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10, boxShadow: c.shadow,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => (window.location.href = "/home")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: `1px solid ${c.btnBorder}`,
              borderRadius: "8px", padding: "6px 14px",
              color: c.btnColor, fontSize: "13px", fontWeight: 500, cursor: "pointer",
              transition: "background 0.15s",
            }}>
              <ArrowLeft size={14} />
              {t('tenant.backToHome')}
            </button>
            <ChevronRight size={14} color={c.muted} />
            <span style={{ fontSize: "13px", color: c.heading }}>{t('nav.tenant')}</span>
          </div>
{/* 
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "20px", padding: "5px 14px",
          }}>
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              animation: "pulse 2s infinite",
            }} />
            <span style={{ color: "#15803d", fontSize: "12px", fontWeight: 600 }}>Secure Session Active</span>
          </div> */}
        </div>

        {/* PAGE BODY */}
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 60px" }}>

          {/* PAGE HEADER */}
          <div style={{
            background: c.cardBg,
            borderRadius: "20px",
            border: `1px solid ${c.border}`,
            padding: "24px 28px",
            marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "20px", flexWrap: "wrap",
            boxShadow: c.shadow,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <GraduationCap size={22} color="#F15A22" />
              </div>
              <div>
                <h1 style={{ color: c.heading, fontSize: "17px", fontWeight: 700, margin: "0 0 3px" }}>
                  {t('tenant.title')}
                </h1>
                <p style={{ color: c.label, fontSize: "12px", margin: 0 }}>
                  {t('tenant.subtitle')}
                </p>
              </div>
            </div>
            {/* <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: "10px", padding: "8px 14px",
              fontSize: "12px", color: "#92400e", fontWeight: 500,
              maxWidth: "220px", lineHeight: 1.5,
            }}>
              ⚠ Restricted: Requires standard tenant organization mapping.
            </div> */}
          </div>

          {/* STATES */}
          {loading ? (
            <div style={{ background: c.cardBg, borderRadius: "16px", border: `1px solid ${c.border}`, padding: "60px", textAlign: "center" }}>
              <div style={{
                width: "40px", height: "40px", margin: "0 auto 16px",
                border: `3px solid ${isDark ? "#1E3A5F" : "#e0f2fe"}`, borderTop: "3px solid #F15A22",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ color: c.label, fontSize: "13px", margin: 0 }}>{t('tenant.fetching')}</p>
            </div>
          ) : error ? (
            <div style={{
              background: c.cardBg, borderRadius: "16px", border: `1px solid ${isDark ? "#7F1D1D" : "#fecaca"}`,
              padding: "24px", boxShadow: c.shadow,
            }}>
              <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 16px" }}>{error}</p>
              <button onClick={loadTenant} style={{
                padding: "8px 18px", background: isDark ? "#3B1C1C" : "#fef2f2",
                border: `1px solid ${isDark ? "#7F1D1D" : "#fecaca"}`,
                borderRadius: "8px", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}>{t('tenant.retry')}</button>
            </div>
          ) : tenant ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              <Section title={t('tenant.sessionClaims')} accent="#323393"
                icon={<Fingerprint size={15} color="#F15A22" />}>
                {[
                  { label: t('tenant.tenantId'),  value: tenant.tenantId,  id: "tid"  },
                  { label: t('tenant.clientId'),  value: tenant.clientId,  id: "cid"  },
                  { label: t('tenant.objectId'),  value: tenant.objectId,  id: "oid"  },
                  { label: t('tenant.name'),       value: tenant.name,      id: "name", mono: false },
                  { label: t('tenant.email'),      value: tenant.email,     id: "email" },
                  { label: t('tenant.username'),   value: tenant.username,  id: "uname" },
                ].map((r) => <Row key={r.id} {...r} />)}
              </Section>

              <Section title={t('tenant.identityMetadata')} accent="#F15A22"
                icon={<ShieldCheck size={15} color="#F15A22" />}>
                <Row label={t('tenant.provider')}     value={tenant.issuer}      id="issuer" />
                <Row label={t('tenant.displayName')}  value={tenant.displayName} id="dname"  mono={false} />
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 0", gap: "12px",
                }}>
                  <span style={{ color: c.label, fontSize: "13px", fontWeight: 500 }}>{t('tenant.idTokenClaims')}</span>
                  <span style={{
                    fontSize: "12px", padding: "3px 12px", borderRadius: "20px", fontWeight: 600,
                    ...(tenant.idTokenClaims
                      ? { color: "#22C55E" }
                      : { color: "red" }
                    ),
                  }}>
                    {tenant.idTokenClaims ? t('tenant.loaded') : t('tenant.noneLabel')}
                  </span>
                </div>
              </Section>

              {tenant.graphProfile && (
                <Section title={t('tenant.graphProfile')} accent="#F15A22"
                  icon={<User size={15} color="#F15A22" />}>
                  {[
                    { label: t('tenant.displayName'),   value: tenant.graphProfile.displayName,       id: "gdn",  mono: false },
                    { label: t('tenant.principalName'), value: tenant.graphProfile.userPrincipalName, id: "gpn"  },
                    { label: t('tenant.mailAddress'),   value: tenant.graphProfile.mail,              id: "gml"  },
                    { label: t('tenant.jobTitle'),      value: tenant.graphProfile.jobTitle,          id: "gjt", mono: false },
                  ].map((r) => <Row key={r.id} {...r} />)}
                </Section>
              )}

              {tenant.armTenant && (
                <Section title={t('tenant.armResponse')} accent="#F15A22"
                  icon={<Network size={15} color="#F15A22" />}>
                  <div style={{ marginTop: "10px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${c.border}` }}>
                    <div style={{
                      background: "#1e293b",
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56", flexShrink: 0 }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
                      <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "11px", color: "#94A3B8" }}>
                        tenant_response.json
                      </span>
                      <span style={{
                        marginLeft: "auto", fontSize: "10px", fontFamily: "monospace",
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "4px", padding: "2px 7px", color: "#94A3B8", letterSpacing: "0.05em",
                      }}>READ_ONLY</span>
                    </div>
                    <pre style={{
                      background: "#19191a", margin: 0,
                      padding: "16px", fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: "12px", color: "#4ade80", lineHeight: 1.7,
                      overflowX: "auto", maxHeight: "300px",
                    }}>
                      {JSON.stringify(tenant.armTenant, null, 2)}
                    </pre>
                  </div>
                </Section>
              )}

            </div>
          ) : (
            <div style={{
              background: c.cardBg, borderRadius: "16px", border: `1px solid ${c.border}`,
              padding: "60px", textAlign: "center", color: c.label, fontSize: "13px",
            }}>
              {t('tenant.noTenant')}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default TenantPage;
