import { useUserContext } from "@/context/AuthContext";
import { ArrowLeft, User, Briefcase, ShieldAlert, GraduationCap, Copy, CheckCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const { getProfileData, isAuthenticated } = useUserContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  // const { user } = useUserContext();

  useEffect(() => {
    if (isAuthenticated) loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfileData();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile data from Microsoft Graph API.");
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

  // Initials avatar
  const initials = profile?.displayName
    ? profile.displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (!isAuthenticated) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <div style={{
          width: "40%", minHeight: "100vh", flexShrink: 0,
          background: "linear-gradient(160deg, #00b4d8 0%, #1E3A5F 40%, #0077b6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "40px",
        }}>
          <div style={{ color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-2px", opacity: 0.15, marginBottom: "12px" }}>myIU</div>
            <p style={{ fontSize: "13px", opacity: 0.7, lineHeight: 1.6 }}>International University<br />Secure Student Portal</p>
          </div>
        </div>
        <div style={{ flex: 1, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
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
            <h3 style={{ color: "#1E3A5F", fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Session Expired</h3>
            <p style={{ color: "#09090B", fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px" }}>
              Please sign in with your Microsoft account to securely query identity details.
            </p>
            <button onClick={() => (window.location.href = "/sign-in")} style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg, #1E3A5F, #0078d4)",
              border: "none", borderRadius: "12px",
              color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer",
            }}>
              Sign In to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex" }}>

      {/* LEFT CYAN STRIP */}
      <div style={{
        width: "6px", flexShrink: 0,
        // background: "linear-gradient(180deg, #00b4d8 0%, #1E3A5F 50%, #0077b6 100%)",
        background: "#ffffff", borderBottom: "1px solid #e2e8f0",
      }} />

      {/* MAIN */}
      <div style={{ flex: 1, background: "#ffffff", overflowY: "auto" }}>

        {/* TOP BAR */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "0 32px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => (window.location.href = "/home")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "1px solid #e2e8f0", borderRadius: "8px",
              padding: "6px 14px", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}>
              <ArrowLeft size={14} /> Back to Home
            </button>
            <ChevronRight size={14} color="#cbd5e1" />
            <span style={{ fontSize: "13px", color: "#0f172a" }}>Profile</span>
          </div>

        </div>

        {/* BODY */}
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px 60px" }}>

          {/* PROFILE HEADER CARD */}
          <div style={{
            background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0",
            padding: "24px 28px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Avatar */}
            <div style={{
              width: "64px", height: "64px", borderRadius: "18px", flexShrink: 0,
              background: "linear-gradient(135deg, #1E3A5F, #323393)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "22px",
              boxShadow: "0 4px 16px rgba(50,51,147,0.25)",
            }}>
              {profile?.displayName ? initials : <User size={26} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <GraduationCap size={16} color="#1E3A5F" />
                <h1 style={{ color: "#1E3A5F", fontSize: "17px", fontWeight: 700, margin: 0 }}>
                  University Student Profile
                </h1>
              </div>
              <p style={{ color: "#0f172a", fontSize: "12px", margin: 0, fontFamily: "monospace" }}>
                Microsoft Identity Platform · Graph API Integration
              </p>
            </div>
          </div>

          {/* STATES */}
          {loading ? (
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
              padding: "60px", textAlign: "center",
            }}>
              <div style={{
                width: "40px", height: "40px", margin: "0 auto 16px",
                border: "3px solid #e0f2fe", borderTop: "3px solid #1E3A5F",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ color: "#0f172a", fontSize: "13px", margin: 0 }}>Resolving organizational tokens...</p>
            </div>
          ) : error ? (
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #fecaca",
              padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <p style={{ color: "#dc2626", fontSize: "14px", margin: "0 0 16px" }}>{error}</p>
              <button onClick={loadProfile} style={{
                padding: "8px 18px", background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}>Retry Connection</button>
            </div>
          ) : profile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* INFO CARD */}
              <div style={{
                background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
                overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  padding: "14px 20px", borderBottom: "1px solid #ffffff",
                  background: "linear-gradient(to right, #f8fafc, #fff)",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: "#e0f2fe", border: "1px solid #7dd3fc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <User size={15} color="#0284c7" />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#09090B", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Identity Information
                  </span>
                </div>

                <div style={{ padding: "4px 20px 8px" }}>
                  {[
                    { label: "Display Name", value: profile.displayName, id: "dn", mono: false },
                    { label: "User Principal Name", value: profile.userPrincipalName, id: "upn", mono: true },
                    { label: "Given Name", value: profile.givenName, id: "gn", mono: false },
                    { label: "Surname", value: profile.surname, id: "sn", mono: false },
                  ].map(({ label, value, id, mono }) => (
                    <div key={id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 0", borderBottom: "1px solid #ffffff", gap: "12px",
                    }}>
                      <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 500, flexShrink: 0, minWidth: "150px" }}>
                        {label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        {value ? (
                          <>
                            <span style={{
                              fontFamily: mono ? "'SF Mono','Sans-serif',monospace" : "inherit",
                              fontSize: "13px", color: "#1E3A5F", fontWeight: mono ? 500 : 600,
                              background: "transparent",
                              border: "none",
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
                  ))}
                </div>
              </div>

              {/* JOB TITLE CARD */}
              <div style={{
                background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
                overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  padding: "14px 20px", borderBottom: "1px solid #ffffff",
                  background: "linear-gradient(to right, #f8fafc, #fff)",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: "#ede9fe", border: "1px solid #c4b5fd",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Briefcase size={15} color="#7c3aed" />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#09090B", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Organizational Position
                  </span>
                </div>

                <div style={{ padding: "4px 20px 8px" }}>
                  {[
                    { label: "Job Title", value: profile.jobTitle || "Student / International University", id: "jt", mono: false },
                    { label: "Mail", value: profile.mail, id: "ml", mono: true },
                  ].map(({ label, value, id, mono }) => (
                    <div key={id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 0", borderBottom: "1px solid #ffffff", gap: "12px",
                    }}>
                      <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 500, flexShrink: 0, minWidth: "150px" }}>
                        {label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        {value ? (
                          <>
                            <span style={{
                              fontFamily: mono ? "'SF Mono','Sans-serif',monospace" : "inherit",
                              fontSize: "13px", color: "#1E3A5F", fontWeight: mono ? 500 : 600,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "340px",
                            }} title={value}>{value}</span>
                            <button onClick={() => copy(value, id)} style={{
                              background: "none", border: "none", cursor: "pointer", padding: "3px",
                              color: copied === id ? "#10b981" : "#cbd5e1",
                              display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.2s",
                            }}>
                              {copied === id ? <CheckCheck size={13} /> : <Copy size={13} />}
                            </button>
                          </>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: "13px" }}>—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0",
              padding: "60px", textAlign: "center", color: "#0f172a", fontSize: "13px",
            }}>
              No active registry parameters metadata returned.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProfilePage;
