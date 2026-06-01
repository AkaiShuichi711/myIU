import { useUserContext } from "@/context/AuthContext";
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert, Fingerprint, Network, User, GraduationCap, Copy, CheckCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const TenantPage = () => {
  const { getTenantData, isAuthenticated } = useUserContext();
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
      setError("Failed to load tenant data. This may require admin permissions or a valid Microsoft session.");
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

  const Row = ({ label, value, id, mono = true }: { label: string; value?: string; id: string; mono?: boolean }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: "1px solid #ffffff", gap: "12px",
    }}>
      <span style={{ color: "#0F172A", fontSize: "13px", fontWeight: 500, flexShrink: 0, minWidth: "130px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        {value ? (
          <>
            <span style={{
              fontFamily: mono ? "'SF Mono', 'Fira Code', monospace" : "inherit",
              fontSize: "13px", color: "#1e3a5f", fontWeight: mono ? 500 : 600,
              background: "transparent",
              border: "0",
              padding: "0",
              borderRadius: "6px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: "340px",
            }} title={value}>{value}</span>
            <button onClick={() => copy(value, id)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "3px",
              color: copied === id ? "#10b981" : "#cbd5e1",
              display: "flex", alignItems: "center", flexShrink: 0,
              transition: "color 0.2s",
            }}>
              {copied === id ? <CheckCheck size={13} /> : <Copy size={13} />}
            </button>
          </>
        ) : (
          <span style={{ color: "#cbd5e1", fontSize: "13px" }}>—</span>
        )}
      </div>
    </div>
  );

  const Section = ({ icon, title, accent, children }: {
    icon: React.ReactNode; title: string; accent: string; children: React.ReactNode;
  }) => (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "14px 20px",
        borderBottom: "1px solid #ffffff",
        background: "linear-gradient(to right, #f8fafc, #fff)",
      }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "8px",
          background: `${accent}15`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#09090B", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "4px 20px 8px" }}>{children}</div>
    </div>
  );

  const unauthContent = (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "48px 40px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)", maxWidth: "400px", width: "100%", textAlign: "center",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "14px",
          background: "#fff0f0", border: "1px solid #fecaca",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <ShieldAlert size={24} color="#ef4444" />
        </div>
        <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>
          Authentication Required
        </h3>
        <p style={{ color: "#09090B", fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px" }}>
          Sign in with your institution account to access secure tenant directory information.
        </p>
        <button onClick={() => (window.location.href = "/sign-in")} style={{
          width: "100%", padding: "12px",
          background: "linear-gradient(135deg, #009cd1, #0078d4)",
          border: "none", borderRadius: "12px",
          color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer",
        }}>
          Sign In with Microsoft
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* Left cyan panel */}
        <div style={{
          width: "40%", minHeight: "100vh", flexShrink: 0,
          background: "linear-gradient(160deg, #00b4d8 0%, #009cd1 40%, #0077b6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px",
        }}>
          <div style={{ color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-2px", opacity: 0.15, marginBottom: "12px" }}>myIU</div>
            <p style={{ fontSize: "13px", opacity: 0.7, lineHeight: 1.6 }}>
              International University<br />Secure Tenant Portal
            </p>
          </div>
        </div>
        {/* Right panel */}
        <div style={{
          flex: 1, background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "40px",
        }}>
          {unauthContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex" }}>

      <div style={{
        width: "6px", flexShrink: 0,
        // background: "linear-gradient(180deg, #00b4d8 0%, #1E3A5F 50%, #0077b6 100%)",
        background: "#ffffff", borderBottom: "1px solid #e2e8f0",
      }} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, background: "#ffffff", overflowY: "auto" }}>

        {/* TOP BAR */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 32px",
          height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => (window.location.href = "/home")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "6px 14px",
              color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer",
              transition: "background 0.15s",
            }}>
              <ArrowLeft size={14} />
              Back to Home
            </button>
            <ChevronRight size={14} color="#cbd5e1" />
            <span style={{ fontSize: "13px", color: "#0F172A" }}>Tenant</span>
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
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            padding: "24px 28px",
            marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "20px", flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                border: "1px solid #7dd3fc",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <GraduationCap size={22} color="#0284c7" />
              </div>
              <div>
                <h1 style={{ color: "#0f172a", fontSize: "17px", fontWeight: 700, margin: "0 0 3px" }}>
                  Tenant Information
                </h1>
                <p style={{ color: "#0F172A", fontSize: "12px", margin: 0 }}>
                  Azure Resource Manager (ARM) · Microsoft Graph endpoint ecosystem analysis
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
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "60px", textAlign: "center" }}>
              <div style={{
                width: "40px", height: "40px", margin: "0 auto 16px",
                border: "3px solid #e0f2fe", borderTop: "3px solid #009cd1",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ color: "#0F172A", fontSize: "13px", margin: 0 }}>Fetching environment metadata...</p>
            </div>
          ) : error ? (
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #fecaca",
              padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 16px" }}>{error}</p>
              <button onClick={loadTenant} style={{
                padding: "8px 18px", background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}>Retry Connection</button>
            </div>
          ) : tenant ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              <Section title="Session / Tenant Claims" accent="#323393"
                icon={<Fingerprint size={15} color="#6366f1" />}>
                {[
                  { label: "Tenant ID",  value: tenant.tenantId,  id: "tid"  },
                  { label: "Client ID",  value: tenant.clientId,  id: "cid"  },
                  { label: "Object ID",  value: tenant.objectId,  id: "oid"  },
                  { label: "Name",       value: tenant.name,      id: "name", mono: false },
                  { label: "Email",      value: tenant.email,     id: "email" },
                  { label: "Username",   value: tenant.username,  id: "uname" },
                ].map((r) => <Row key={r.id} {...r} />)}
              </Section>

              <Section title="Identity Metadata" accent="#009cd1"
                icon={<ShieldCheck size={15} color="#0284c7" />}>
                <Row label="Provider"      value={tenant.issuer}      id="issuer" />
                <Row label="Display Name"  value={tenant.displayName} id="dname"  mono={false} />
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 0", gap: "12px",
                }}>
                  <span style={{ color: "#0F172A", fontSize: "13px", fontWeight: 500 }}>ID Token Claims</span>
                  <span style={{
                    fontSize: "12px", padding: "3px 12px", borderRadius: "20px", fontWeight: 600,
                    ...(tenant.idTokenClaims
                      ? { color: "#22C55E" }
                      : { color: "red" }
                    ),
                  }}>
                    {tenant.idTokenClaims ? "Loaded" : "None"}
                  </span>
                </div>
              </Section>

              {tenant.graphProfile && (
                <Section title="Microsoft Graph Profile" accent="#009cd1"
                  icon={<User size={15} color="#0284c7" />}>
                  {[
                    { label: "Display Name",   value: tenant.graphProfile.displayName,       id: "gdn",  mono: false },
                    { label: "Principal Name", value: tenant.graphProfile.userPrincipalName, id: "gpn"  },
                    { label: "Mail Address",   value: tenant.graphProfile.mail,              id: "gml"  },
                    { label: "Job Title",      value: tenant.graphProfile.jobTitle,          id: "gjt", mono: false },
                  ].map((r) => <Row key={r.id} {...r} />)}
                </Section>
              )}

              {tenant.armTenant && (
                <Section title="ARM Tenant Response" accent="#009cd1"
                  icon={<Network size={15} color="#0284c7" />}>
                  <div style={{ marginTop: "10px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <div style={{
                      background: "#1e293b",
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56", flexShrink: 0 }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
                      <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "11px", color: "#09090B" }}>
                        tenant_response.json
                      </span>
                      <span style={{
                        marginLeft: "auto", fontSize: "10px", fontFamily: "monospace",
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "4px", padding: "2px 7px", color: "#09090B", letterSpacing: "0.05em",
                      }}>READ_ONLY</span>
                    </div>
                    <pre style={{
                      background: "#0f172a", margin: 0,
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
              background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
              padding: "60px", textAlign: "center", color: "#0F172A", fontSize: "13px",
            }}>
              No active directory tenant configuration discoverable.
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
